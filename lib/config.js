export const MONITOR_HANDLE = "thsottiaux";
export const PROFILE_URL = `https://x.com/${MONITOR_HANDLE}`;
export const PROFILE_WITH_REPLIES_URL = `${PROFILE_URL}/with_replies`;
export const SEARCH_QUERY = `from:${MONITOR_HANDLE}`;

export function searchUrlForQuery(query) {
  return `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
}

export const MONITOR_URL = searchUrlForQuery(SEARCH_QUERY);

function utcDateString(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function buildBackfillSegments(now = Date.now(), lookbackHours = 72) {
  const cutoff = now - lookbackHours * 60 * 60 * 1000;
  const current = new Date(now);
  const first = new Date(cutoff);
  let cursor = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate());
  const firstDay = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate());
  const dayMs = 24 * 60 * 60 * 1000;
  const segments = [];

  while (cursor >= firstDay) {
    const since = utcDateString(cursor);
    const until = utcDateString(cursor + dayMs);
    const query = `${SEARCH_QUERY} since:${since} until:${until}`;
    segments.push({
      id: since,
      label: `${since} UTC`,
      since,
      until,
      query,
      url: searchUrlForQuery(query)
    });
    cursor -= dayMs;
  }
  return segments;
}

export const ALARM_NAME = "tibo-reset-watcher-poll";
export const CHECK_WATCHDOG_ALARM = "tibo-reset-watcher-watchdog";
export const RETRY_ALARM = "tibo-reset-watcher-retry";

export const LOOKBACK_HOURS = 72;
export const BACKFILL_GAP_MINUTES = 10;
export const BACKFILL_MAX_SCROLLS = 45;
export const BACKFILL_MAX_DURATION_MS = 70_000;
export const QUICK_MAX_SCROLLS = 12;
export const QUICK_MAX_DURATION_MS = 40_000;
export const CHECK_STALE_AFTER_MS = 120_000;

export const MAX_HISTORY_ITEMS = 50;
export const MAX_PROCESSED_IDS = 3_000;
export const PROCESSED_RETENTION_DAYS = 14;
export const SYSTEM_NOTICE_COOLDOWN_MS = 12 * 60 * 60 * 1000;
export const FAILURE_NOTICE_THRESHOLD = 3;

export const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  intervalMinutes: 2,
  notifyRuleChanges: true,
  supplementalTerms: [
    "usage limits",
    "rate limits",
    "higher limits",
    "2x limits",
    "additional usage",
    "quota",
    "banked reset",
    "save your reset",
    "chatgpt work",
    "codex limits"
  ]
});

export const DEFAULT_RUNTIME_STATE = Object.freeze({
  monitorTabId: null,
  monitoringStatus: "starting",
  xLoginStatus: "unknown",
  lastSuccessfulCheckAt: null,
  lastAttemptAt: null,
  lastSeenPostId: null,
  lastSeenPostPublishedAt: null,
  lastError: null,
  consecutiveFailures: 0,
  activeCheck: null,
  lastBackfill: null,
  lastQuickCheck: null,
  rollingKnown: null,
  systemNoticeState: {}
});
