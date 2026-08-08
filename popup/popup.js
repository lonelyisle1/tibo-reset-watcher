import { detectBrowser, getLocaleTag, getUiLocale, localizeDocument, tr } from "../lib/i18n.js";

const browser = detectBrowser();
const locale = getUiLocale();
localizeDocument(document, browser, locale);
document.querySelector("#browser-subtitle").textContent = tr("localMonitoring", { browser: browser.name }, locale);
document.querySelector("#login-alert-body").textContent = tr("loginExpiredBody", { browser: browser.name }, locale);
document.querySelector("#browser-mark").textContent = browser.key === "edge" ? "E" : browser.key === "chrome" ? "C" : "B";
document.querySelector("#background-title").textContent = tr("backgroundTitle", { browser: browser.name }, locale);
document.querySelector("#background-body").textContent = tr(browser.key === "edge" ? "backgroundEdge" : "backgroundChrome", {}, locale);

const elements = Object.fromEntries([
  "status-pill", "status-detail", "monitoring-toggle", "progress", "progress-text",
  "login-alert", "error-alert", "error-title", "error-text", "last-success", "last-attempt",
  "success-age", "failure-count", "backfill-badge", "backfill-range", "backfill-result", "rolling-result",
  "x-login-status", "coverage-note", "check-now", "open-profile", "open-search",
  "test-notification", "latest-event", "history-list", "event-count", "open-options", "privacy-link", "diagnostics-list"
].map((id) => [id, document.querySelector(`#${id}`)]));

const STATUS_KEYS = {
  starting: ["statusStarting", "statusStartingDetail"],
  checking: ["statusChecking", "statusCheckingDetail"],
  normal: ["statusNormal", "statusNormalDetail"],
  degraded: ["statusDegraded", "statusDegradedDetail"],
  login_required: ["statusLogin", "statusLoginDetail"],
  error: ["statusError", "statusErrorDetail"],
  paused: ["statusPaused", "statusPausedDetail"]
};

const EVENT_KEYS = {
  upcoming_reset: "upcomingReset",
  possible_reset: "possibleReset",
  completed_reset: "completedReset",
  limit_change: "limitChange"
};

const JUDGMENT_KEYS = {
  upcoming_reset: ["judgmentUpcoming", "actionUpcoming"],
  possible_reset: ["judgmentPossible", "actionPossible"],
  completed_reset: ["judgmentCompleted", "actionCompleted"],
  limit_change: ["judgmentLimit", "actionLimit"]
};

function formatDate(value, includeDate = true) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return tr("noRecord", {}, locale);
  return new Intl.DateTimeFormat(getLocaleTag(locale), includeDate
    ? { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }
    : { hour: "2-digit", minute: "2-digit" }).format(date);
}

function distanceFrom(value) {
  const timestamp = Date.parse(value || "");
  if (!Number.isFinite(timestamp)) return tr("unknown", {}, locale);
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return tr("lessThanMinute", {}, locale);
  if (minutes < 60) return tr("minutes", { count: minutes }, locale);
  if (minutes < 1440) return tr("hours", { count: Math.round(minutes / 60) }, locale);
  return tr("days", { count: Math.round(minutes / 1440) }, locale);
}

function discoveryAgeLabel(publishedAt, detectedAt) {
  const published = Date.parse(publishedAt || "");
  const detected = Date.parse(detectedAt || "");
  if (!Number.isFinite(published) || !Number.isFinite(detected)) return tr("publishTimeUnknown", {}, locale);
  const minutes = Math.max(0, Math.round((detected - published) / 60_000));
  if (minutes < 60) return tr("approxMinutesAgo", { count: Math.max(1, minutes) }, locale);
  if (minutes < 1440) return tr("approxHoursAgo", { count: Math.round(minutes / 60) }, locale);
  return tr("approxDaysAgo", { count: Math.round(minutes / 1440) }, locale);
}

function truncate(text, length = 210) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length <= length ? clean : `${clean.slice(0, length - 1)}…`;
}

function eventLabel(eventType) {
  return tr(EVENT_KEYS[eventType] || "quotaMessage", {}, locale);
}

function postTypeLabel(type) {
  return tr({ original: "original", reply: "reply", quote: "quote", repost: "repost" }[type] || "post", {}, locale);
}

