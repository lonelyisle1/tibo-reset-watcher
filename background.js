import {
  ALARM_NAME,
  BACKFILL_GAP_MINUTES,
  BACKFILL_MAX_DURATION_MS,
  BACKFILL_MAX_SCROLLS,
  buildBackfillSegments,
  CHECK_STALE_AFTER_MS,
  CHECK_WATCHDOG_ALARM,
  DEFAULT_RUNTIME_STATE,
  DEFAULT_SETTINGS,
  FAILURE_NOTICE_THRESHOLD,
  LOOKBACK_HOURS,
  MAX_HISTORY_ITEMS,
  MONITOR_URL,
  PROFILE_URL,
  PROFILE_WITH_REPLIES_URL,
  QUICK_MAX_DURATION_MS,
  QUICK_MAX_SCROLLS,
  RETRY_ALARM,
  SEARCH_QUERY,
  SYSTEM_NOTICE_COOLDOWN_MS
} from "./lib/config.js";
import { classifyPost } from "./lib/classifier.js";
import { mergeMatchedPostTypes, summarizeMatchedPostTypes } from "./lib/check-stats.js";
import { getUiLocale, tr } from "./lib/i18n.js";
import { mergeRecentObservations, pruneRecentObservations, summarizeRecentObservations } from "./lib/rolling-observations.js";
import { buildPostNotification, systemNotification } from "./lib/notification.js";
import { needsBackfill, pruneProcessedIds } from "./lib/state-utils.js";

