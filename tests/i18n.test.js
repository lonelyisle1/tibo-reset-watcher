import test from "node:test";
import assert from "node:assert/strict";
import { detectBrowser, normalizeLocale, tr } from "../lib/i18n.js";

test("detects Edge and Chrome from their user agents", () => {
  assert.equal(detectBrowser("Mozilla/5.0 Chrome/140.0 Safari/537.36 Edg/140.0").key, "edge");
  assert.equal(detectBrowser("Mozilla/5.0 Chrome/140.0 Safari/537.36").key, "chrome");
});

test("selects Chinese only for Chinese browser UI locales", () => {
  assert.equal(normalizeLocale("zh-CN"), "zh");
  assert.equal(normalizeLocale("zh-TW"), "zh");
  assert.equal(normalizeLocale("en-US"), "en");
});

test("interpolates localized browser names", () => {
  assert.equal(tr("testBody", { browser: "Google Chrome" }, "en-US"), "Google Chrome system notifications are working.");
  assert.match(tr("testBody", { browser: "Microsoft Edge" }, "zh-CN"), /Microsoft Edge/);
});
