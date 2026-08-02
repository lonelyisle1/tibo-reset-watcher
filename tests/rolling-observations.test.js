import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SETTINGS } from "../lib/config.js";
import { mergeRecentObservations, summarizeRecentObservations } from "../lib/rolling-observations.js";

const now = Date.parse("2026-08-02T12:00:00Z");

test("unions posts across scans without storing ordinary post text", () => {
  const first = mergeRecentObservations({}, [
    { id: "1", publishedAt: "2026-08-02T10:00:00Z", text: "Normal update" },
    { id: "2", publishedAt: "2026-08-02T09:00:00Z", text: "We will reset Codex usage limits tonight." }
  ], DEFAULT_SETTINGS, now);
  const second = mergeRecentObservations(first, [
    { id: "2", publishedAt: "2026-08-02T09:00:00Z", text: "We will reset Codex usage limits tonight." },
    { id: "3", publishedAt: "2026-08-01T09:00:00Z", text: "Codex now has 2x limits." }
  ], DEFAULT_SETTINGS, now);
  const summary = summarizeRecentObservations(second, now);
  assert.equal(summary.all, 3);
  assert.equal(summary.relevant, 2);
  assert.equal(summary.reset, 1);
  assert.equal("text" in second["1"], false);
});

test("expires observations outside the rolling 72-hour window", () => {
  const observations = mergeRecentObservations({}, [
    { id: "old", publishedAt: "2026-07-30T11:59:00Z", text: "Old quota post" },
    { id: "new", publishedAt: "2026-07-30T12:01:00Z", text: "New quota post" }
  ], DEFAULT_SETTINGS, now);
  assert.deepEqual(Object.keys(observations), ["new"]);
});

test("builds per-date cumulative diagnostics", () => {
  const observations = mergeRecentObservations({}, [
    { id: "1", publishedAt: "2026-08-02T10:00:00Z", text: "Normal" },
    { id: "2", publishedAt: "2026-08-01T10:00:00Z", text: "We have reset Codex limits." }
  ], DEFAULT_SETTINGS, now);
  const summary = summarizeRecentObservations(observations, now);
  assert.equal(summary.byDate["2026-08-02"].all, 1);
  assert.equal(summary.byDate["2026-08-01"].reset, 1);
});