function makeEventCard(event, compact = false) {
  const card = document.createElement("article");
  card.className = `event-card ${event.classification?.level || "info"}`;
  const meta = document.createElement("div");
  meta.className = "event-meta";
  for (const label of [
    eventLabel(event.classification?.eventType),
    `@${event.authorHandle || "thsottiaux"}`,
    postTypeLabel(event.postType),
    tr("published", { time: formatDate(event.publishedAt) }, locale),
    tr("detected", { time: formatDate(event.detectedAt) }, locale),
    event.delayed ? tr("delayedDiscovery", { age: discoveryAgeLabel(event.publishedAt, event.detectedAt) }, locale) : tr("realtimeDiscovery", {}, locale)
  ]) {
    const span = document.createElement("span");
    span.textContent = label;
    meta.append(span);
  }
  const original = document.createElement("p");
  original.className = "original";
  original.textContent = truncate(event.text, compact ? 130 : 230);
  const judgment = document.createElement("p");
  judgment.className = "judgment";
  const [judgmentKey, actionKey] = JUDGMENT_KEYS[event.classification?.eventType] || ["judgmentLimit", "actionLimit"];
  judgment.textContent = `${tr(judgmentKey, {}, locale)} ${tr(actionKey, {}, locale)}`;
  const button = document.createElement("button");
  button.className = "view-post";
  button.textContent = tr("viewPost", {}, locale);
  button.addEventListener("click", () => chrome.tabs.create({ url: event.url, active: true }));
  card.append(meta, original, judgment, button);
  return card;
}

function renderEvents(history) {
  elements["latest-event"].replaceChildren();
  elements["history-list"].replaceChildren();
  elements["event-count"].textContent = `${history.length} / 50`;
  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = tr("noEvents", {}, locale);
    elements["latest-event"].append(empty);
    return;
  }
  elements["latest-event"].append(makeEventCard(history[0]));
  for (const event of history.slice(1)) {
    const item = document.createElement("div");
    item.className = "history-item";
    const button = document.createElement("button");
    const label = document.createElement("strong");
    label.textContent = `${eventLabel(event.classification?.eventType)} · ${formatDate(event.publishedAt)}`;
    const text = document.createElement("p");
    text.textContent = truncate(event.text, 120);
    button.append(label, text);
    button.addEventListener("click", () => chrome.tabs.create({ url: event.url, active: true }));
    item.append(button);
    elements["history-list"].append(item);
  }
}

function renderDiagnostics(backfill) {
  elements["diagnostics-list"].replaceChildren();
  const knownByDate = backfill?.rollingKnown?.byDate || {};
  for (const result of backfill?.sourceResults || []) {
    const row = document.createElement("div");
    row.className = "diagnostic-row";
    const heading = document.createElement("strong");
    const name = document.createElement("span");
    const status = document.createElement("span");
    const isProfile = result.source === "profile";
    name.textContent = isProfile ? tr("diagnosticProfile", {}, locale) : (result.segment?.since || result.segment?.label || result.source);
    status.textContent = tr(result.complete && result.ok ? "diagnosticComplete" : "diagnosticIncomplete", {}, locale);
    heading.append(name, status);
    const details = document.createElement("p");
    const known = result.segment?.since ? (knownByDate[result.segment.since] || {}) : {};
    details.textContent = isProfile
      ? tr("diagnosticProfileCounts", {
          scanAll: result.uniquePostsFound ?? result.postsFound ?? 0,
          scanRelevant: result.relevantPostsFound || 0,
          scanFiltered: Math.max(0, (result.uniquePostsFound ?? result.postsFound ?? 0) - (result.relevantPostsFound || 0)),
          scrolls: result.scrolls || 0
        }, locale)
      : tr("diagnosticCounts", {
          scanAll: result.uniquePostsFound ?? result.postsFound ?? 0,
          scanRelevant: result.relevantPostsFound || 0,
          scanFiltered: Math.max(0, (result.uniquePostsFound ?? result.postsFound ?? 0) - (result.relevantPostsFound || 0)),
          knownAll: known.all || 0,
          knownRelevant: known.relevant || 0,
          scrolls: result.scrolls || 0
        }, locale);
    row.append(heading, details);
    elements["diagnostics-list"].append(row);
  }
}

