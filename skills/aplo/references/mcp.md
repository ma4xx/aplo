# MCP tools and resources

The `aplo` MCP server reads the meetings on this computer. Tools that only read never change anything. Proposal tools stage an edit that the user must apply in Aplo.

| Tool | Use |
| --- | --- |
| `list_meetings` | Find recent meetings by title, ID fragment, or folder. An empty list means none matched; do not invent meetings. |
| `list_folders` | List meeting folders. Pass a returned `path` as `list_meetings` `folder_path` to include its subfolders. |
| `get_meeting` | Metadata, the note, summaries, participants and action items of one meeting. |
| `get_meeting_transcript` | One page of the transcript. Start with `limit: 200`; continue from `pagination.next_offset` only as needed. |
| `get_recurring_meeting_history` | Meetings in the same recurring series as a known meeting, newest first. |
| `export_meeting` | The whole record including the transcript. Use only when smaller reads are not enough. |
| `propose_summary_edit` | Stage a complete replacement summary. Pass `target_id` when a meeting has several summaries. |
| `propose_memo_edit` | Stage a complete replacement memo. |
| `list_proposals` | List staged proposals. Defaults to `status: pending`. |
| `get_proposal` | One proposal with its diff. It is not applied. |
| `decline_proposal` | Discard a pending proposal. Applied proposals cannot be declined. |
| `import_recording` | Create a meeting from a local audio file. Needs Aplo open, uses the user's transcription service, may cost money. Only on explicit request. |
| `get_recording_import` | Progress of an import. Check both `processing_status` and `summary_status` before saying it is done. |

Meetings include `folder_path`, which is `null` for a meeting outside any folder.

Transcript limits are measured in words. The default is 200 and the maximum is 500.

Resources:

- `aplo://meetings/{meeting_id}`
- `aplo://meetings/{meeting_id}/transcript{?offset,limit}`
- `aplo://series/{series_id}`

Prefer tools when you need structured data. Use resources for concise text context.

## Importing a recording

Use `import_recording` with `file_path`, an optional `title`, an existing `folder_path`, and a stable `request_key` so a retry does not create a second meeting. Keep the returned `meeting_id` and `job_id`, then poll `get_recording_import`. Submitting is not completing. `skipped_no_model` and `skipped_too_short` mean no summary was generated; a failed summary keeps the meeting and its transcript.
