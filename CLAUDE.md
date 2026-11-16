# Aplo

Aplo is a Chinese-first meeting notepad. See `README.md` for what it does. Its code started from the open-source Anarlog project (MIT); that is credited in the README's thanks section and nowhere else in user-facing text: do not describe Aplo as a fork or as "based on" another product in the README, the repository description, release notes or the app. `docs/upstream/` holds the original project's README, AGENTS.md, and CI workflows, kept for reference only.

This file is the working agreement. `AGENTS.md` and `.agents/` are upstream's and describe upstream's own workflow (GitButler, PR skills, release tooling). Ignore them where they conflict with this file.

## Who and how

Max is a product manager and indie developer who does not read code. Explain choices in plain language with a recommendation, lead with the conclusion, answer in Chinese, keep code, commands, and identifiers in English. Do not flatter. Flag problems directly.

## Rules

- Large changes: propose first, then build. Small, reversible edits can go ahead.
- Ask before: deleting files or git history, pushing, rebasing, changing CI or secrets, database schema changes, installing global dependencies, publishing anything, and calling paid external APIs (LLM, translation, email, SMS). A past agent ran a translation API unasked and cost over $600.
- Never put keys, tokens, or personal paths in code, commits, or logs. Test fixtures that look like keys (`TEST_PRIVATE_KEY`, test JWTs) are known and fine.
- Do not comment out errors or add bypass flags to make something run. Find the cause.
- Keep the MIT `LICENSE` and every `LICENSE*` file as is. Never add `enterprise/` back: it is commercially licensed.
- Verify after every change with the commands below and report real results, including failures.

## Layout that matters

- `apps/desktop/` is the product: Tauri 2 + React + TypeScript. Rust side is in `apps/desktop/src-tauri/`, `plugins/`, and `crates/`.
- Everything user-visible is translated with Lingui. Catalogs: `apps/desktop/src/i18n/locales/<lang>/messages.po`. Chinese is `zh`.
- Meeting advisor: `apps/desktop/src/chat/advisor-prompt.ts` (default text), `settings/advisor/` (page), `chat/transport/use-transport.ts` (where it is appended).
- Folder context in chat: `chat/context/folder-context.ts` and `use-chat-context-pipeline.ts`.
- Built-in template translations: `templates/locales/`. The database stays English; translation is display-only.
- Date patterns by language: `i18n/date.ts`.

## Translating new strings

1. Wrap UI text: `<Trans>` in JSX, `` t`...` `` in code (`useLingui` inside components, `@lingui/core/macro` elsewhere). Top-level constants cannot call `t` at import time: use a getter, a function, or `msg`.
2. `cd apps/desktop && pnpm exec lingui extract --workers 1` adds new entries to every language file.
3. Fill the empty `msgstr` in `zh/messages.po`. Keep `{placeholders}` and `<0>` tags identical to the source.
4. `pnpm exec lingui compile --strict --workers 1`.

Do not translate: product, model, and provider names; text sent to the AI as instructions or tool descriptions (translating changes model behavior); strings the code compares with `===` or uses as keys or stored titles.

## Verify

```bash
cd apps/desktop
pnpm exec tsc --noEmit
pnpm exec vitest run
pnpm exec lingui compile --strict --workers 1
```

All must pass. The standard build commands are in `README.md`.

The compiled catalogs `apps/desktop/src/i18n/locales/*/messages.ts` are tracked in git and are what the app actually reads. If you run `lingui compile` in a different checkout than the one you commit and build from (for example the full-dependency copy used for tests), copy `zh/messages.ts` back. Otherwise every string whose English source changed shows as a six-character id (like `GAqyfN`) in the app, and no test notices.

## Build notes (macOS 27, Xcode 27.2, Rust 1.94.0)

- Dependency proc-macros fail to load unless dependency debug info is on. Put this in `.cargo/config.toml` (not committed):

  ```toml
  [profile.dev.package."*"]
  debug = 1
  [profile.release.package."*"]
  debug = 1
  ```

