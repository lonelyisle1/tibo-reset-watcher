import test from "node:test";
import assert from "node:assert/strict";
import { buildPostNotification, relativeAge, systemNotification } from "../lib/notification.js";

const now = Date.parse("2026-08-02T12:00:00Z");

test("uses the required notification age bands", () => {
  assert.equal(relativeAge("2026-08-02T09:00:00Z", now).band, "0_6h");
  assert.equal(relativeAge("2026-08-02T04:00:00Z", now).band, "6_24h");
  assert.equal(relativeAge("2026-07-31T12:00:00Z", now).band, "24_72h");
  assert.equal(relativeAge("2026-07-29T12:00:00Z", now).band, "expired");
});

test("marks delayed discovery and includes published and detected times", () => {
  const post = { text: "We may reset Codex limits.", publishedAt: "2026-08-02T04:00:00Z" };
  const classification = { eventType: "possible_reset", level: "warning" };
  const notification = buildPostNotification(post, classification, "2026-08-02T12:00:00Z", "zh-CN");
  assert.match(notification.options.title, /延迟发现/);
  assert.match(notification.options.message, /发布：/);
  assert.match(notification.options.message, /发现：/);
});

test("completed reset notification recommends checking new quota", () => {
  const post = { text: "We have reset Codex limits.", publishedAt: "2026-08-02T11:55:00Z" };
  const classification = { eventType: "completed_reset", level: "info" };
  const notification = buildPostNotification(post, classification, "2026-08-02T12:00:00Z", "zh-CN");
  assert.match(notification.options.title, /已重置/);
  assert.match(notification.options.message, /检查新额度/);
});

test("a recently published but late-discovered reset is distinct from realtime", () => {
  const post = { text: "We will reset Codex limits tonight.", publishedAt: "2026-08-02T09:00:00Z" };
  const classification = { eventType: "upcoming_reset", level: "urgent" };
  const notification = buildPostNotification(post, classification, "2026-08-02T12:00:00Z", "zh-CN");
  assert.match(notification.options.title, /延迟发现/);
  assert.equal(notification.options.priority, 2);
});

test("does not notify posts older than the 72-hour window", () => {
  const post = { text: "Codex usage limits changed.", publishedAt: "2026-07-29T00:00:00Z" };
  const classification = { eventType: "limit_change", level: "info" };
  assert.equal(buildPostNotification(post, classification, "2026-08-02T12:00:00Z").shouldNotify, false);
});

test("uses English and the detected browser name in a Chrome test notification", () => {
  const notification = systemNotification("test", "", {
    locale: "en-US",
    browser: { key: "chrome", name: "Google Chrome", shortName: "Chrome" }
  });
  assert.match(notification.title, /test successful/i);
  assert.match(notification.message, /Google Chrome/);
  assert.doesNotMatch(notification.message, /Edge/);
});
