import test from "node:test";
import assert from "node:assert/strict";
import { CLASSIFIER_VERSION, classifyPost } from "../lib/classifier.js";
import { DEFAULT_SETTINGS } from "../lib/config.js";
import { buildPostNotification } from "../lib/notification.js";
import { nextProcessedMeta, shouldClassifyPost, wasRelevantPostHandled } from "../lib/processing-state.js";

test("reclassifies a previously seen post after the classifier version changes", () => {
  assert.equal(shouldClassifyPost(true, { classifierVersion: "old" }, "new"), true);
  assert.equal(shouldClassifyPost(true, { classifierVersion: "new" }, "new"), false);
  assert.equal(shouldClassifyPost(false, {}, "new"), true);
});

test("distinguishes a seen-but-filtered post from an already handled relevant post", () => {
  assert.equal(wasRelevantPostHandled({ relevant: false }, false), false);
  assert.equal(wasRelevantPostHandled({ relevant: true }, false), true);
  assert.equal(wasRelevantPostHandled({}, true), true);
});

test("rolling relevance prevents a duplicate alert when old history was trimmed", () => {
  const rollingPreviouslyRelevant = true;
  assert.equal(wasRelevantPostHandled({}, rollingPreviouslyRelevant), true);
});

test("stores classifier state without discarding the first-seen timestamp", () => {
  const meta = nextProcessedMeta(
    { processedAt: "2026-08-08T00:00:00Z" },
    { publishedAt: "2026-08-07T21:46:56Z" },
    { relevant: true, eventType: "possible_reset" },
    "2026-08-08T02:00:00Z",
    "2026-08-08.1"
  );
  assert.equal(meta.processedAt, "2026-08-08T00:00:00Z");
  assert.equal(meta.classifierVersion, "2026-08-08.1");
  assert.equal(meta.eventType, "possible_reset");
});

test("a v0.5.0-filtered reset teaser is eligible for one delayed alert after upgrade", () => {
  const post = {
    id: "2085845171363791135",
    text: "I feel Theo is in need of a reset 👀",
    publishedAt: "2026-08-07T21:46:56.639Z",
    url: "https://x.com/thsottiaux/status/2085845171363791135"
  };
  const previousMeta = { processedAt: "2026-08-07T22:00:00Z", publishedAt: post.publishedAt };
  assert.equal(shouldClassifyPost(true, previousMeta, CLASSIFIER_VERSION), true);
  assert.equal(wasRelevantPostHandled(previousMeta, false), false);
  const classification = classifyPost(post.text, DEFAULT_SETTINGS);
  assert.equal(classification.eventType, "possible_reset");
  assert.equal(buildPostNotification(post, classification, "2026-08-08T02:00:00Z", "zh-CN").shouldNotify, true);
});
