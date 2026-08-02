import { classifyPost } from "./classifier.js";

const RESET_TYPES = new Set(["upcoming_reset", "possible_reset", "completed_reset"]);

export function pruneRecentObservations(observations = {}, now = Date.now(), lookbackHours = 72, maxItems = 3_000) {
  const cutoff = now - lookbackHours * 60 * 60 * 1000;
  const entries = Object.entries(observations)
    .filter(([, item]) => {
      const published = Date.parse(item?.publishedAt || "");
      return Number.isFinite(published) && published >= cutoff && published <= now + 5 * 60 * 1000;
    })
    .sort(([, left], [, right]) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
    .slice(0, maxItems);
  return Object.fromEntries(entries);
}

export function mergeRecentObservations(observations = {}, posts = [], settings = {}, now = Date.now(), lookbackHours = 72) {
  const next = { ...observations };
  const observedAt = new Date(now).toISOString();
  for (const post of posts) {
    if (!post?.id || !Number.isFinite(Date.parse(post.publishedAt || ""))) continue;
    const id = String(post.id);
    const previous = next[id] || {};
    const classification = classifyPost(post.text, settings);
    next[id] = {
      id,
      publishedAt: post.publishedAt,
      firstObservedAt: previous.firstObservedAt || observedAt,
      lastObservedAt: observedAt,
      relevant: classification.relevant,
      eventType: classification.relevant ? classification.eventType : "unrelated"
    };
  }
  return pruneRecentObservations(next, now, lookbackHours);
}

export function summarizeRecentObservations(observations = {}, now = Date.now(), lookbackHours = 72) {
  const current = pruneRecentObservations(observations, now, lookbackHours);
  const items = Object.values(current);
  const byDate = {};
  for (const item of items) {
    const date = String(item.publishedAt).slice(0, 10);
    const bucket = byDate[date] || { all: 0, relevant: 0, reset: 0 };
    bucket.all += 1;
    if (item.relevant) bucket.relevant += 1;
    if (RESET_TYPES.has(item.eventType)) bucket.reset += 1;
    byDate[date] = bucket;
  }
  return {
    all: items.length,
    relevant: items.filter((item) => item.relevant).length,
    reset: items.filter((item) => RESET_TYPES.has(item.eventType)).length,
    byDate,
    from: new Date(now - lookbackHours * 60 * 60 * 1000).toISOString(),
    to: new Date(now).toISOString()
  };
}