async function render() {
  const { settings = {}, runtimeState = {}, history = [] } = await chrome.storage.local.get(["settings", "runtimeState", "history"]);
  await chrome.action.setBadgeText({ text: "" });
  const enabled = settings.enabled !== false;
  const status = enabled ? (runtimeState.monitoringStatus || "starting") : "paused";
  const [labelKey, detailKey] = STATUS_KEYS[status] || STATUS_KEYS.error;
  elements["status-pill"].textContent = tr(labelKey, { browser: browser.name }, locale);
  elements["status-pill"].className = `status-pill ${status}`;
  elements["status-detail"].textContent = tr(detailKey, { browser: browser.name }, locale);
  elements["monitoring-toggle"].checked = enabled;
  elements.progress.hidden = status !== "checking";

  const activeCheck = runtimeState.activeCheck;
  const scanProgress = activeCheck?.progress;
  const matchedSoFar = Object.keys(activeCheck?.matchedPostTypes || {}).length;
  const prefix = activeCheck?.currentSegment
    ? tr("dateSegment", { current: Math.min((activeCheck.segmentIndex || 0) + 1, activeCheck.segments?.length || 1), total: activeCheck.segments?.length || 1 }, locale)
    : activeCheck?.sourceStage === "profile" ? tr("profileFallback", {}, locale) : "";
  elements["progress-text"].textContent = scanProgress
    ? tr("progressWithPosts", { prefix, posts: scanProgress.postsFound || 0, matched: matchedSoFar }, locale)
    : tr("progressWaiting", { prefix }, locale);

  elements["login-alert"].hidden = runtimeState.xLoginStatus !== "expired" && status !== "login_required";
  const showError = Boolean(runtimeState.lastError) && status !== "login_required";
  elements["error-alert"].hidden = !showError;
  elements["error-title"].textContent = tr(status === "degraded" ? "partialDates" : "recentCheckFailed", {}, locale);
  elements["error-text"].textContent = runtimeState.lastError || "";
  elements["last-success"].textContent = formatDate(runtimeState.lastSuccessfulCheckAt);
  elements["last-attempt"].textContent = formatDate(runtimeState.lastAttemptAt);
  elements["success-age"].textContent = distanceFrom(runtimeState.lastSuccessfulCheckAt);
  elements["failure-count"].textContent = tr("failureCount", { count: runtimeState.consecutiveFailures || 0 }, locale);
  elements["x-login-status"].textContent = tr({ signed_in: "signedIn", expired: "possiblyExpired", unknown: "notConfirmed" }[runtimeState.xLoginStatus] || "notConfirmed", {}, locale);

  const backfill = runtimeState.lastBackfill;
  if (backfill) {
    elements["backfill-range"].textContent = `${formatDate(backfill.from)} — ${formatDate(backfill.to)}`;
    const sourceResults = backfill.sourceResults || [];
    if (backfill.dateSegments) {
      elements["backfill-result"].textContent = tr("resultCounts", {
        all: backfill.uniquePostsFound || 0,
        relevant: backfill.relevantPostsFound || 0,
        reset: backfill.resetPostsFound || 0,
        filtered: Math.max(0, (backfill.uniquePostsFound || 0) - (backfill.relevantPostsFound || 0))
      }, locale);
    } else if (sourceResults.length > 1) {
      const search = sourceResults.find((item) => item.source === "search") || sourceResults[0];
      const profile = sourceResults.find((item) => item.source === "profile") || sourceResults[1];
      elements["backfill-result"].textContent = tr("legacySourceCounts", { search: search.postsFound || 0, profile: profile.postsFound || 0 }, locale);
    } else {
      elements["backfill-result"].textContent = tr("postsAndScrolls", { posts: backfill.postsFound || 0, scrolls: backfill.scrolls || 0 }, locale);
    }
    const rolling = runtimeState.rollingKnown || backfill.rollingKnown || { all: 0, relevant: 0, reset: 0 };
    elements["rolling-result"].textContent = tr("resultCounts", {
      all: rolling.all || 0,
      relevant: rolling.relevant || 0,
      reset: rolling.reset || 0,
      filtered: Math.max(0, (rolling.all || 0) - (rolling.relevant || 0))
    }, locale);
    elements["backfill-badge"].textContent = tr(backfill.complete ? "segmentedComplete" : "possiblyIncomplete", {}, locale);
    elements["backfill-badge"].className = `mini-badge ${backfill.complete ? "good" : "warn"}`;
    elements["coverage-note"].textContent = tr(backfill.complete ? "coverageComplete" : "coverageIncomplete", { count: backfill.dateSegments || 0 }, locale);
    renderDiagnostics(backfill);
  } else {
    elements["backfill-range"].textContent = tr("waitingFirstBackfill", {}, locale);
    elements["backfill-result"].textContent = "—";
    elements["rolling-result"].textContent = "—";
    elements["backfill-badge"].textContent = tr("notCompleted", {}, locale);
    elements["backfill-badge"].className = "mini-badge neutral";
    elements["coverage-note"].textContent = tr("coverageDefault", {}, locale);
    renderDiagnostics(null);
  }
  elements["check-now"].disabled = !enabled || status === "checking";
  renderEvents(history);
}

async function call(message, button = null) {
  if (button) button.disabled = true;
  try { return await chrome.runtime.sendMessage(message); }
  finally { if (button) button.disabled = false; await render(); }
}

elements["monitoring-toggle"].addEventListener("change", () => call({ type: elements["monitoring-toggle"].checked ? "START_MONITORING" : "STOP_MONITORING" }));
elements["check-now"].addEventListener("click", () => call({ type: "CHECK_NOW" }, elements["check-now"]));
elements["open-profile"].addEventListener("click", () => call({ type: "OPEN_PROFILE" }));
elements["open-search"].addEventListener("click", () => call({ type: "OPEN_SEARCH" }));
elements["test-notification"].addEventListener("click", () => call({ type: "TEST_NOTIFICATION" }, elements["test-notification"]));
elements["open-options"].addEventListener("click", () => chrome.runtime.openOptionsPage());
elements["privacy-link"].addEventListener("click", () => chrome.tabs.create({
  url: chrome.runtime.getURL(locale === "zh" ? "PRIVACY.md" : "PRIVACY.en.md"),
  active: true
}));
chrome.storage.onChanged.addListener(render);
render().then(() => chrome.runtime.sendMessage({ type: "POPUP_OPENED" }).catch(() => {}));
setInterval(render, 15_000);
