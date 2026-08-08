const ZH = {
  localMonitoring: "{browser} · 本地监测",
  openSettings: "打开设置",
  monitoredAccount: "监测账号",
  loading: "读取中",
  automaticMonitoring: "自动监测",
  loadingState: "正在读取运行状态…",
  toggleMonitoring: "启用或暂停自动监测",
  checkingX: "正在检查 X 页面…",
  loginExpiredTitle: "X登录状态可能已失效",
  loginExpiredBody: "请先在{browser}中登录X，然后重新检查。",
  recentCheckIncomplete: "最近一次检查未完整成功",
  checkStatus: "检查状态",
  lastSuccess: "最近成功",
  lastAttempt: "最近尝试",
  sinceSuccess: "成功至今",
  consecutiveFailures: "连续失败",
  backfill: "断档补查",
  last72Hours: "最近 72 小时",
  notCompleted: "尚未完成",
  recentRange: "最近范围", readResults: "读取结果", currentRead: "本次读取", rollingKnown: "72小时累计已知",
  xLoginStatus: "X 登录状态",
  detecting: "正在检测",
  dataSource: "数据来源",
  segmentedSource: "按日期分段搜索 + 主页回退",
  coverageDefault: "完整性以 X 实际返回的可见结果为准。",
  actions: "操作",
  checkNow: "立即检查",
  openProfile: "打开 Tibo 主页",
  openSearch: "打开 X 搜索页",
  testNotification: "测试通知",
  backgroundTitle: "建议开启 {browser} 后台运行",
  backgroundEdge: "Edge 设置 → 系统和性能 → 开启“关闭 Microsoft Edge 后继续运行后台扩展和应用”。完全退出、休眠或关机时仍无法实时监测。",
  backgroundChrome: "Chrome 设置 → 系统 → 开启“关闭 Google Chrome 后继续运行后台应用”。完全退出、休眠或关机时仍无法实时监测。",
  latestEvents: "最新事件",
  quotaMessages: "额度相关消息",
  filteredOnly: "只显示本地规则筛出的重置、恢复、额度增加或规则变化帖子",
  viewHistory: "查看历史记录",
  privacySummary: "不读取密码、Cookie、私信或 ChatGPT 内容",
  privacy: "隐私说明",
  statusStarting: "启动中", statusStartingDetail: "正在初始化本地状态",
  statusChecking: "检查中", statusCheckingDetail: "正在读取并补查 X 公开帖子",
  statusNormal: "正常", statusNormalDetail: "定时监测与帖子去重已启用",
  statusDegraded: "覆盖有限", statusDegradedDetail: "实时监测正常，但历史补查可能不足 72 小时",
  statusLogin: "登录失效", statusLoginDetail: "需要先在 {browser} 中登录 X",
  statusError: "检查失败", statusErrorDetail: "扩展将在下一次任务中重试",
  statusPaused: "已暂停", statusPausedDetail: "不会自动检查或发送帖子通知",
  upcomingReset: "即将重置", possibleReset: "可能重置", completedReset: "已经重置", limitChange: "额度 / 规则变化",
  quotaMessage: "额度消息", original: "原创", reply: "回复", quote: "引用", repost: "转发", post: "帖子",
  published: "发布 {time}", detected: "发现 {time}", delayedDiscovery: "延迟发现 · {age}", realtimeDiscovery: "实时发现",
  viewPost: "查看原帖 →", noEvents: "还没有检测到额度相关事件",
  noRecord: "尚无记录", unknown: "未知", lessThanMinute: "不到 1 分钟", minutes: "{count} 分钟", hours: "{count} 小时", days: "{count} 天",
  dateSegment: "日期 {current}/{total} · ", profileFallback: "主页回退 · ",
  progressWithPosts: "{prefix}本页 {posts} 条，累计筛出 {matched} 条额度相关消息…",
  progressWaiting: "{prefix}正在等待 X 返回公开帖子…",
  partialDates: "部分日期结果可能不完整", recentCheckFailed: "最近一次检查失败", failureCount: "{count} 次",
  signedIn: "可读取公开帖子", possiblyExpired: "可能已失效", notConfirmed: "尚未确认",
  resultCounts: "全部 {all} 条 · 额度相关 {relevant} 条（重置 {reset} 条）· 规则过滤 {filtered} 条",
  legacySourceCounts: "搜索 {search} 条 + 主页 {profile} 条", postsAndScrolls: "{posts} 条 · {scrolls} 次滚动",
  segmentedComplete: "分段补查完成", possiblyIncomplete: "可能不完整",
  coverageComplete: "已检查 {count} 个日期区间；仅将本地规则命中的消息保存到下方历史。",
  coverageIncomplete: "已检查 {count} 个日期区间；一个或多个区间不完整，已尝试主页回退。",
  waitingFirstBackfill: "等待首次 72 小时补查", diagnosticsSummary: "查看按日期检查诊断", diagnosticProfile: "主页回退", diagnosticComplete: "正常结束", diagnosticIncomplete: "未完整结束", diagnosticCounts: "本次 {scanAll} 条 / 相关 {scanRelevant} 条 / 过滤 {scanFiltered} 条 · 累计已知 {knownAll} 条 / 相关 {knownRelevant} 条 · 滚动 {scrolls} 次", diagnosticProfileCounts: "本次 {scanAll} 条 / 相关 {scanRelevant} 条 / 过滤 {scanFiltered} 条 · 滚动 {scrolls} 次",
  judgmentUpcoming: "Tibo 可能宣布了即将进行的额度重置。", actionUpcoming: "尽快使用当前剩余额度，并打开原帖确认时间。",
  judgmentPossible: "Tibo 提到了可能发生的额度重置，但尚未完全确定。", actionPossible: "提前检查剩余额度并关注原帖后续更新。",
  judgmentCompleted: "Tibo 表示额度可能已经重置或恢复。", actionCompleted: "打开 ChatGPT 或 Codex 检查新额度，不要再消耗旧额度。",
  judgmentLimit: "这是额度增加、额度规则或使用限制相关消息。", actionLimit: "查看原帖，确认自己的套餐和额度是否受影响。",
  settingsTitle: "Tibo Reset Watcher 设置", settingsEyebrow: "TIBO RESET WATCHER · {browser}", settingsHeading: "监测设置",
  settingsIntro: "规则在本机运行；扩展不使用 X API、OpenAI API 或开发者服务器。",
  checkFrequency: "检查频率", intervalLabel: "定时检查间隔",
  interval1: "1 分钟（更及时，也更容易被 X 限制）", interval2: "2 分钟（推荐）", interval5: "5 分钟（访问更温和）", interval10: "10 分钟",
  intervalHelp: "{browser} 可能因节能、标签页休眠或系统负载延迟后台任务，因此该间隔不是严格承诺。",
  quotaRules: "额度规则", rulesIntro: "“即将重置、可能重置、已经重置和否定表达”的内置规则保存在独立代码模块中。这里的词语用于补充识别额度增加或规则变化，每行一个。",
  supplementalTerms: "补充额度词语", notifyRuleChanges: "通知额度增加、ChatGPT Work、banked reset 和一般额度规则变化",
  safetyLimits: "固定安全边界", hours72: "72 小时", hours72Help: "启动、手动检查和长时间断档的默认补查范围",
  items50: "50 条", items50Help: "仅保存最近的额度相关历史事件", days14: "14 天", days14Help: "去重记录保留时间，防止本地存储无限增长",
  notificationsData: "通知与本地数据", sendTest: "发送测试通知", clearHistory: "清空事件历史",
  clearHelp: "清空历史不会清除帖子去重 ID，因此旧帖子不会重新通知。卸载扩展可删除全部扩展本地数据。",
  backgroundSettingsTitle: "{browser} 后台运行建议", saveSettings: "保存设置", settingsSaved: "设置已保存", testSent: "测试通知已发送",
  clearConfirm: "确定清空本机保存的额度事件历史吗？帖子去重记录会保留。", historyCleared: "事件历史已清空",
  timeUnknown: "时间未知", publishTimeUnknown: "发布时间未知", approxMinutesAgo: "约{count}分钟前", approxHoursAgo: "约{count}小时前", approxDaysAgo: "约{count}天前",
  delayedUrgentTitle: "🚨 延迟发现：Tibo重置预警", delayedCompletedTitle: "✅ 延迟发现：额度可能已重置", delayedTitle: "⚠️ 延迟发现：Tibo额度消息",
  upcomingTitle: "🚨 Tibo额度重置预警", possibleTitle: "⚠️ Tibo可能重置额度", completedTitle: "✅ Tibo表示额度可能已重置", changeTitle: "📈 Tibo发布了额度变化消息",
  checkNewQuota: "请检查新额度。", mayBeOutdated: "消息可能已过时，请先检查当前额度和原帖。", useQuotaSoon: "建议尽快使用剩余额度。", resetUncertain: "重置尚未确定，请关注原帖。", viewChange: "请查看原帖确认额度变化。",
  delayedPrefix: "延迟发现。", notificationBody: "{delayed}发布：{published}（{age}）；发现：{detected}。{action} 摘要：{summary}",
  loginNotificationTitle: "🔐 X登录状态可能已失效", loginNotificationBody: "请先在 {browser} 中登录 X，然后打开扩展并重新检查。",
  failureNotificationTitle: "⚠️ Tibo监测连续失败", failureNotificationBody: "扩展已经连续多次无法完成检查。请打开弹窗查看原因。{detail}",
  testTitle: "🔔 Tibo Reset Watcher 测试成功", testBody: "{browser} 系统通知可以正常显示。",
  errorScanTimeout: "检查超过安全时限，X页面可能被暂停或无法加载。", errorMonitorTab: "无法创建或刷新X监测页：{detail}",
  reasonNoMore: "X没有继续提供更早的可见结果", reasonSegmentExhausted: "日期区间的可见结果已经耗尽", reasonSegmentUnreadable: "某个日期区间没有返回可读取的帖子", reasonStageTimeout: "X页面长时间没有返回新的扫描进度", reasonEmpty: "X明确显示该日期区间没有结果", reasonAllSegments: "所有日期区间的可见结果均已读取", reasonScrollLimit: "已达到滚动安全上限", reasonTimeLimit: "已达到检查时间安全上限", reasonNoPosts: "页面没有返回可读取的Tibo帖子", reasonProfileFailed: "Tibo帖子与回复页回退检查失败", reasonUnknown: "原因未知",
  errorCheckFailed: "检查未成功。", errorSegmentNavigation: "无法打开日期分段搜索页：{detail}", errorProfileFallback: "无法打开Tibo帖子与回复页：{detail}", errorBackfillIncomplete: "72小时补查可能不完整：{reason}", errorRetryFailed: "X页面超时且自动重试失败：{detail}", errorNoProgress: "X页面长时间没有返回新的扫描进度；已自动重试一次。"
};