- Xcode 27's SwiftPM writes libraries to a different folder than `swift-rs` expects. Run `swift build` with `--build-system native`; a wrapper script named `swift` earlier in `PATH` does it.
- `check-permissions.swift` needs `import ApplicationServices` under the new SDK (already applied).
- Release builds used to require upstream's PostHog key and API URL. They are optional now (`plugins/analytics`, `plugins/calendar`, `plugins/todo`).
- `apps/desktop/src-tauri/resources/mlx.metallib` (about 100 MB) is generated during the build and is git-ignored. If you sync the source onto a build machine with `rsync --delete`, exclude it, or `tauri build` ends with `failed to bundle project` and a bundle that is missing `Resources/mlx-swift_Cmlx.bundle`. The Rust build also leaves a copy at `<target>/release/mlx.metallib`; copy it back to restore.
- Judge a build by its output, not by grepping the log for "error": that bundle failure does not print a line starting with `error`. A good bundle has `Resources/mlx-swift_Cmlx.bundle` and the app is roughly 430 MB.
- Run `scripts/build-cli-sidecar.sh` before every `tauri build`. It builds the `anarlog-cli` crate (binary `anarlog`) and copies it to `apps/desktop/src-tauri/resources/cli/anarlog-cli-aarch64-apple-darwin`; `tauri.macos.conf.json` lists `resources/cli/anarlog-cli` under `bundle.externalBin` next to `binaries/check-permissions`, so the build fails without that file. Declare it in `tauri.macos.conf.json`, not `tauri.conf.json`: the macOS file is merged on top, and Tauri replaces arrays instead of merging them, so an `externalBin` in the main file is silently dropped and the build "succeeds" with no CLI in the app. After a build, check that `Aplo.app/Contents/MacOS/anarlog-cli` exists. The bundle then holds it as `Contents/MacOS/anarlog-cli`. It is the program behind the "Connect AI agents" page: the app links it to `~/.local/bin/aplo`, and AI agents start it as `aplo mcp` (MCP over stdio). It reads `~/Library/Application Support/aplo/app.db` read-only and never talks to a server. Cloud sign-in and the `--source cloud` option still exist in the crate but are not used by anything in Aplo.
- Cargo tests of `anarlog-cli` start a local mock server; behind the Mac mini's network proxy they fail with HTTP 502 unless you run them with `NO_PROXY=127.0.0.1,localhost no_proxy=127.0.0.1,localhost`. If the MCP contract changes on purpose, update `apps/cli/src/snapshots/*.snap` with `INSTA_UPDATE=always` and read the diff.
- `tauri build` only ad-hoc signs the app, and macOS ties every permission grant (microphone, system audio, accessibility, calendar) to the exact bytes of one build. So after every `tauri build`, run `scripts/sign-aplo-local.sh <path to Aplo.app>` on the build machine. It re-signs with the self-signed certificate "Aplo Local Signing", which lives in a dedicated keychain in `~/.aplo-signing/` on the Mac mini (never in the repo). Two different builds then share one designated requirement (`identifier "com.ma4xx.aplo" and certificate root = H"ba04156b…"`), so grants survive rebuilds. If that certificate is ever lost, a new one has a different hash and everyone has to grant permissions once more. It does not make Gatekeeper trust the app on other Macs.
- Releases also end with `Error A public key has been found, but no private key` and exit code 1: the self-update bundle cannot be signed, and the update feature is off. `Aplo.app` itself is fine.

## Merging upstream changes

The Chinese interface touches many existing files (translation markers around strings), so a newer Anarlog release will conflict in many places and there is no shared git history. Diff upstream by hand and port what is wanted. Source snapshot: Anarlog 1.4.34 line, 2026-11-05.

## Known facts, not assumptions

