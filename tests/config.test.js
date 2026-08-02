import test from "node:test";
import assert from "node:assert/strict";
import { buildBackfillSegments } from "../lib/config.js";

test("splits an exact 72-hour lookback across every touched UTC calendar day", () => {
  const now = Date.parse("2026-08-02T13:30:00Z");
  const segments = buildBackfillSegments(now, 72);
  assert.deepEqual(segments.map((segment) => segment.since), [
    "2026-08-02",
    "2026-08-01",
    "2026-07-31",
    "2026-07-30"
  ]);
  assert.equal(new Set(segments.map((segment) => segment.id)).size, segments.length);
});

test("each date segment keeps the author broad and adds only date bounds", () => {
  const segments = buildBackfillSegments(Date.parse("2026-08-02T13:30:00Z"), 72);
  for (const segment of segments) {
    assert.match(segment.query, /^from:thsottiaux since:\d{4}-\d{2}-\d{2} until:\d{4}-\d{2}-\d{2}$/);
    assert.match(segment.url, /x\.com\/search\?/);
    assert.match(segment.url, /f=live/);
    assert.doesNotMatch(segment.query, /reset|limit|quota/i);
  }
});
