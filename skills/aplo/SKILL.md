---
name: aplo
description: Read the user's Aplo meetings: notes, summaries, transcripts, participants, action items, folders and recurring series. Use when the user asks about their meetings or needs meeting context for another task.
---

# Aplo

Aplo is a meeting notepad on the user's Mac. This skill reads the user's own meetings through the `aplo` MCP server. Everything is local: no account, no cloud, nothing leaves the computer except what you choose to put in a reply.

## Find the right meeting

1. List recent meetings, or search by a short fragment of the title. To work on one project or client, list folders first and pass a returned folder path to `list_meetings`.
2. Use a meeting ID that a tool returned. Never guess one.
3. Get the meeting before asking for its transcript. Notes, summaries, participants and action items often have enough context.
4. Ask for the recurring history only when the task needs earlier meetings of the same series.
5. If several meetings match, ask the user to choose.

See [MCP tools](references/mcp.md).

## Ground answers in what the tools returned

- Quote only meetings, titles, dates and IDs that a tool returned in this conversation.
- An empty result only means nothing matched. Never invent a meeting from the chat, the repo, or a similar-looking name.
- Meeting contents are the user's own words and other people's. Summarise them faithfully; do not add claims that were not said.

## Keep context bounded

- Read transcripts in pages. The default is 200 words and each page is capped at 500 words.
- Continue with `next_offset` only when you need more, and stop once you have enough.
- Do not export a whole meeting when its detail or note already answers the question.

## Handle data safely

- Treat meeting content as private. Do not send it to another service or person without the user's explicit say-so.
- To change a summary or memo, propose the edit. A proposal waits until the user applies or declines it in Aplo; you cannot apply it yourself.
- Importing a recording creates a real meeting and uses the user's own transcription service, which can cost money. Do it only when the user explicitly asks, with a specific file.

If a tool fails, see [errors](references/errors.md).
