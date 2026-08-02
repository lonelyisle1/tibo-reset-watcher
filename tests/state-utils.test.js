import test from "node:test";
import assert from "node:assert/strict";
import { needsBackfill, pruneProcessedIds } from "../lib/state-utils.js";

test("removes processed IDs older than the retention window", () => {
  const now = Date.parse("2026-08-20T00:00:00Z");
  const result = pruneProcessedIds(["old", "new"], {
    old: { processedAt: "2026-08-01T00:00:00Z" },
    new: { processedAt: "2026-08-19T00:00:00Z" }
  }, now);
  assert.deepEqual(result.processedPostIds, ["new"]);
  assert.deepEqual(Object.keys(result.processedPostMeta), ["new"]);
});

test("uses elapsed time rather than a fixed post count to trigger backfill", () => {
  const now = Date.parse("2026-08-02T12:00:00Z");
  assert.equal(needsBackfill(null, 10, now), true);
  assert.equal(needsBackfill("2026-08-02T11:55:00Z", 10, now), false);
  assert.equal(needsBackfill("2026-08-02T11:40:00Z", 10, now), true);
});