- A meeting open in chat sends its live transcript each turn (verified in a real meeting on 2026-11-11).
- Aplo's data lives in `~/Library/Application Support/aplo`, bundle identifier `com.ma4xx.aplo`, deep-link scheme `aplo`. Before 0.1.0 the fork (then called Auri) shared the official Anarlog folder `anarlog`; on first launch `apps/desktop/src-tauri/src/legacy_import.rs` copies that folder into `aplo` once. It only reads the old folder (never moves or deletes it) and waits while the old app is running. API keys are read from the old keychain items on first use and copied into Aplo's own item; the old items stay. Do not change the identifier or the folder name again without writing a migration like this one.
- Product name is Aplo (Greek *aplo*, "simple"). Hosted-service names (Anarlog Pro, Cloud, Enterprise, account) and protocol strings (`X-Anarlog-E2EE-Key-Id`, `so.anarlog.Anarlog`, `anarlog.so`) are deliberately not renamed: they name someone else's service. Text sent to the AI as tool descriptions (`chat/tools/meetings.ts`) is not renamed either.
- Icon: Max's own glyph (a single-story bold "a", `aplo-menubar-monochrome-glyph.svg`) on a warm off-white square (dark variant for the dark Dock), coloured from `packages/design-system/src/tokens.css`; the menu-bar icons are the glyph in black. Max rejected a colour I picked myself: keep the icon in the app's own palette or black and white. Files: `apps/desktop/src-tauri/icons/{dev,stable}`, `resources/{dev,dev-dark,stable-dark}/AppIcon.icns`, `plugins/tray/icons/`, `apps/desktop/public/assets/anarlog-icon.png`, `public/assets/app-icons/`, and `shared/anarlog-mark.tsx` (the in-app mark).
- Aplo has no accounts, billing or backend, and everything shown must work on the user's own Mac with their own keys. Anything that needs the upstream product's accounts, plans or servers is switched off in `apps/desktop/src/shared/features.ts`, not deleted: `SHARING_ENABLED`, `ACCOUNTS_ENABLED` (Account page, sign-in, sign-up badge, onboarding login, Google/Outlook calendar), `HOSTED_MODELS_ENABLED` (upstream cloud transcription and models, web search), `PAID_FEATURES_ENABLED` (app icons, Auto format editor), `DEVELOPER_TOOLS_ENABLED`, `IMPORTS_ENABLED`, `UPSTREAM_COMMUNITY_ENABLED` (Discord/GitHub/X links, welcome demo, FAQ link), `APP_UPDATES_ENABLED`, `TELEMETRY_SETTINGS_ENABLED`, `INSIGHT_BADGES_ENABLED`. Features the upstream product sells stay off on purpose, so they can become Aplo's paid features later. The tray menu has its own constants (`UPSTREAM_SUPPORT_MENU_ENABLED` in `plugins/tray/src/ext.rs`; updates are off via `tauri_plugin_tray::init(false)`). Tests of a hidden feature turn its switch on with `vi.mock("~/shared/features", ...)`; each switch has a test that shows it is really off.
- Insights reads meetings under the owner id stored in the local database (`useOwnerUserId`), not `DEFAULT_USER_ID`; querying the default id found none of them. Do not wait on `auth.session === undefined` anywhere that has to work without accounts: it never resolves.
- macOS caches the system-audio permission answer inside the app process, so the in-process check can say "not authorized" after the user granted it. `plugins/permissions/src/ext.rs` asks the `check-permissions` helper (a new process each time) when the in-process answer is not "authorized", and trusts either "authorized".
- When you test in a second checkout (`~/Downloads/web/anarlog-src`), copy results back: `rsync` only the changed files with `--files-from`, and never run `oxfmt` on a whole directory (it reformats files you did not touch and rewrites compiled catalogs).
- Not yet measured: transcription accuracy per provider, long meetings, non-macOS platforms.
- Settings-sidebar entries that need Anarlog's hosted services are hidden, not removed: see `HIDDEN_SETTINGS_NAV_IDS` in `apps/desktop/src/sidebar/settings-nav-groups.ts`. The sign-in and Pro prompts are switched off with `SHOW_SIGN_IN_PROMOTION` in `apps/desktop/src/sidebar/toast/registry.tsx`. The Account page is hidden too (`ACCOUNTS_ENABLED`) and comes back with accounts and billing in a commercial release.
- All sharing is switched off with one constant, `SHARING_ENABLED` in `apps/desktop/src/shared/features.ts`: the note Share button, the share buttons on templates, folders and automations, the shared library in the template and automation sidebars, the "shared with me" sidebar view (a stored shared view falls back to my notes), the folder default-access control, the folder share icon, and the default-sharing row in Meeting settings. Notes leave the app through Export. Turning it on shows them all again.
- Entries hidden today: Billing, Invite friends, Teams, Sync, Automations, Dictation, Dictionary, Imports, CRM. Imports and CRM target overseas services; China-market equivalents (Feishu, Tencent Meeting) are the planned replacements.
- Running `lingui extract` rewrites every language catalog. Revert the catalogs of languages that are not maintained (everything except `zh`) before committing.

## Do not do

- Do not run `cargo`, `rustfmt`, or `rustup` on a machine that is not set up to build. The project pins Rust 1.94 in `rust-toolchain.toml`, and any `cargo` call inside the repo downloads that toolchain. Build only where Xcode (with the Metal toolchain) and Rust are installed.
- Do not re-enable the upstream workflows in `docs/upstream/github/`: they target upstream's servers and secrets.
- Do not add `enterprise/` or `apps/web` back. The Rust tests of `plugins/deeplink2` and `plugins/hooks` write into `apps/web/content/` and will recreate it; delete the new `apps/web/` before committing.
- Do not run `pnpm install` just to run the tests if the checkout was copied without a full `node_modules`: a partial install makes about a dozen unrelated tests fail (menu and dialog tests), and reinstalling rewrites `pnpm-lock.yaml`. Run the full suite in a checkout with a complete install, and copy the changed files across.
