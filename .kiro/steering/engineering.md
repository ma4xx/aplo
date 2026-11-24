---
inclusion: always
---

# Aplo: engineering rules

The full working agreement is `CLAUDE.md` at the repository root. This file is the short version.

- Stack: Tauri 2, React, TypeScript; Rust in `apps/desktop/src-tauri/`, `plugins/`, `crates/`; CLI and MCP server in `apps/cli/`.
- All user-visible text is translated with Lingui. Chinese catalog: `apps/desktop/src/i18n/locales/zh/messages.po`. Do not translate product or provider names, or text sent to the AI as instructions.
- Verify after every change:
  ```bash
  cd apps/desktop
  pnpm exec tsc --noEmit
  pnpm exec vitest run
  pnpm exec lingui compile --strict --workers 1
  ```
- Ask the owner before deleting files or git history, pushing, changing CI or secrets, changing the database schema, installing global dependencies, publishing, or calling paid external APIs.
- Never put keys, tokens or personal paths in code, commits or logs.
- Do not comment out errors or add bypass flags to make something run. Find the cause.
- Commits use the GitHub no-reply email configured in the repository, never a personal email.
