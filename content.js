(() => {
  let runningRequestId = null;

  async function runScan(check) {
    if (!check?.requestId || runningRequestId === check.requestId) return;
    runningRequestId = check.requestId;
    try {
      const result = await globalThis.TiboPageFetcher.scan(check, {
        onBatch: (posts) => chrome.runtime.sendMessage({
          type: "POSTS_BATCH",
          requestId: check.requestId,
          stageId: check.stageId,
          reason: check.reason,
          mode: check.mode,
          posts
        }),
        onProgress: (progress) => chrome.runtime.sendMessage({
          type: "SCAN_PROGRESS",
          requestId: check.requestId,
          stageId: check.stageId,
          progress
        })
      });
      await chrome.runtime.sendMessage({ type: "SCAN_FINISHED", requestId: check.requestId, stageId: check.stageId, result });
    } catch (error) {
      await chrome.runtime.sendMessage({
        type: "SCAN_FINISHED",
        requestId: check.requestId,
        stageId: check.stageId,
        result: { ok: false, errorCode: "content_script_error", error: error.message }
      }).catch(() => {});
    } finally {
      runningRequestId = null;
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "START_PAGE_SCAN") return false;
    runScan(message.check);
    sendResponse({ ok: true });
    return false;
  });

  chrome.runtime.sendMessage({ type: "CONTENT_READY" }).then((response) => {
    if (response?.activeCheck) runScan(response.activeCheck);
  }).catch(() => {});
})();