async function getSettings() {
  const { settings } = await chrome.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

async function getRuntimeState() {
  const { runtimeState } = await chrome.storage.local.get("runtimeState");
  return { ...DEFAULT_RUNTIME_STATE, ...(runtimeState || {}) };
}

async function saveRuntime(patch) {
  const current = await getRuntimeState();
  const next = { ...current, ...patch };
  await chrome.storage.local.set({ runtimeState: next });
  return next;
}

async function ensureDefaults() {
  const stored = await chrome.storage.local.get([
    "settings", "runtimeState", "processedPostIds", "processedPostMeta", "seenIds", "history",
    "recentObservedPosts", "recentObservationRuleFingerprint"
  ]);
  const legacyRuntime = stored.runtimeState || {};
  const runtimeState = {
    ...DEFAULT_RUNTIME_STATE,
    ...legacyRuntime,
    lastSuccessfulCheckAt: legacyRuntime.lastSuccessfulCheckAt || legacyRuntime.lastCheckedAt || null,
    lastAttemptAt: legacyRuntime.lastAttemptAt || legacyRuntime.lastCheckedAt || null,
    lastSeenPostId: legacyRuntime.lastSeenPostId || null,
    monitoringStatus: legacyRuntime.monitoringStatus || (legacyRuntime.lastStatus === "stopped" ? "paused" : "starting")
  };
  delete runtimeState.lastCheckedAt;
  delete runtimeState.lastStatus;
  delete runtimeState.initialized;
  delete runtimeState.postsSeenOnLastScan;

  await chrome.storage.local.set({
    settings: { ...DEFAULT_SETTINGS, ...(stored.settings || {}) },
    runtimeState,
    processedPostIds: stored.processedPostIds || stored.seenIds || [],
    processedPostMeta: stored.processedPostMeta || {},
    history: (stored.history || []).slice(0, MAX_HISTORY_ITEMS),
    recentObservedPosts: stored.recentObservedPosts || {},
    recentObservationRuleFingerprint: stored.recentObservationRuleFingerprint || null
  });
  if (stored.seenIds) await chrome.storage.local.remove("seenIds");
}

function observationRuleFingerprint(settings) {
  return JSON.stringify({
    notifyRuleChanges: settings.notifyRuleChanges !== false,
    supplementalTerms: [...(settings.supplementalTerms || [])].map((term) => String(term).trim().toLowerCase()).filter(Boolean).sort()
  });
}

async function updateRecentObservationCache(posts, settings) {
  const stored = await chrome.storage.local.get(["recentObservedPosts", "recentObservationRuleFingerprint"]);
  const fingerprint = observationRuleFingerprint(settings);
  const starting = stored.recentObservationRuleFingerprint === fingerprint ? (stored.recentObservedPosts || {}) : {};
  const recentObservedPosts = mergeRecentObservations(starting, posts, settings, Date.now(), LOOKBACK_HOURS);
  await chrome.storage.local.set({ recentObservedPosts, recentObservationRuleFingerprint: fingerprint });
  return recentObservedPosts;
}

async function ensureAlarm() {
  const settings = await getSettings();
  const existing = await chrome.alarms.get(ALARM_NAME);
  if (!settings.enabled) {
    if (existing) await chrome.alarms.clear(ALARM_NAME);
    return;
  }
  const interval = Math.max(0.5, Number(settings.intervalMinutes) || 2);
  if (!existing || existing.periodInMinutes !== interval) {
    await chrome.alarms.create(ALARM_NAME, { delayInMinutes: 0.5, periodInMinutes: interval });
  }
}

async function armCheckWatchdog(delayMs = CHECK_STALE_AFTER_MS) {
  await chrome.alarms.create(CHECK_WATCHDOG_ALARM, {
    when: Date.now() + Math.max(5_000, delayMs)
  });
}

function monitorUrlType(rawUrl = "") {
  try {
    const url = new URL(rawUrl);
    if (url.hostname !== "x.com") return null;
    if (url.pathname === "/search" && url.searchParams.get("q")?.toLocaleLowerCase().startsWith(SEARCH_QUERY)) return "search";
    if (url.pathname.toLocaleLowerCase() === "/thsottiaux/with_replies") return "profile";
    return null;
  } catch {
    return null;
  }
}

const isMonitorUrl = (rawUrl) => Boolean(monitorUrlType(rawUrl));

async function findMonitorTab() {
  const runtimeState = await getRuntimeState();
  if (runtimeState.monitorTabId) {
    try {
      const tab = await chrome.tabs.get(runtimeState.monitorTabId);
      if (isMonitorUrl(tab.url)) return tab;
    } catch {
      // The previously saved tab no longer exists.
    }
  }
  const candidates = await chrome.tabs.query({ url: ["https://x.com/search*", "https://x.com/thsottiaux/with_replies*"] });
  return candidates.find((tab) => isMonitorUrl(tab.url)) || null;
}

async function ensureMonitorTab({ focus = false } = {}) {
  let tab = await findMonitorTab();
  if (!tab) {
    tab = await chrome.tabs.create({ url: MONITOR_URL, active: focus, pinned: true });
  } else {
    const changes = {};
    if (!tab.pinned) changes.pinned = true;
    if (focus) changes.active = true;
    if (Object.keys(changes).length) tab = await chrome.tabs.update(tab.id, changes);
  }
  await saveRuntime({ monitorTabId: tab.id });
  return tab;
}

function newCheck(reason, mode, runtimeState) {
  const now = Date.now();
  const segments = mode === "backfill" ? buildBackfillSegments(now, LOOKBACK_HOURS) : [];
  const firstSegment = segments[0] || null;
  return {
    requestId: `${now}-${crypto.randomUUID()}`,
    stageId: crypto.randomUUID(),
    reason,
    checkKind: mode,
    mode: mode === "backfill" ? "segment" : "quick",
    startedAt: new Date(now).toISOString(),
    cutoffAt: new Date(now - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString(),
    lookbackHours: LOOKBACK_HOURS,
    stopPostId: mode === "quick" ? runtimeState.lastSeenPostId : null,
    maxScrolls: mode === "backfill" ? BACKFILL_MAX_SCROLLS : QUICK_MAX_SCROLLS,
    maxDurationMs: mode === "backfill" ? BACKFILL_MAX_DURATION_MS : QUICK_MAX_DURATION_MS,
    sourceStage: mode === "backfill" ? "segment" : "search",
    fallbackAttempted: false,
    sourceResults: [],
    segments,
    segmentIndex: 0,
    currentSegment: firstSegment,
    targetUrl: firstSegment?.url || MONITOR_URL,
    collectedPostIds: [],
    matchedPostTypes: {},
    stagePostIds: [],
    stageMatchedPostTypes: {},
    stageStartedAt: new Date(now).toISOString(),
    stageLastActivityAt: new Date(now).toISOString(),
    stageRetryCount: 0
  };
}

async function markStaleCheckIfNeeded() {
  const state = await getRuntimeState();
  if (!state.activeCheck) return state;
  const started = Date.parse(state.activeCheck.stageLastActivityAt || state.activeCheck.stageStartedAt || state.activeCheck.startedAt || "");
  if (Number.isFinite(started) && Date.now() - started <= CHECK_STALE_AFTER_MS) return state;
  return recordFailure("scan_timeout", tr("errorScanTimeout", {}, getUiLocale()), state.activeCheck.requestId);
}

async function startCheck({ reason, fullBackfill = false, focus = false } = {}) {
  await ensureDefaults();
  const settings = await getSettings();
  if (!settings.enabled) return { ok: false, skipped: "monitoring_paused" };

  const runtimeState = await markStaleCheckIfNeeded();
  if (runtimeState.activeCheck) return { ok: true, alreadyRunning: true, activeCheck: runtimeState.activeCheck };

  const check = newCheck(reason || "scheduled", fullBackfill ? "backfill" : "quick", runtimeState);
  await saveRuntime({
    activeCheck: check,
    lastAttemptAt: check.startedAt,
    monitoringStatus: "checking",
    lastError: null
  });

  try {
    const tab = await ensureMonitorTab({ focus });
    await chrome.tabs.update(tab.id, { url: check.targetUrl, active: focus, pinned: true });
    await armCheckWatchdog();
    return { ok: true, check };
  } catch (error) {
    await recordFailure("monitor_tab_error", tr("errorMonitorTab", { detail: error.message }, getUiLocale()), check.requestId);
    return { ok: false, error: error.message };
  }
}

function newestPost(posts) {
  return [...posts].sort((a, b) => Date.parse(b.publishedAt || "") - Date.parse(a.publishedAt || ""))[0] || null;
}

function completionReasonText(reason) {
  const locale = getUiLocale();
  const mapping = {
    no_more_visible_results: "reasonNoMore", segment_results_exhausted: "reasonSegmentExhausted",
    segment_no_readable_results: "reasonSegmentUnreadable", stage_timeout: "reasonStageTimeout",
    explicit_empty_results: "reasonEmpty", all_date_segments_exhausted: "reasonAllSegments",
    scroll_safety_limit: "reasonScrollLimit", time_safety_limit: "reasonTimeLimit", no_posts_visible: "reasonNoPosts"
  };
  if (String(reason || "").startsWith("profile_fallback_failed:")) return tr("reasonProfileFailed", {}, locale);
  return mapping[reason] ? tr(mapping[reason], {}, locale) : reason || tr("reasonUnknown", {}, locale);
}

async function processPostBatch(posts, checkContext = {}) {
  if (!Array.isArray(posts) || posts.length === 0) return;
  const settings = await getSettings();
  if (!settings.enabled) return;

  const stored = await chrome.storage.local.get(["processedPostIds", "processedPostMeta", "history", "runtimeState"]);
  const processedIds = [...(stored.processedPostIds || [])];
  const processed = new Set(processedIds);
  const processedMeta = { ...(stored.processedPostMeta || {}) };
  const history = [...(stored.history || [])];
  const detectedAt = new Date().toISOString();
  let newestRelevantNotification = null;

  const chronological = [...posts].sort((a, b) => Date.parse(a.publishedAt || "") - Date.parse(b.publishedAt || ""));
  for (const post of chronological) {
    if (!post?.id || processed.has(post.id)) continue;
    processed.add(post.id);
    processedIds.push(post.id);
    processedMeta[post.id] = { processedAt: detectedAt, publishedAt: post.publishedAt || null };

    const classification = classifyPost(post.text, settings);
    if (!classification.relevant) continue;

    const notification = buildPostNotification(post, classification, detectedAt);
    const event = {
      ...post,
      classification,
      detectedAt,
      delayed: notification.age.delayed,
      ageBand: notification.age.band,
      ageLabel: notification.age.label,
      checkReason: checkContext.reason || "unknown"
    };
    history.unshift(event);

    if (notification.shouldNotify) {
      await chrome.notifications.create(`post:${post.id}`, notification.options);
      newestRelevantNotification = event;
    }
  }

  const newest = newestPost(posts);
  const existingNewestAt = Date.parse(stored.runtimeState?.lastSeenPostPublishedAt || "");
  const candidateAt = Date.parse(newest?.publishedAt || "");
  const shouldUpdateLastSeen = newest && (!Number.isFinite(existingNewestAt) || !Number.isFinite(candidateAt) || candidateAt >= existingNewestAt);
  const pruned = pruneProcessedIds(processedIds, processedMeta);

  await chrome.storage.local.set({
    ...pruned,
    history: history.slice(0, MAX_HISTORY_ITEMS),
    runtimeState: {
      ...DEFAULT_RUNTIME_STATE,
      ...(stored.runtimeState || {}),
      ...(shouldUpdateLastSeen ? {
        lastSeenPostId: newest.id,
        lastSeenPostPublishedAt: newest.publishedAt || stored.runtimeState?.lastSeenPostPublishedAt || null
      } : {})
    }
  });

  if (newestRelevantNotification?.classification?.level === "urgent") {
    await chrome.action.setBadgeText({ text: "!" });
    await chrome.action.setBadgeBackgroundColor({ color: "#d92d20" });
  }
}

async function maybeSendSystemNotice(kind, detail = "") {
  const state = await getRuntimeState();
  const lastSent = Date.parse(state.systemNoticeState?.[kind] || "");
  if (Number.isFinite(lastSent) && Date.now() - lastSent < SYSTEM_NOTICE_COOLDOWN_MS) return;
  await chrome.notifications.create(`system:${kind}`, systemNotification(kind, detail));
  await saveRuntime({
    systemNoticeState: { ...(state.systemNoticeState || {}), [kind]: new Date().toISOString() }
  });
}

async function recordFailure(errorCode, errorMessage, requestId = null) {
  const state = await getRuntimeState();
  if (requestId && state.activeCheck?.requestId && state.activeCheck.requestId !== requestId) return state;
  const failures = (state.consecutiveFailures || 0) + 1;
  const loginRequired = errorCode === "login_required";
  const next = await saveRuntime({
    activeCheck: null,
    monitoringStatus: loginRequired ? "login_required" : "error",
    xLoginStatus: loginRequired ? "expired" : state.xLoginStatus,
    lastError: `${errorCode}: ${errorMessage}`,
    consecutiveFailures: failures
  });
  await chrome.alarms.clear(CHECK_WATCHDOG_ALARM);
  if (loginRequired) await maybeSendSystemNotice("login_required");
  if (failures >= FAILURE_NOTICE_THRESHOLD) await maybeSendSystemNotice("repeated_failure", errorMessage);
  return next;
}

async function finishScan(requestId, result, stageId = null) {
  const state = await getRuntimeState();
  if (!state.activeCheck || state.activeCheck.requestId !== requestId) return;
  if (stageId && state.activeCheck.stageId && state.activeCheck.stageId !== stageId) return;
  await chrome.alarms.clear(CHECK_WATCHDOG_ALARM);
  const check = state.activeCheck;
  let partialFallbackFailure = false;
  let partialSegmentFailure = false;

  if (!result?.ok) {
    if (check.sourceStage === "profile" && check.sourceResults?.some((item) => item.ok)) {
      partialFallbackFailure = true;
      result = {
        ...result,
        ok: true,
        complete: false,
        completionReason: `profile_fallback_failed:${result.errorCode || "unknown"}`,
        postsFound: 0,
        scrolls: 0
      };
    } else if (check.sourceStage === "segment" && result?.errorCode !== "login_required") {
      partialSegmentFailure = true;
      result = {
        ...result,
        ok: true,
        complete: false,
        completionReason: result.errorCode === "stage_timeout" ? "stage_timeout" : "segment_no_readable_results",
        postsFound: 0,
        scrolls: result.scrolls || 0
      };
    } else {
      await recordFailure(result?.errorCode || "scan_failed", result?.error || tr("errorCheckFailed", {}, getUiLocale()), requestId);
      return;
    }
  }

  const sourceResult = {
    source: check.sourceStage || result.pageSource || "search",
    segment: check.currentSegment || null,
    ok: Boolean(result.ok) && !partialFallbackFailure && !partialSegmentFailure,
    complete: Boolean(result.complete),
    completionReason: result.completionReason,
    postsFound: result.postsFound || 0,
    scrolls: result.scrolls || 0,
    oldestSeenAt: result.oldestSeenAt || null,
    newestSeenAt: result.newestSeenAt || null
  };
  const stageMatches = summarizeMatchedPostTypes(check.stageMatchedPostTypes || {});
  sourceResult.uniquePostsFound = check.stagePostIds?.length || result.postsFound || 0;
  sourceResult.relevantPostsFound = stageMatches.relevantPostsFound;
  sourceResult.resetPostsFound = stageMatches.resetPostsFound;
  const sourceResults = [...(check.sourceResults || []), sourceResult];

  if (check.sourceStage === "segment") {
    const nextSegmentIndex = (check.segmentIndex || 0) + 1;
    const nextSegment = check.segments?.[nextSegmentIndex];
    if (nextSegment) {
      const nextCheck = {
        ...check,
        stageId: crypto.randomUUID(),
        mode: "segment",
        sourceStage: "segment",
        sourceResults,
        segmentIndex: nextSegmentIndex,
        currentSegment: nextSegment,
        targetUrl: nextSegment.url,
        stageStartedAt: new Date().toISOString(),
        stageLastActivityAt: new Date().toISOString(),
        stageRetryCount: 0,
        stagePostIds: [],
        stageMatchedPostTypes: {},
        progress: null
      };
      await saveRuntime({ activeCheck: nextCheck, monitoringStatus: "checking" });
      try {
        const tab = await ensureMonitorTab();
        await chrome.tabs.update(tab.id, { url: nextSegment.url, active: false, pinned: true });
        await armCheckWatchdog();
      } catch (error) {
        await recordFailure("segment_navigation_error", tr("errorSegmentNavigation", { detail: error.message }, getUiLocale()), requestId);
      }
      return;
    }

    const segmentResults = sourceResults.filter((item) => item.source === "segment");
    const allSegmentsComplete = segmentResults.length === (check.segments?.length || 0) &&
      segmentResults.every((item) => item.ok && item.complete);
    if (allSegmentsComplete) {
      result = { ...result, ok: true, complete: true, completionReason: "all_date_segments_exhausted" };
    } else {
      const fallbackCheck = {
        ...check,
        stageId: crypto.randomUUID(),
        mode: "backfill",
        sourceStage: "profile",
        fallbackAttempted: true,
        sourceResults,
        currentSegment: null,
        targetUrl: PROFILE_WITH_REPLIES_URL,
        stageStartedAt: new Date().toISOString(),
        stageLastActivityAt: new Date().toISOString(),
        stageRetryCount: 0,
        stagePostIds: [],
        stageMatchedPostTypes: {},
        progress: null
      };
      await saveRuntime({ activeCheck: fallbackCheck, monitoringStatus: "checking" });
      try {
        const tab = await ensureMonitorTab();
        await chrome.tabs.update(tab.id, { url: PROFILE_WITH_REPLIES_URL, active: false, pinned: true });
        await armCheckWatchdog();
      } catch (error) {
        await recordFailure("profile_fallback_error", tr("errorProfileFallback", { detail: error.message }, getUiLocale()), requestId);
      }
      return;
    }
  }

  if (check.checkKind === "backfill" && !result.complete && check.sourceStage === "search") {
    const fallbackCheck = {
      ...check,
      stageId: crypto.randomUUID(),
      mode: "backfill",
      sourceStage: "profile",
      fallbackAttempted: true,
      sourceResults,
      targetUrl: PROFILE_WITH_REPLIES_URL,
      stageStartedAt: new Date().toISOString(),
      stageLastActivityAt: new Date().toISOString(),
      stageRetryCount: 0,
      stagePostIds: [],
      stageMatchedPostTypes: {},
      progress: null
    };
    await saveRuntime({ activeCheck: fallbackCheck, monitoringStatus: "checking" });
    try {
      const tab = await ensureMonitorTab();
      await chrome.tabs.update(tab.id, { url: PROFILE_WITH_REPLIES_URL, active: false, pinned: true });
      await armCheckWatchdog();
    } catch (error) {
      await recordFailure("profile_fallback_error", tr("errorProfileFallback", { detail: error.message }, getUiLocale()), requestId);
    }
    return;
  }

  const finishedAt = new Date().toISOString();
  const activeCheck = check;
  const incomplete = activeCheck.checkKind === "backfill" && !result.complete;
  const matchSummary = summarizeMatchedPostTypes(activeCheck.matchedPostTypes || {});
  const observationStore = await chrome.storage.local.get("recentObservedPosts");
  const recentObservedPosts = pruneRecentObservations(observationStore.recentObservedPosts || {}, Date.now(), LOOKBACK_HOURS);
  const rollingKnown = summarizeRecentObservations(recentObservedPosts, Date.now(), LOOKBACK_HOURS);
  await chrome.storage.local.set({ recentObservedPosts });
  const summary = {
    from: activeCheck.cutoffAt,
    to: activeCheck.startedAt,
    completedAt: finishedAt,
    complete: Boolean(result.complete),
    completionReason: result.completionReason,
    postsFound: activeCheck.collectedPostIds?.length || 0,
    uniquePostsFound: activeCheck.collectedPostIds?.length || 0,
    scrolls: sourceResults.reduce((sum, item) => sum + (item.scrolls || 0), 0),
    oldestSeenAt: result.oldestSeenAt || null,
    newestSeenAt: result.newestSeenAt || null,
    sourceResults,
    dateSegments: activeCheck.segments?.length || 0,
    coverageMode: activeCheck.checkKind === "backfill" ? "date_segmented_best_effort" : "quick",
    rollingKnown,
    ...matchSummary
  };

  await saveRuntime({
    activeCheck: null,
    lastSuccessfulCheckAt: finishedAt,
    monitoringStatus: incomplete ? "degraded" : "normal",
    xLoginStatus: "signed_in",
    lastError: incomplete ? tr("errorBackfillIncomplete", { reason: completionReasonText(result.completionReason) }, getUiLocale()) : null,
    consecutiveFailures: 0,
    rollingKnown,
    ...(activeCheck.checkKind === "backfill" ? { lastBackfill: summary } : { lastQuickCheck: summary })
  });

  if (activeCheck.checkKind === "quick" && !result.complete) {
    await chrome.alarms.create(RETRY_ALARM, { when: Date.now() + 30_000 });
  }
}

async function shouldRunBackfill() {
  const state = await getRuntimeState();
  return needsBackfill(state.lastSuccessfulCheckAt, BACKFILL_GAP_MINUTES);
}

async function initialize(reason) {
  await ensureDefaults();
  if (reason === "extension_updated" || reason === "extension_installed") {
    await chrome.alarms.clear(CHECK_WATCHDOG_ALARM);
    await saveRuntime({ activeCheck: null });
  }
  await ensureAlarm();
  const settings = await getSettings();
  if (settings.enabled) await startCheck({ reason, fullBackfill: true });
}

chrome.runtime.onInstalled.addListener((details) => {
  initialize(details.reason === "update" ? "extension_updated" : "extension_installed");
});

chrome.runtime.onStartup.addListener(() => {
  initialize("edge_started");
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === CHECK_WATCHDOG_ALARM) {
    const state = await getRuntimeState();
    const check = state.activeCheck;
    if (!check) return;
    const lastActivity = Date.parse(check.stageLastActivityAt || check.stageStartedAt || check.startedAt || "");
    const idleMs = Number.isFinite(lastActivity) ? Date.now() - lastActivity : CHECK_STALE_AFTER_MS;
    if (idleMs < CHECK_STALE_AFTER_MS) {
      await armCheckWatchdog(CHECK_STALE_AFTER_MS - idleMs);
      return;
    }
    if ((check.stageRetryCount || 0) < 1) {
      const retriedAt = new Date().toISOString();
      const retryCheck = {
        ...check,
        stageId: crypto.randomUUID(),
        stageRetryCount: (check.stageRetryCount || 0) + 1,
        stageStartedAt: retriedAt,
        stageLastActivityAt: retriedAt,
        progress: null
      };
      await saveRuntime({ activeCheck: retryCheck, monitoringStatus: "checking" });
      try {
        const tab = await ensureMonitorTab();
        await chrome.tabs.reload(tab.id, { bypassCache: true });
        await armCheckWatchdog();
      } catch (error) {
        await finishScan(check.requestId, {
          ok: false,
          errorCode: "stage_timeout",
          error: tr("errorRetryFailed", { detail: error.message }, getUiLocale())
        }, retryCheck.stageId);
      }
      return;
    }
    await finishScan(check.requestId, {
      ok: false,
      errorCode: "stage_timeout",
      error: tr("errorNoProgress", {}, getUiLocale())
    }, check.stageId);
    return;
  }
  if (alarm.name === RETRY_ALARM) {
    await startCheck({ reason: "incomplete_quick_check_retry", fullBackfill: true });
    return;
  }
  if (alarm.name === ALARM_NAME) {
    await startCheck({ reason: "scheduled_alarm", fullBackfill: await shouldRunBackfill() });
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const state = await getRuntimeState();
  if (state.monitorTabId === tabId) await saveRuntime({ monitorTabId: null });
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId.startsWith("post:")) {
    const postId = notificationId.slice(5);
    await chrome.tabs.create({ url: `https://x.com/thsottiaux/status/${postId}`, active: true });
  } else if (notificationId.startsWith("system:")) {
    await ensureMonitorTab({ focus: true });
  }
  await chrome.notifications.clear(notificationId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message?.type) {
      case "CONTENT_READY": {
        const state = await getRuntimeState();
        const isMonitorTab = Boolean(sender.tab?.id && sender.tab.id === state.monitorTabId);
        sendResponse({ ok: true, activeCheck: isMonitorTab ? state.activeCheck : null });
        return;
      }
      case "POSTS_BATCH": {
        const state = await getRuntimeState();
        if (sender.tab?.id !== state.monitorTabId || message.requestId !== state.activeCheck?.requestId ||
            (message.stageId && state.activeCheck?.stageId && message.stageId !== state.activeCheck.stageId)) {
          sendResponse({ ok: false, ignored: "not_active_monitor_scan" });
          return;
        }
        const settings = await getSettings();
        await processPostBatch(message.posts, { reason: message.reason, mode: message.mode });
        await updateRecentObservationCache(message.posts || [], settings);
        const refreshed = await getRuntimeState();
        if (refreshed.activeCheck?.requestId === message.requestId &&
            (!message.stageId || !refreshed.activeCheck?.stageId || message.stageId === refreshed.activeCheck.stageId)) {
          const collectedPostIds = [...new Set([
            ...(refreshed.activeCheck.collectedPostIds || []),
            ...(message.posts || []).map((post) => String(post.id)).filter(Boolean)
          ])];
          const matchedPostTypes = mergeMatchedPostTypes(
            refreshed.activeCheck.matchedPostTypes || {},
            message.posts || [],
            settings
          );
          const stagePostIds = [...new Set([
            ...(refreshed.activeCheck.stagePostIds || []),
            ...(message.posts || []).map((post) => String(post.id)).filter(Boolean)
          ])];
          const stageMatchedPostTypes = mergeMatchedPostTypes(
            refreshed.activeCheck.stageMatchedPostTypes || {},
            message.posts || [],
            settings
          );
          await saveRuntime({
            activeCheck: {
              ...refreshed.activeCheck,
              collectedPostIds,
              matchedPostTypes,
              stagePostIds,
              stageMatchedPostTypes,
              stageLastActivityAt: new Date().toISOString()
            }
          });
          await armCheckWatchdog();
        }
        sendResponse({ ok: true });
        return;
      }
      case "SCAN_PROGRESS": {
        const state = await getRuntimeState();
        if (sender.tab?.id === state.monitorTabId && state.activeCheck?.requestId === message.requestId &&
            (!message.stageId || !state.activeCheck?.stageId || message.stageId === state.activeCheck.stageId)) {
          await saveRuntime({
            activeCheck: {
              ...state.activeCheck,
              progress: message.progress,
              stageLastActivityAt: new Date().toISOString()
            }
          });
          await armCheckWatchdog();
        }
        sendResponse({ ok: true });
        return;
      }
      case "SCAN_FINISHED":
        if (sender.tab?.id === (await getRuntimeState()).monitorTabId) {
          await finishScan(message.requestId, message.result, message.stageId);
        }
        sendResponse({ ok: true });
        return;
      case "POPUP_OPENED":
        sendResponse(await startCheck({ reason: "popup_opened", fullBackfill: true }));
        return;
      case "CHECK_NOW":
        sendResponse(await startCheck({ reason: "manual_check", fullBackfill: true }));
        return;
      case "START_MONITORING": {
        const settings = await getSettings();
        await chrome.storage.local.set({ settings: { ...settings, enabled: true } });
        await ensureAlarm();
        sendResponse(await startCheck({ reason: "monitoring_enabled", fullBackfill: true }));
        return;
      }
      case "STOP_MONITORING": {
        const settings = await getSettings();
        await chrome.storage.local.set({ settings: { ...settings, enabled: false } });
        await chrome.alarms.clear(ALARM_NAME);
        await chrome.alarms.clear(CHECK_WATCHDOG_ALARM);
        await chrome.alarms.clear(RETRY_ALARM);
        await saveRuntime({ activeCheck: null, monitoringStatus: "paused" });
        sendResponse({ ok: true });
        return;
      }
      case "OPEN_PROFILE":
        await chrome.tabs.create({ url: PROFILE_URL, active: true });
        sendResponse({ ok: true });
        return;
      case "OPEN_SEARCH":
        await chrome.tabs.create({ url: MONITOR_URL, active: true });
        sendResponse({ ok: true });
        return;
      case "TEST_NOTIFICATION":
        await chrome.notifications.create(`system:test:${Date.now()}:${crypto.randomUUID()}`, systemNotification("test"));
        sendResponse({ ok: true });
        return;
      case "SETTINGS_UPDATED":
        {
          const settings = await getSettings();
          const stored = await chrome.storage.local.get("recentObservationRuleFingerprint");
          const fingerprint = observationRuleFingerprint(settings);
          if (stored.recentObservationRuleFingerprint && stored.recentObservationRuleFingerprint !== fingerprint) {
            await chrome.storage.local.set({ recentObservedPosts: {}, recentObservationRuleFingerprint: fingerprint });
            await saveRuntime({ rollingKnown: null });
          }
        }
        await ensureAlarm();
        sendResponse({ ok: true });
        return;
      default:
        sendResponse({ ok: false, error: "unknown_message" });
    }
  })().catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

ensureDefaults().then(ensureAlarm);
