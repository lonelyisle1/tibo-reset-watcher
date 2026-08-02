import { MAX_PROCESSED_IDS, PROCESSED_RETENTION_DAYS } from "./config.js";

export function pruneProcessedIds(processedPostIds = [], processedPostMeta = {}, now = Date.now()) {
  const cutoff = now - PROCESSED_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const kept = [];
  const meta = {};

  for (const id of processedPostIds) {
    const timestamp = Date.parse(processedPostMeta[id]?.processedAt || processedPostMeta[id]?.publishedAt || "");
    if (Number.isFinite(timestamp) && timestamp < cutoff) continue;
    kept.push(String(id));
    if (processedPostMeta[id]) meta[id] = processedPostMeta[id];
  }

  const limited = kept.slice(-MAX_PROCESSED_IDS);
  const limitedMeta = Object.fromEntries(limited.filter((id) => meta[id]).map((id) => [id, meta[id]]));
  return { processedPostIds: limited, processedPostMeta: limitedMeta };
}

export function hoursSince(value, now = Date.now()) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? Math.max(0, (now - timestamp) / 3_600_000) : null;
}

export function needsBackfill(lastSuccessfulCheckAt, gapMinutes, now = Date.now()) {
  const timestamp = Date.parse(lastSuccessfulCheckAt || "");
  return !Number.isFinite(timestamp) || now - timestamp > gapMinutes * 60_000;
}
