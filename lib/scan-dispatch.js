export function sameTargetUrl(left, right) {
  try { return new URL(left).href === new URL(right).href; }
  catch { return left === right; }
}

export async function startPageScan(tabsApi, tab, check, focus = false) {
  if (!sameTargetUrl(tab.url, check.targetUrl)) {
    await tabsApi.update(tab.id, { url: check.targetUrl, active: focus, pinned: true });
    return "navigated";
  }

  try {
    const response = await tabsApi.sendMessage(tab.id, { type: "START_PAGE_SCAN", check });
    if (!response?.ok) throw new Error("Content script did not accept the scan request.");
    return "dispatched";
  } catch {
    await tabsApi.reload(tab.id, { bypassCache: true });
    return "reloaded";
  }
}
