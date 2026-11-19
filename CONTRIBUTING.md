# 参与贡献

欢迎提 Issue 和 Pull Request。

- **反馈问题**：在 Issue 里写清楚 macOS 版本、Aplo 版本、你做了什么、看到了什么。涉及会议内容的截图请先打码。
- **提建议**：先开一个 Issue 说明想解决的问题，再动手写代码，避免做了不合适的改动。
- **提交代码**：构建方法见 [README](README.md#从源码构建)。界面上的文字都要经过翻译（Lingui），中文翻译在 `apps/desktop/src/i18n/locales/zh/messages.po`。提交前请在 `apps/desktop` 下跑通：

  ```bash
  pnpm exec tsc --noEmit
  pnpm exec vitest run
  pnpm exec lingui compile --strict --workers 1
  ```

安全问题请按 [SECURITY.md](SECURITY.md) 私下报告。
