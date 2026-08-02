import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SETTINGS } from "../lib/config.js";
import { mergeMatchedPostTypes, summarizeMatchedPostTypes } from "../lib/check-stats.js";

test("counts all fetched posts separately from locally matched quota posts", () => {
  const posts = [
    { id: "1", text: "A normal product update." },
    { id: "2", text: "We will reset Codex usage limits tonight." },
    { id: "3", text: "Codex now has 2x limits." }
  ];
  const matched = mergeMatchedPostTypes({}, posts, DEFAULT_SETTINGS);
  const summary = summarizeMatchedPostTypes(matched);
  assert.deepEqual(Object.keys(matched).sort(), ["2", "3"]);
  assert.equal(summary.relevantPostsFound, 2);
  assert.equal(summary.resetPostsFound, 1);
  assert.equal(summary.ruleChangePostsFound, 1);
});

test("deduplicates a relevant post seen on multiple X pages", () => {
  const post = { id: "9", text: "We have now reset usage limits." };
  const first = mergeMatchedPostTypes({}, [post], DEFAULT_SETTINGS);
  const second = mergeMatchedPostTypes(first, [post], DEFAULT_SETTINGS);
  assert.equal(summarizeMatchedPostTypes(second).relevantPostsFound, 1);
});
