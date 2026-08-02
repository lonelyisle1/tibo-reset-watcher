import { LOOKBACK_HOURS } from "./config.js";
import { detectBrowser, getLocaleTag, getUiLocale, tr } from "./i18n.js";

const ICONS = {
  upcoming_reset: "icons/notification-urgent.png",
  possible_reset: "icons/notification-possible.png",
  completed_reset: "icons/notification-completed.png",
  limit_change: "icons/notification-change.png",
  system: "icons/notification-system.png"
};

function formatDateTime(value, locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return tr("timeUnknown", {}, locale);
  return new Intl.DateTimeFormat(getLocaleTag(locale), {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function relativeAge(publishedAt, detectedAt = Date.now(), locale = getUiLocale()) {
  const published = Date.parse(publishedAt);
  const detected = typeof detectedAt === "number" ? detectedAt : Date.parse(detectedAt);
  if (!Number.isFinite(published) || !Number.isFinite(detected)) {
    return { hours: null, label: tr("publishTimeUnknown", {}, locale), band: "unknown", delayed: true };
  }
  const minutes = Math.max(0, Math.round((detected - published) / 60_000));
  const hours = minutes / 60;
  const label = minutes < 60
    ? tr("approxMinutesAgo", { count: Math.max(1, minutes) }, locale)
    : hours < 24
      ? tr("approxHoursAgo", { count: Math.round(hours) }, locale)
      : tr("approxDaysAgo", { count: Math.round(hours / 24) }, locale);
  const band = hours <= 6 ? "0_6h" : hours <= 24 ? "6_24h" : hours <= LOOKBACK_HOURS ? "24_72h" : "expired";
  return { hours, label, band, delayed: minutes >= 10 };
}

function summarize(text, maxLength = 92) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength - 1)}…`;
}

function titleFor(classification, age, locale) {
  if (age.delayed) {
    if (classification.eventType === "upcoming_reset" && age.band === "0_6h") return tr("delayedUrgentTitle", {}, locale);
    if (classification.eventType === "completed_reset") return tr("delayedCompletedTitle", {}, locale);
    return tr("delayedTitle", {}, locale);
  }
  const key = {
    upcoming_reset: "upcomingTitle",
    possible_reset: "possibleTitle",
    completed_reset: "completedTitle",
    limit_change: "changeTitle"
  }[classification.eventType] || "changeTitle";
  return tr(key, {}, locale);
}

function shortAction(classification, age, locale) {
  if (classification.eventType === "completed_reset") return tr("checkNewQuota", {}, locale);
  if (age.band === "24_72h") return tr("mayBeOutdated", {}, locale);
  if (classification.eventType === "upcoming_reset") return tr("useQuotaSoon", {}, locale);
  if (classification.eventType === "possible_reset") return tr("resetUncertain", {}, locale);
  return tr("viewChange", {}, locale);
}

export function buildPostNotification(post, classification, detectedAt = new Date().toISOString(), locale = getUiLocale()) {
  const age = relativeAge(post.publishedAt, detectedAt, locale);
  const shouldNotify = age.band !== "expired";
  const message = tr("notificationBody", {
    delayed: age.delayed ? tr("delayedPrefix", {}, locale) : "",
    published: formatDateTime(post.publishedAt, locale),
    age: age.label,
    detected: formatDateTime(detectedAt, locale),
    action: shortAction(classification, age, locale),
    summary: summarize(post.text)
  }, locale);
  return {
    shouldNotify,
    age,
    options: {
      type: "basic",
      iconUrl: ICONS[classification.eventType] || ICONS.system,
      title: titleFor(classification, age, locale),
      message: message.slice(0, 330),
      priority: classification.eventType === "upcoming_reset" && age.band === "0_6h" ? 2 : 1,
      requireInteraction: classification.eventType === "upcoming_reset" && age.band === "0_6h"
    }
  };
}

export function systemNotification(kind, detail = "", context = {}) {
  const locale = context.locale || getUiLocale();
  const browser = context.browser || detectBrowser();
  const copy = {
    login_required: {
      title: tr("loginNotificationTitle", {}, locale),
      message: tr("loginNotificationBody", { browser: browser.name }, locale)
    },
    repeated_failure: {
      title: tr("failureNotificationTitle", {}, locale),
      message: tr("failureNotificationBody", { detail: detail ? ` ${detail}` : "" }, locale)
    },
    test: {
      title: tr("testTitle", {}, locale),
      message: tr("testBody", { browser: browser.name }, locale)
    }
  }[kind];
  return { type: "basic", iconUrl: ICONS.system, priority: 1, ...copy };
}
