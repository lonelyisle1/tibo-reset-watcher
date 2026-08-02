# Microsoft Edge Add-ons 发布资料草稿

## 扩展名称

Tibo Reset Watcher

## Manifest 短描述

在 Edge 中监测 @thsottiaux 的公开 X 帖子，提醒 Codex 与 ChatGPT 额度重置或规则变化。

## 单一用途说明

监测 OpenAI / Codex 负责人 Tibo 的公开 X 帖子，并在帖子涉及 ChatGPT、Codex 或 ChatGPT Work 使用额度、额度重置、额度增加或规则变化时，通过 Microsoft Edge 系统通知提醒用户。

## 中文商店描述

Tibo Reset Watcher 是一个优先为 Microsoft Edge 设计的本地额度公告监测扩展。它只监测 Tibo 的公开 X 账号 @thsottiaux，不监测其他员工或官方账号。当 Tibo 发布与 ChatGPT、Codex、ChatGPT Work 使用额度、额度重置、额度增加、banked reset 或额度规则变化有关的原创帖子、回复或引用消息时，扩展会使用本地规则分类并发送简洁中文通知。

扩展不使用 X API、OpenAI API、开发者服务器、分析统计或远程代码。用户不需要登录扩展，但需要在同一个 Edge 配置文件中保持 X.com 登录。扩展只读取 X 搜索页已经显示的 Tibo 公开帖子文本、帖子 ID、发布时间、链接、帖子类型和发布账号，不读取或上传 X 密码、Cookie、会话令牌、私信、浏览历史或 ChatGPT 聊天内容。

Edge 启动、扩展更新、打开弹窗、手动检查或长时间断档后，扩展会把最近 72 小时按 UTC 日历日期拆成多个宽泛搜索，并用帖子 ID 合并去重。如果 X 页面没有返回足够内容，弹窗会明确显示补查可能不完整。电脑关机、休眠、断网或 Edge 被完全退出期间无法实时监测，下一次启动后只能进行断档补查。

## 权限理由

- `storage`：仅在用户设备上保存启用状态、检查时间、补查状态、去重帖子 ID 和最近 50 条额度相关事件。
- `alarms`：定时唤醒 Manifest V3 service worker，执行检查、超时保护和断档补查重试。
- `notifications`：显示额度事件、X 登录失效和连续失败通知。
- `https://x.com/*`：打开、刷新并读取带日期范围的 `from:thsottiaux` 搜索页以及必要时的 Tibo“帖子与回复”页。内容脚本在代码中再次校验发布账号路径。

## 远程代码

不使用远程代码。所有 JavaScript、规则、HTML、CSS 和图标均包含在扩展包内；没有 `eval`、`new Function` 或远程脚本加载。

## 数据使用披露建议

扩展在本机处理 Tibo 的公开帖子内容和本地运行状态，不将数据传输到开发者服务器。提交者应根据 Partner Center 当时的表单定义，如实披露“访问或处理公开网站内容”和本地存储行为，并确保选择项与公开隐私政策完全一致。

## 认证测试说明草稿

1. 安装后，扩展会创建一个非活动、置顶的 X 搜索页；完整补查时查询形如 `from:thsottiaux since:YYYY-MM-DD until:YYYY-MM-DD` 并选择“最新”。
2. 审核者需要在自己的 Microsoft Edge 测试配置文件中登录 X；本扩展不提供、获取或存储账号凭证。
3. 点击扩展图标可查看监测状态、最近成功和尝试时间、72 小时补查完整性及相关事件历史。
4. 点击“立即检查”会在同一后台标签页依次检查多个日期区间并自适应等待滚动加载；如果 X 未提供足够结果，界面会明确显示“补查可能不完整”。
5. 点击“测试通知”可验证系统通知，无需等待真实额度公告。
6. 由于真实帖子由 X 动态提供，审核时不保证存在新的额度事件；扩展不会显示伪造的模拟抓取结果。
7. 关闭监测开关后，定时任务停止。

## 搜索词建议

Codex quota; ChatGPT limits; usage reset; Tibo; quota alert

## 已准备素材

- `assets/edge-store-logo-300.png`：300×300，商店 Logo。
- `assets/small-promotional-tile-440x280.png`：440×280，小型推广图。

真实功能截图需要在最终 Edge 版本中手动拍摄，以免用模拟结果误导用户或审核者。
