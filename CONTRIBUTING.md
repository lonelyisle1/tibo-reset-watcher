# 参与贡献

欢迎提交 Issue 和 Pull Request，尤其是：

- X 页面结构变化后的选择器修复；
- 真实额度公告的误报 / 漏报样例；
- Chrome 与 Edge 的兼容性问题；
- 无需扩大权限范围的可靠性改进；
- 中文或英文文档改进。

提交代码前请运行：

```bash
npm test
npm run check
```

并按照 `docs/TESTING.md` 在真实 Microsoft Edge 与已登录的 X 会话中完成相关手动测试。不要用模拟帖子替代真实页面抓取测试。

请不要提交 X Cookie、页面完整导出、个人账号信息或其他敏感数据。报告分类问题时，只提供公开帖链接和必要的公开文本。

新增权限、联网服务或遥测功能必须在 PR 中说明必要性，并同步更新 `README.md` 与 `PRIVACY.md`。
