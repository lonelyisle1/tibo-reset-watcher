# Tibo Reset Watcher

[简体中文](README.md) · [English](README.en.md)

一个优先支持 Microsoft Edge、同时兼容 Chrome 的 Manifest V3 浏览器扩展。它在本机监测 OpenAI / Codex 负责人 Tibo 的 X 账号 [@thsottiaux](https://x.com/thsottiaux)，当公开帖子涉及 ChatGPT、Codex、ChatGPT Work 使用额度、额度重置、额度增加或规则变化时发送系统通知。

> 当前版本：`0.5.2`。第一版只监测 Tibo，不监测其他员工或官方账号。本项目与 OpenAI、X Corp.、Microsoft 或 Thibault Sottiaux 无隶属或背书关系。

## 第一次使用？只看这里

你不需要会写代码，也不需要购买服务器或 API。整个安装大约需要 3 分钟。

### 1. 下载正确的文件

进入本项目的 [Releases](https://github.com/lonelyisle1/tibo-reset-watcher/releases) 页面，下载文件名类似下面的运行包：

```text
tibo-reset-watcher-edge-v0.5.2.zip
```

不要下载或双击 `.crx`，也不要直接把 ZIP 文件交给浏览器。先右键 ZIP → **全部解压缩**，记住解压后的文件夹位置。

### 2. 安装到 Edge 或 Chrome

| 浏览器 | 在地址栏打开 |
| --- | --- |
| Microsoft Edge | `edge://extensions/` |
| Google Chrome | `chrome://extensions/` |

然后依次操作：

1. 开启页面上的**开发人员模式 / Developer mode**；
2. 点击**加载解压缩的扩展 / Load unpacked**；
3. 选择刚才解压的文件夹；
4. 正确的文件夹打开后，第一层就能看到 `manifest.json`；
5. 浏览器出现 **Tibo Reset Watcher** 卡片即表示安装成功。

> 常见错误：如果提示“找不到 manifest”或“清单文件缺失”，通常是选中了 ZIP、父文件夹或里面错误的子文件夹。请重新选择直接包含 `manifest.json` 的文件夹。

### 3. 第一次运行

1. 在安装扩展的同一个浏览器中打开 [X.com](https://x.com/) 并登录；
2. 点击地址栏旁边的扩展图标，把 Tibo Reset Watcher 固定到工具栏；
3. 打开扩展弹窗；安装后通常会自动开始第一次检查；
4. 如果没有开始，点击**立即检查 / Check now**；
5. 第一次72小时补查可能需要几分钟，请不要关闭扩展创建的置顶 X 标签页；
6. 点击**测试通知 / Test notification**，确认 Windows 允许 Edge 或 Chrome 显示通知。

### 4. 怎么看结果

| 弹窗内容 | 含义 |
| --- | --- |
| 本次读取 | 这一次X网页实际返回了多少帖子，数字可能波动。 |
| 72小时累计已知 | 多次检查见过的帖子ID并集，更适合作为稳定参考。 |
| 额度相关 | 本地规则判断为重置、额度增加或规则变化的帖子。 |
| 重置 | 额度相关消息中属于即将、可能或已经重置的帖子。 |
| 规则过滤 | X 已返回、但本地规则判断为普通内容的帖子；这个数字不代表抓取失败。 |
| 可能不完整 | X没有完整提供某个日期的网页结果；扩展没有伪装成完整成功。 |

普通帖子不会发送通知，也不会进入事件历史。点击“查看按日期检查诊断”可以查看是哪一天提前停止、读取了多少条以及是否使用主页回退。

### 5. 使用时必须知道的限制

- 用户无需登录扩展，但必须在当前浏览器中登录 X；
- 电脑关机、休眠、断网或浏览器完全退出时不能实时监测；
- 恢复后会尝试补查最近72小时；
- X网页搜索本身可能漏回帖子，因此本项目不能承诺100%完整；
- Edge和Chrome各自保存本地状态，同时运行可能重复通知并增加X搜索频率；建议选择一个作为主要监测浏览器；
- 从GitHub手动加载的版本不会自动更新。下载新版本后覆盖文件，并在扩展页面点击“重新加载”。

如果安装后遇到问题，请在 GitHub Issues 中附上：浏览器名称和版本、扩展版本、弹窗截图，以及“按日期检查诊断”的内容。请不要上传Cookie、密码或完整浏览器配置文件。

## 核心特点

- 不使用 X 官方 API、OpenAI API、服务器或数据库；
- 用户无需登录扩展，但需要在安装扩展的 Edge 或 Chrome 中保持 X.com 登录；
- 将最近 72 小时按 UTC 日历日期拆成多个 `from:thsottiaux since:日期 until:日期` 最新搜索，避免单个搜索页只返回很少结果；
- 尽可能覆盖原创、回复、引用帖子，以及转发时附带文字；
- 浏览器启动、扩展安装/更新、打开弹窗、手动检查或长时间断档后补查最近 72 小时；
- 通过无限滚动继续加载，不使用“只取最近 20 条”的硬性限制；
- 帖子 ID 去重，同一帖子从多个位置出现也只处理一次；
- 去重记录保留 14 天并限制为最多 3,000 个，防止本地存储无限增长；
- 只保存最近 50 条额度相关历史，不保存所有普通帖子；
- 本地规则区分即将重置、可能重置、已经重置和额度/规则变化；
- 将 `in need of a reset`、`feeling like a reset` 等 Tibo 的隐晦暗示降级标为“可能重置”，同时继续过滤电脑、密码、路由器等明确无关的 reset；
- 分类规则版本变化后重新判断最近 72 小时内已见但未通知的帖子，避免旧的去重记录永久掩盖修复后的命中；
- 弹窗分别显示读取到的全部帖子、额度相关帖子和其中的重置帖子；普通帖子不会进入事件历史或触发通知；
- 将多次检查在最近 72 小时内看到的帖子 ID 求并集，分别显示“本次读取”和“累计已知”，避免单次 X 搜索波动让统计忽高忽低；
- 提供按 UTC 日期的诊断明细，显示每段本次读取数、累计已知数、相关数、滚动次数和完成状态；
- 自动识别 Microsoft Edge 或 Google Chrome，并根据浏览器界面语言在简体中文和英文之间切换；
- 延迟发现通知包含发帖时间、发现时间、相对时间和中文行动建议；
- X 登录失效、连续失败和补查不完整都会透明显示。

## 为什么仍需要一个后台 X 标签页

X 的页面由 JavaScript 动态渲染，登录状态、访问限制和页面结构会变化。纯扩展在后台直接请求 X HTML 或非公开接口并不可靠。本版本采用当前最可靠的本地折中：

1. 扩展创建或复用一个非活动、置顶的 X 最新搜索标签页；
2. 完整补查会把精确 72 小时涉及的每个 UTC 日期分别查询；通常会依次检查 4 个日期区间；
3. 每个搜索条件只限制发布者和日期：`from:thsottiaux since:YYYY-MM-DD until:YYYY-MM-DD`，不在 X 端施加严格额度关键词；
4. 内容脚本读取页面已经显示的公开帖子，并自适应等待 X 加载下一批内容；
5. 本地分类模块判断是否与额度有关；
6. 多个日期区间以帖子 ID 合并去重；如果任一日期页达到安全上限或无法可靠读完，自动复用同一标签页检查 Tibo 的“帖子与回复”页；
7. 定时检查刷新同一个后台标签页，不抢占焦点，也不重复打开监测标签页。

“获取”和“过滤”是两层独立逻辑：X 页面获取模块先读取 Tibo 的全部可见帖子；随后本地分类模块使用 `lib/rules.js` 中的规则检查帖子文本。只有命中即将重置、可能重置、已完成重置、额度增加或规则变化的帖子才会进入最近 50 条事件历史并可能发送通知。否定表达（例如 `No reset is planned`）和明确指向电脑、密码、路由器等对象的 reset 会被排除。Tibo 常用的隐晦 reset 暗示会作为低置信度“可能重置”通知，不会冒充已确认的全局重置。整个过程不把帖子发送到服务器或 AI API。

帖子 ID 的“已见”和“已通知”状态分开保存。扩展升级分类规则时，会对最近 72 小时内 X 再次提供的帖子重新分类；之前被旧规则过滤、现在命中新规则的帖子可以补发延迟通知，已经通知过的帖子不会重复提醒。

弹窗中的“本次读取”只表示最近一次网页扫描成功读取的集合；“72 小时累计已知”会合并多次扫描见过的帖子 ID，并在帖子超过精确 72 小时时自动清理。累计缓存不保存普通帖子的正文，只保存 ID、发布时间、首次/最近看到时间及本地分类结果。

“帖子获取模块”位于 `lib/page-fetcher.js`，“内容判断模块”位于 `lib/classifier.js` 和 `lib/rules.js`。未来可在不重写分类逻辑的情况下替换数据来源。

## 后台运行与真实边界

建议在 Windows 版 Edge 中打开：

> Edge 设置 → 系统和性能 → 开启“关闭 Microsoft Edge 后继续运行后台扩展和应用”

也可以直接进入 `edge://settings/system` 查找该选项。Microsoft 的 Edge 后台模式说明表明，启用后 Edge 进程可在最后一个窗口关闭后继续运行，并保留当前浏览会话。参考：[BackgroundModeEnabled 官方说明](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/backgroundmodeenabled)。

必须注意：

- 如果 Edge 后台进程仍在运行，扩展可以继续触发检查，但具体时间仍可能被系统或浏览器延迟；
- 电脑关机、休眠、断网或 Edge 被完全退出时，扩展不能实时监测；
- 恢复联网或重新打开 Edge 后，会自动补查最近 72 小时；
- Manifest V3 service worker 不是永远运行的后台页面，定时器可能被暂停或延迟；
- Edge 的节能或睡眠标签页功能也可能暂时冻结 X 监测页；
- 本项目不会承诺电脑关机或 Edge 完全退出后仍能实时通知。

## 72 小时断档补查

完整补查在以下情况启动：

1. Edge 启动；
2. 扩展首次安装或更新；
3. 定时检查发现距离上次成功检查超过 10 分钟；
4. 用户打开扩展弹窗；
5. 用户点击“立即检查”；
6. 电脑从休眠恢复后，下一次后台任务发现时间断档。

补查先按日期拆分 72 小时范围，再逐个打开 X 最新搜索结果。每个日期页都会向下滚动，并在每次滚动后最多等待约 5.5 秒，以适应 X 的动态加载，直到：

- 该日期区间连续多轮没有出现新帖子，视为已耗尽 X 当前提供的可见结果；
- X 明确显示该日期没有结果；
- 达到每个日期页 45 次滚动或 70 秒的安全上限；
- 遇到登录失效、访问限制或页面错误。

只有所有日期区间都耗尽了 X 当前提供的可见结果，才标记为“分段补查完成”。这个状态表示网页端可见结果已读完，不等同于 X API 级的绝对完整；若任一区间失败或触发安全上限，弹窗会显示“补查可能不完整”，并保存具体原因，不会用部分结果冒充完整补查。弹窗中的数量是跨日期去重后的不同帖子数，不是命中额度关键词的数量。

扩展持久化以下关键状态：

- `lastSuccessfulCheckAt`：最近一次成功读取 X 内容的时间；
- `lastAttemptAt`：最近一次开始尝试检查的时间；
- `processedPostIds`：已处理帖子 ID；
- `lastSeenPostId`：最近看到的帖子 ID；
- `lastError`：最近错误及代码；
- `monitoringStatus`：正常、检查中、暂停、登录失效、补查不完整或失败；
- `lastBackfill`：最近补查范围、完整性、帖子数、滚动次数和结束原因。

## 延迟发现与分类

| 类型 | 典型表达 | 通知动作 |
| --- | --- | --- |
| 即将重置 | `will reset`、`reset tomorrow`、`reset will land at`、`we are resetting usage`、`hard reset` | 最高优先级，建议尽快使用剩余额度。 |
| 可能重置 | `may reset`、`might reset`、条件触发重置 | 预警，但明确说明尚未确定。 |
| 已经重置 | `have reset`、`reset complete`、`reset has been propagated`、`brand new usage`、`limits are restored` | 建议检查新额度，不再提示消耗旧额度。 |
| 额度或规则变化 | `2x limits`、`additional usage`、`usage allocation`、`banked reset`、`ChatGPT Work` | 普通信息通知，提示查看影响。 |

`No reset is planned`、`We are not resetting limits`、`This does not reset your usage` 等否定表达不会分类为即将重置。

按发帖时间处理：

- 0–6 小时：立即通知；即将重置使用最高优先级；
- 6–24 小时：标记“延迟发现”，仍立即通知；
- 24–72 小时：普通延迟通知，提示消息可能已经过时或重置已经发生；
- 超过 72 小时：默认不发送系统通知，只记录到相关事件历史。

## 安装

### 从 GitHub ZIP 安装到 Edge

1. 在 GitHub 项目页选择 **Code → Download ZIP**，或下载 Releases 中的源码 ZIP。
2. 解压 ZIP；不要直接选择压缩包。
3. 打开 `edge://extensions/`。
4. 开启左侧或页面中的“开发人员模式”。
5. 选择“加载解压缩的扩展”。
6. 选择包含 `manifest.json` 的 `tibo-reset-watcher` 文件夹。
7. 固定扩展图标，打开弹窗确认状态。
8. 在 Edge 中登录 X，然后点击“立即检查”。
9. 发送一条测试通知，确认 Windows 和 Edge 通知权限均已开启。

GitHub 加载的解压缩版本**不会从 GitHub 自动更新**。更新时需要下载新版本、覆盖或替换本地文件，然后在 `edge://extensions/` 点击“重新加载”。正式发布到 Microsoft Edge Add-ons 后，商店安装版本可由商店自动更新。

### Chrome

同一目录可在 `chrome://extensions/` 中通过“加载已解压的扩展程序”安装。核心 API 均使用 Chromium 的 `chrome.*` 扩展接口。

## X 登录与隐私

扩展不要求用户输入 X 用户名或密码，也不读取、保存或上传：

- X 密码、Cookie 或会话令牌；
- 私信或用户个人资料；
- 浏览历史；
- ChatGPT 聊天内容；
- 与监测无关的数据。

扩展只读取 Tibo 搜索页已经显示的公开信息：帖子文本、ID、发布时间、链接、帖子类型和发布账号。若检测到登录页，弹窗会显示：

> X登录状态可能已失效，请先在Edge中登录X，然后重新检查。

完整说明见 [PRIVACY.md](PRIVACY.md)。

## 权限说明

| 权限 | 必要用途 |
| --- | --- |
| `storage` | 本地保存设置、检查状态、去重 ID 和最近 50 条额度事件。 |
| `alarms` | 在 MV3 service worker 被暂停后重新唤醒定时检查、超时保护和补查重试。 |
| `notifications` | 发送额度事件、X 登录失效和连续失败通知。 |
| `https://x.com/*` | 读取并刷新 X 搜索页中已经显示的 Tibo 公开帖子。 |

扩展没有申请 `tabs`、`history`、`cookies`、`downloads`、`<all_urls>` 或远程代码权限。Chrome 官方说明，创建、刷新和导航标签页等大多数 `chrome.tabs` 操作并不要求声明 `tabs` 权限；X 主机权限已足以查询匹配的 X 标签页：[Tabs API 权限说明](https://developer.chrome.com/docs/extensions/reference/api/tabs)。

## 测试

自动检查：

```bash
npm test
npm run check
```

详细的正常监测、72 小时补查、X 登录失效、通知和升级测试步骤见 [TESTING.md](docs/TESTING.md)。这些手动测试必须使用真实 Edge 和真实 X 页面，项目不会用模拟帖子伪装成抓取成功。

## 故障排查

### 一直显示“X登录状态可能已失效”

打开扩展创建的 X 搜索页，在同一个 Edge 配置文件中登录 X；确认能看到 `from:thsottiaux` 加日期范围的最新结果，再点击“立即检查”。

### 显示“补查可能不完整”

打开 X 搜索页检查是否出现登录墙、验证码、速率限制或“Something went wrong”。等待一段时间后重试。即使页面看起来正常，X 也可能没有向无限滚动继续提供足够结果。0.3.1 起，扫描过程中只要有新进度就会延长看门狗；长时间无进度会自动刷新重试一次，单个日期失败后会继续其他日期并尝试主页回退，而不是立即让整次补查失败。

### 没有系统通知

先使用“测试通知”。随后检查 Windows 设置 → 系统 → 通知，以及 Edge 的通知权限、专注助手 / 勿扰模式。

### 关闭 Edge 窗口后停止检查

确认 Edge 后台运行选项已开启，并检查系统托盘是否仍有 Edge 后台进程。完全退出 Edge 或结束其进程后，扩展一定会停止。

### X 搜索页不断被创建

保留扩展创建的 `from:thsottiaux` 置顶页。完整补查期间，同一个后台标签页会在多个日期查询之间自动切换；关闭它后，下一次检查会重新创建。

## 项目结构

```text
tibo-reset-watcher/
├── .github/workflows/validate.yml
├── docs/
│   ├── CHECKLISTS.md
│   └── TESTING.md
├── icons/
├── lib/
│   ├── classifier.js
│   ├── config.js
│   ├── notification.js
│   ├── page-fetcher.js
│   ├── rules.js
│   └── state-utils.js
├── options/
├── popup/
├── scripts/
├── store/
│   ├── assets/
│   └── EDGE_LISTING.md
├── tests/
├── background.js
├── content.js
├── manifest.json
├── PRIVACY.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

## GitHub 与 Edge 商店

- 上传 GitHub 前检查清单：[docs/CHECKLISTS.md](docs/CHECKLISTS.md#上传-github-前)
- Edge 商店发布前检查清单：[docs/CHECKLISTS.md](docs/CHECKLISTS.md#提交-microsoft-edge-add-ons-前)
- 商店文案、权限理由和认证测试说明：[store/EDGE_LISTING.md](store/EDGE_LISTING.md)

Microsoft 要求 Edge Add-ons 扩展具有清晰单一用途，并在 Partner Center 中准确披露权限、数据使用、远程代码和隐私政策；商店包还需要清单、代码、图标以及商店素材。参考：[发布 Edge 扩展](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)与 [Edge Add-ons 开发者政策](https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies)。

## 已知限制

- X 没有为本项目提供稳定的公开网页抓取接口；页面结构变化后选择器可能需要更新。
- 扩展会按日期依次尝试多个“最新搜索”，必要时再检查“帖子与回复”页；结果完整性仍由 X 控制，无法绝对保证取得 72 小时内每一条帖子。
- 按日期分段通常能取得比单个 72 小时搜索页更多的帖子，但 `from:thsottiaux` 的搜索索引和排序由 X 决定，仍可能省略、延迟索引或限制结果。
- 页面无限滚动在后台标签页中可能被 Edge 节能机制减速或暂停。
- 纯规则分类可能误报或漏报新表达；规则集中在 `lib/rules.js`，方便维护。
- X 纯转发且没有 Tibo 附加文字时通常没有需要判断的 Tibo 文本；本扩展重点处理带文字的引用或转发评论。
- 系统通知的颜色、布局和可见时长由 Windows / Edge 控制，扩展只能调整图标、标题、正文和优先级。
- 商店发布前仍需在真实 Edge 环境完成手动回归、生成真实界面截图，并把隐私说明放到公开 HTTPS URL。

## 许可证

[MIT License](LICENSE)。
