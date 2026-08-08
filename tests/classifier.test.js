import test from "node:test";
import assert from "node:assert/strict";
import { classifyPost } from "../lib/classifier.js";
import { DEFAULT_SETTINGS } from "../lib/config.js";

const classify = (text, overrides = {}) => classifyPost(text, { ...DEFAULT_SETTINGS, ...overrides });

test("classifies a definite future reset as urgent", () => {
  for (const text of [
    "We will reset Codex usage limits tomorrow.",
    "Resetting ChatGPT Work limits tonight.",
    "A hard reset for Codex limits is incoming."
  ]) {
    const result = classify(text);
    assert.equal(result.relevant, true, text);
    assert.equal(result.eventType, "upcoming_reset", text);
    assert.equal(result.level, "urgent", text);
  }
});

test("classifies uncertain and conditional resets separately", () => {
  for (const text of [
    "We may reset Codex limits later.",
    "We are planning to reset usage limits.",
    "If the issue continues, we will reset everyone's limits."
  ]) {
    assert.equal(classify(text).eventType, "possible_reset", text);
  }
});

test("classifies Tibo's implicit reset teasers as possible resets", () => {
  for (const text of [
    "I feel Theo is in need of a reset 👀",
    "I'm feeling like a reset 😉",
    "Someone deserves a reset 🤫"
  ]) {
    const result = classify(text);
    assert.equal(result.relevant, true, text);
    assert.equal(result.eventType, "possible_reset", text);
    assert.equal(result.level, "warning", text);
  }
});

test("classifies completed resets without telling users to spend old quota", () => {
  for (const text of [
    "We have now reset usage limits for all paid users.",
    "The Codex reset is complete.",
    "We reset everyone's limits."
  ]) {
    const result = classify(text);
    assert.equal(result.eventType, "completed_reset", text);
    assert.match(result.actionZh, /检查新额度/);
  }
});

test("classifies quota increases and rule changes", () => {
  for (const text of [
    "Codex now has 2x limits for Plus users.",
    "Additional usage is available in ChatGPT Work.",
    "You can bank your Codex usage limit reset and redeem it later."
  ]) {
    assert.equal(classify(text).eventType, "limit_change", text);
  }
});

test("negation never becomes an upcoming reset", () => {
  for (const text of [
    "No reset is planned for Codex usage limits.",
    "We are not resetting limits.",
    "This does not reset your usage limits."
  ]) {
    const result = classify(text);
    assert.notEqual(result.eventType, "upcoming_reset", text);
    assert.equal(result.relevant, false, text);
  }
});

test("ignores unrelated reset language", () => {
  assert.equal(classify("I had to reset my laptop before the demo.").relevant, false);
  assert.equal(classify("Please reset the router and database.").relevant, false);
  assert.equal(classify("I reset my password this morning.").relevant, false);
});

test("respects the rule-change notification toggle", () => {
  const result = classify("Codex usage limits are changing.", { notifyRuleChanges: false, supplementalTerms: [] });
  assert.equal(result.relevant, false);
});
