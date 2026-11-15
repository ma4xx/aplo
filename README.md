# Aplo

A meeting notepad that listens with you.

Aplo records a meeting on your Mac, transcribes it, and lets you ask an AI questions **while the meeting is still running**. It reads the live transcript, so you can ask "what did they just say?" or "how do I answer that?" and get a short answer you can use in the room. After the meeting it writes the summary for you.

## What it adds

- **Simplified Chinese interface**, including dates and the built-in summary templates.
- **Meeting advisor** (Settings → Meeting advisor): an editable instruction that makes the chat act as a second listener. It gives short answers, suggests what you can say next, and helps turn a vague request into a clear scope. You can change it, switch it off, or restore the default.
- **Continuing topics**: put related meetings in one folder and the chat automatically brings in that folder's description and the summaries of the latest three earlier meetings.
- **Its own data folder**: `~/Library/Application Support/aplo`. The first launch copies an existing Anarlog folder across and leaves the original untouched.
- **No hosted backend required**: nothing is sent to analytics, and no hosted service is assumed.

## Build

macOS on Apple Silicon. You need full Xcode with the Metal toolchain, Node 22, pnpm, and the Rust version in `rust-toolchain.toml`.

```bash
pnpm install --frozen-lockfile
cd packages/ui && pnpm run build && cd ../..
cd apps/desktop && pnpm exec tauri build --bundles app
```

## Acknowledgements

Aplo is built on [Anarlog](https://github.com/fastrepl/anarlog) by Fastrepl, Inc. (formerly Hyprnote). Thank you to the team for releasing it as open source; the recording, transcription, editor, and almost everything else here is their work.

## License

MIT. See [`LICENSE`](LICENSE), which keeps the original copyright notice. Some bundled components carry their own licenses; see the `LICENSE*` and `NOTICE` files in their directories. The original Anarlog README is kept at [`docs/upstream/README.anarlog.md`](docs/upstream/README.anarlog.md).
