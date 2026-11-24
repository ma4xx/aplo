---
inclusion: always
---

# Aplo: product

Aplo is a Chinese-first meeting notepad for Mac (Apple silicon). Tagline: "会上听懂，会后交给 AI 去办" (understand in the meeting, hand it to AI afterwards).

- **In the meeting**: the user records a meeting room with the Mac's microphone and can type questions to an AI that sees the live transcript.
- **After the meeting**: an AI agent (Codex, Claude Code, or any MCP client) reads the whole meeting, including the transcript, through a local MCP connector (`aplo mcp`, stdio, read-only on the local database, no network).
- **Local first**: meetings, transcripts and recordings stay on the user's computer. The user picks the transcription and AI providers, or uses local models.

Everything shown in the UI must work on the user's own Mac with their own keys. Features that depend on someone else's hosted accounts are switched off in `apps/desktop/src/shared/features.ts`, not deleted.

Primary user: a product manager or project manager who attends many meetings and does not use the command line.
