# 发布检查清单

## 上传 GitHub 前

- [ ] `manifest.json` 名称、版本和描述与 README 一致。
- [ ] `npm test` 全部通过。
- [ ] `npm run check` 全部通过。
- [ ] 在最新稳定版 Microsoft Edge 完成 `docs/TESTING.md` 的正常检查、补查、登录失效和通知测试。
- [ ] 在 Chrome 完成至少一次加载和基本通知兼容测试。
- [ ] 确认仓库中没有 X Cookie、令牌、页面完整导出、个人资料或调试隐私数据。
- [ ] 确认没有 `.env`、密钥、账号信息或本机绝对路径。
- [ ] 检查 `PRIVACY.md` 与实际权限、数据字段完全一致。
- [ ] 检查 README 没有承诺 Edge 完全退出、休眠或关机后仍能实时监测。
- [ ] 检查许可证、贡献指南和更新日志。
- [ ] 创建 GitHub Release，并附版本号、变更、已知限制和源码 ZIP。
- [ ] 说明解压缩版本不会自动从 GitHub 更新。
- [ ] 在 GitHub Issues 中准备“X 页面结构变化”故障模板或标签。

## 提交 Microsoft Edge Add-ons 前

- [ ] 使用 `scripts/package-edge.ps1` 生成商店 ZIP，并确认 `manifest.json` 位于压缩包根目录。
- [ ] 在干净的 Edge 配置文件中从该商店 ZIP 解压后完成全部回归测试。
- [ ] 确认扩展只有一个清晰、狭窄目的：监测 Tibo 的额度相关公开帖子并通知用户。
- [ ] 确认权限仅为 `storage`、`alarms`、`notifications` 和 X / Twitter 主机权限。
- [ ] 确认没有远程托管代码、`eval`、动态执行或未披露的联网端点。
- [ ] 将 `PRIVACY.md` 发布到公开 HTTPS URL，并在 Partner Center 填写该 URL。
- [ ] 准备正式支持 URL 或支持邮箱。
- [ ] 复核 Partner Center 的数据使用披露与本地处理行为一致。
- [ ] 使用 `store/EDGE_LISTING.md` 中的单一用途、权限理由和认证说明。
- [ ] 上传至少 300×300 的扩展 Logo；项目已生成 `store/assets/edge-store-logo-300.png`。
- [ ] 视需要上传 440×280 小型推广图；项目已生成 `store/assets/small-promotional-tile-440x280.png`。
- [ ] 从真实 Edge 弹窗和真实 X 监测流程截取 1280×800 或 640×480 截图；不得使用模拟抓取结果误导审核者。
- [ ] 确认所有商店截图不暴露个人 X 账号、通知中心隐私或其他标签页。
- [ ] 检查名称和素材不暗示 OpenAI、Microsoft、X 或 Tibo 官方背书。
- [ ] 提交认证测试说明，明确审核者需要自行登录 X；不要在包或公开说明中提供真实账号密码。
- [ ] 复核 Microsoft Edge Add-ons 当前开发者政策和素材要求。
- [ ] 上传后检查 Partner Center 的包验证结果，没有警告再提交认证。

## 每次更新前

- [ ] 在 `manifest.json` 和 `package.json` 同步提高版本号。
- [ ] 在 `CHANGELOG.md` 记录用户可见变化。
- [ ] 重新运行自动测试和真实 Edge 回归。
- [ ] 专门检查 X DOM 选择器、逐日查询切换、自适应等待和 72 小时终止逻辑。
- [ ] 验证从上一商店版本升级不会重复通知旧帖子。
- [ ] 生成新的商店 ZIP；不要复用旧 ZIP。
- [ ] 在 Partner Center 更新包并提交新的审核。
