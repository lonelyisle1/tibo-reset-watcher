import test from "node:test";
import assert from "node:assert/strict";
import { sameTargetUrl, startPageScan } from "../lib/scan-dispatch.js";

const check = { requestId: "request-1", targetUrl: "https://x.com/search?q=from%3Athsottiaux&f=live" };

test("recognizes an already-open exact monitor URL", () => {
  assert.equal(sameTargetUrl(check.targetUrl, check.targetUrl), true);
  assert.equal(sameTargetUrl("https://x.com/thsottiaux", check.targetUrl), false);
});

test("explicitly dispatches a scan when the tab is already at the target URL", async () => {
  const calls = [];
  const tabs = {
    sendMessage: async (id, message) => { calls.push(["send", id, message.type]); return { ok: true }; },
    update: async () => calls.push(["update"]),
    reload: async () => calls.push(["reload"])
  };
  assert.equal(await startPageScan(tabs, { id: 7, url: check.targetUrl }, check), "dispatched");
  assert.deepEqual(calls, [["send", 7, "START_PAGE_SCAN"]]);
});

test("navigates a different URL and reloads only when direct dispatch is unavailable", async () => {
  const navigationCalls = [];
  const navigationTabs = {
    update: async (id, changes) => navigationCalls.push([id, changes.url]),
    sendMessage: async () => { throw new Error("should not send"); },
    reload: async () => { throw new Error("should not reload"); }
  };
  assert.equal(await startPageScan(navigationTabs, { id: 8, url: "https://x.com/thsottiaux" }, check), "navigated");
  assert.deepEqual(navigationCalls, [[8, check.targetUrl]]);

  const reloadCalls = [];
  const reloadTabs = {
    update: async () => { throw new Error("should not navigate"); },
    sendMessage: async () => { throw new Error("content script missing"); },
    reload: async (id, options) => reloadCalls.push([id, options.bypassCache])
  };
  assert.equal(await startPageScan(reloadTabs, { id: 9, url: check.targetUrl }, check), "reloaded");
  assert.deepEqual(reloadCalls, [[9, true]]);
});