const EN = {
  localMonitoring: "{browser} · Local monitoring", openSettings: "Open settings", monitoredAccount: "Monitored account", loading: "Loading", automaticMonitoring: "Automatic monitoring", loadingState: "Reading local status…", toggleMonitoring: "Enable or pause automatic monitoring", checkingX: "Checking X…",
  loginExpiredTitle: "Your X login may have expired", loginExpiredBody: "Sign in to X in {browser}, then check again.", recentCheckIncomplete: "The latest check did not fully complete", checkStatus: "Check status", lastSuccess: "Last success", lastAttempt: "Last attempt", sinceSuccess: "Since success", consecutiveFailures: "Consecutive failures",
  backfill: "Backfill", last72Hours: "Last 72 hours", notCompleted: "Not completed", recentRange: "Time range", readResults: "Results", currentRead: "This scan", rollingKnown: "Known across 72 hours", xLoginStatus: "X login", detecting: "Detecting", dataSource: "Data source", segmentedSource: "Date-segmented search + profile fallback", coverageDefault: "Coverage depends on the results X makes visible.", actions: "Actions", checkNow: "Check now", openProfile: "Open Tibo profile", openSearch: "Open X search", testNotification: "Test notification",
  backgroundTitle: "Keep {browser} running in the background", backgroundEdge: "Edge Settings → System and performance → enable “Continue running background extensions and apps when Microsoft Edge is closed.” Monitoring cannot run while Edge is fully exited, the computer sleeps, or it is powered off.", backgroundChrome: "Chrome Settings → System → enable “Continue running background apps when Google Chrome is closed.” Monitoring cannot run while Chrome is fully exited, the computer sleeps, or it is powered off.",
  latestEvents: "Latest events", quotaMessages: "Quota-related messages", filteredOnly: "Only reset, restoration, limit increase, and rule-change posts matched by local rules are shown", viewHistory: "View history", privacySummary: "Does not read passwords, cookies, DMs, or ChatGPT content", privacy: "Privacy",
  statusStarting: "Starting", statusStartingDetail: "Initializing local state", statusChecking: "Checking", statusCheckingDetail: "Reading and backfilling public X posts", statusNormal: "Normal", statusNormalDetail: "Scheduled checks and post deduplication are enabled", statusDegraded: "Limited coverage", statusDegradedDetail: "Realtime monitoring works, but historical coverage may be under 72 hours", statusLogin: "Login expired", statusLoginDetail: "Sign in to X in {browser}", statusError: "Check failed", statusErrorDetail: "The extension will retry on the next run", statusPaused: "Paused", statusPausedDetail: "Posts will not be checked or notified automatically",
  upcomingReset: "Upcoming reset", possibleReset: "Possible reset", completedReset: "Reset completed", limitChange: "Limit / rule change", quotaMessage: "Quota message", original: "Original", reply: "Reply", quote: "Quote", repost: "Repost", post: "Post", published: "Published {time}", detected: "Detected {time}", delayedDiscovery: "Delayed discovery · {age}", realtimeDiscovery: "Realtime discovery", viewPost: "View post →", noEvents: "No quota-related events detected yet",
  noRecord: "No record", unknown: "Unknown", lessThanMinute: "Less than 1 minute", minutes: "{count} minutes", hours: "{count} hours", days: "{count} days", dateSegment: "Date {current}/{total} · ", profileFallback: "Profile fallback · ", progressWithPosts: "{prefix}{posts} posts on this page; {matched} quota-related matches so far…", progressWaiting: "{prefix}Waiting for public posts from X…",
  partialDates: "Some date results may be incomplete", recentCheckFailed: "Latest check failed", failureCount: "{count}", signedIn: "Public posts readable", possiblyExpired: "Possibly expired", notConfirmed: "Not confirmed", resultCounts: "All {all} · Quota-related {relevant} (resets {reset}) · Filtered {filtered}", legacySourceCounts: "Search {search} + profile {profile}", postsAndScrolls: "{posts} posts · {scrolls} scrolls", segmentedComplete: "Segmented backfill complete", possiblyIncomplete: "Possibly incomplete", coverageComplete: "Checked {count} date segments; only local-rule matches are stored below.", coverageIncomplete: "Checked {count} date segments; at least one was incomplete, so profile fallback was attempted.", waitingFirstBackfill: "Waiting for the first 72-hour backfill", diagnosticsSummary: "View per-date diagnostics", diagnosticProfile: "Profile fallback", diagnosticComplete: "Completed", diagnosticIncomplete: "Incomplete", diagnosticCounts: "Scan {scanAll} / relevant {scanRelevant} / filtered {scanFiltered} · known {knownAll} / relevant {knownRelevant} · {scrolls} scrolls", diagnosticProfileCounts: "Scan {scanAll} / relevant {scanRelevant} / filtered {scanFiltered} · {scrolls} scrolls",
  judgmentUpcoming: "Tibo may have announced an upcoming quota reset.", actionUpcoming: "Use the remaining quota soon and open the original post to confirm the timing.", judgmentPossible: "Tibo mentioned a possible quota reset, but it is not confirmed.", actionPossible: "Check your remaining quota and watch the original post for updates.", judgmentCompleted: "Tibo indicated that quotas may have been reset or restored.", actionCompleted: "Open ChatGPT or Codex to check the new quota; do not try to spend the old quota.", judgmentLimit: "This message concerns higher limits, usage rules, or quota changes.", actionLimit: "Open the original post to see whether your plan is affected.",
  settingsTitle: "Tibo Reset Watcher Settings", settingsEyebrow: "TIBO RESET WATCHER · {browser}", settingsHeading: "Monitoring settings", settingsIntro: "Rules run locally. The extension does not use the X API, OpenAI API, or a developer server.", checkFrequency: "Check frequency", intervalLabel: "Scheduled check interval", interval1: "1 minute (faster, but more likely to be limited by X)", interval2: "2 minutes (recommended)", interval5: "5 minutes (lighter on X)", interval10: "10 minutes", intervalHelp: "{browser} may delay background work because of power saving, sleeping tabs, or system load, so this interval is not a guarantee.", quotaRules: "Quota rules", rulesIntro: "Built-in rules for upcoming, possible, completed, and negated resets live in a separate module. Add terms here to recognize limit increases or rule changes, one per line.", supplementalTerms: "Additional quota terms", notifyRuleChanges: "Notify about higher limits, ChatGPT Work, banked reset, and general quota-rule changes",
  safetyLimits: "Fixed safety limits", hours72: "72 hours", hours72Help: "Default backfill window after startup, manual checks, or long gaps", items50: "50 events", items50Help: "Only the latest quota-related events are stored", days14: "14 days", days14Help: "Deduplication retention period to prevent unlimited local growth", notificationsData: "Notifications and local data", sendTest: "Send test notification", clearHistory: "Clear event history", clearHelp: "Clearing history keeps post deduplication IDs, so old posts will not notify again. Uninstalling removes all extension-local data.", backgroundSettingsTitle: "{browser} background-running guidance", saveSettings: "Save settings", settingsSaved: "Settings saved", testSent: "Test notification sent", clearConfirm: "Clear the locally stored quota-event history? Post deduplication records will be kept.", historyCleared: "Event history cleared",
  timeUnknown: "Time unknown", publishTimeUnknown: "Publish time unknown", approxMinutesAgo: "about {count} minutes ago", approxHoursAgo: "about {count} hours ago", approxDaysAgo: "about {count} days ago", delayedUrgentTitle: "🚨 Delayed discovery: Tibo reset alert", delayedCompletedTitle: "✅ Delayed discovery: quota may be reset", delayedTitle: "⚠️ Delayed discovery: Tibo quota message", upcomingTitle: "🚨 Tibo quota reset alert", possibleTitle: "⚠️ Tibo may reset quotas", completedTitle: "✅ Tibo says quotas may be reset", changeTitle: "📈 Tibo posted a quota change", checkNewQuota: "Check your new quota.", mayBeOutdated: "This may be outdated; check your current quota and the original post.", useQuotaSoon: "Consider using the remaining quota soon.", resetUncertain: "The reset is not confirmed; follow the original post.", viewChange: "Open the original post to confirm the quota change.", delayedPrefix: "Delayed discovery. ", notificationBody: "{delayed}Published: {published} ({age}); detected: {detected}. {action} Summary: {summary}", loginNotificationTitle: "🔐 Your X login may have expired", loginNotificationBody: "Sign in to X in {browser}, then open the extension and check again.", failureNotificationTitle: "⚠️ Tibo monitoring repeatedly failed", failureNotificationBody: "The extension could not complete several consecutive checks. Open the popup for details.{detail}", testTitle: "🔔 Tibo Reset Watcher test successful", testBody: "{browser} system notifications are working.",
  errorScanTimeout: "The check exceeded its safety timeout; the X page may be suspended or unable to load.", errorMonitorTab: "Could not create or refresh the X monitoring tab: {detail}", reasonNoMore: "X did not provide more older visible results", reasonSegmentExhausted: "Visible results for this date segment were exhausted", reasonSegmentUnreadable: "A date segment returned no readable posts", reasonStageTimeout: "The X page stopped reporting scan progress", reasonEmpty: "X explicitly showed no results for this date segment", reasonAllSegments: "All visible date-segment results were read", reasonScrollLimit: "The scroll safety limit was reached", reasonTimeLimit: "The check time safety limit was reached", reasonNoPosts: "The page returned no readable Tibo posts", reasonProfileFailed: "The Posts & replies fallback failed", reasonUnknown: "Unknown reason", errorCheckFailed: "The check did not succeed.", errorSegmentNavigation: "Could not open a date-segment search page: {detail}", errorProfileFallback: "Could not open Tibo's Posts & replies page: {detail}", errorBackfillIncomplete: "The 72-hour backfill may be incomplete: {reason}", errorRetryFailed: "The X page timed out and the automatic retry failed: {detail}", errorNoProgress: "The X page stopped reporting scan progress; one automatic retry was attempted."
};

