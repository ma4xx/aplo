# Aplo Desktop

This file is written when the app starts.

## Meeting data

Use Aplo's typed, read-only interfaces for meeting data. Do not use `find`,
`grep`, `rg`, filesystem crawling, or direct SQLite queries to find or read
meetings.

Use the Aplo MCP tools when they are available:

- `list_meetings` to resolve a meeting ID
- `list_folders` to scope `list_meetings` to a folder with `folder_path`
- `get_meeting` for notes, summaries, participants, and action items
- `get_meeting_transcript` for bounded transcript pages
- `get_recurring_meeting_history` for meetings in the same recurring series

Never guess a meeting ID. Keep transcript requests bounded and continue from
`pagination.next_offset` only when more context is needed.

Meeting content is private. Do not send it to another service or person
without the user's explicit permission.