export function normalizeLocale(locale) {
  return String(locale || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function getUiLocale() {
  const detected = globalThis.chrome?.i18n?.getUILanguage?.() || globalThis.navigator?.language || "en";
  return normalizeLocale(detected);
}

export function getLocaleTag(locale = getUiLocale()) {
  return normalizeLocale(locale) === "zh" ? "zh-CN" : "en-US";
}

export function detectBrowser(userAgent = globalThis.navigator?.userAgent || "", brands = globalThis.navigator?.userAgentData?.brands || []) {
  const brandText = brands.map((item) => item?.brand || "").join(" ");
  if (/Microsoft Edge/i.test(brandText) || /Edg\//i.test(userAgent)) return { key: "edge", name: "Microsoft Edge", shortName: "Edge" };
  if (/Google Chrome/i.test(brandText) || /Chrome\//i.test(userAgent)) return { key: "chrome", name: "Google Chrome", shortName: "Chrome" };
  return { key: "chromium", name: "Chromium", shortName: "Chromium" };
}

export function tr(key, values = {}, locale = getUiLocale()) {
  const dictionary = normalizeLocale(locale) === "zh" ? ZH : EN;
  const template = dictionary[key] ?? EN[key] ?? key;
  return String(template).replace(/\{(\w+)\}/g, (_match, name) => String(values[name] ?? ""));
}

export function localizeDocument(root = document, browser = detectBrowser(), locale = getUiLocale()) {
  root.documentElement.lang = getLocaleTag(locale);
  for (const element of root.querySelectorAll("[data-i18n]")) {
    element.textContent = tr(element.dataset.i18n, { browser: browser.name }, locale);
  }
  for (const element of root.querySelectorAll("[data-i18n-title]")) {
    element.title = tr(element.dataset.i18nTitle, { browser: browser.name }, locale);
  }
  for (const element of root.querySelectorAll("[data-i18n-aria]")) {
    element.setAttribute("aria-label", tr(element.dataset.i18nAria, { browser: browser.name }, locale));
  }
}
