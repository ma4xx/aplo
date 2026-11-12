import { loadFolderMaterials } from "~/session/folder-attachments";
import { loadFolderInstructions } from "~/session/folder-catalog";
import { loadSessionContentSnapshot } from "~/session/content-queries";
import { loadSessionSummariesByFolder } from "~/session/queries";

const FOLDER_CONTEXT_SESSION_LIMIT = 50;
// Earlier meetings in the same folder are usually a continuing topic, so the
// latest generated summaries ride along with every chat message. Kept small:
// this text is sent on each turn.
const FOLDER_RECENT_NOTES_LIMIT = 3;
const FOLDER_RECENT_NOTE_MAX_CHARS = 2_500;

function clip(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}…`;
}

async function renderRecentNotes(
  sessions: Array<{ id: string; title: string; created_at: string }>,
  excludeSessionId: string | undefined,
): Promise<string[]> {
  // Sessions arrive newest first. Look a little further back than the limit so
  // meetings without a generated summary do not use up the slots.
  const candidates = sessions
    .filter((session) => session.id !== excludeSessionId)
    .slice(0, FOLDER_RECENT_NOTES_LIMIT * 2);

  const blocks: string[] = [];
  for (const session of candidates) {
    if (blocks.length >= FOLDER_RECENT_NOTES_LIMIT) break;

    const snapshot = await loadSessionContentSnapshot(session.id, {
      includeTranscriptWords: false,
    });
    const summary = snapshot?.enhancedNotes
      .map((note) => note.markdown.trim())
      .filter(Boolean)
      .join("\n\n")
      .trim();
    if (!summary) continue;

    const title = session.title.trim() || "Untitled";
    const date = session.created_at.trim();
    blocks.push(
      `### ${title}${date ? ` (${date})` : ""} [${session.id}]\n${clip(summary, FOLDER_RECENT_NOTE_MAX_CHARS)}`,
    );
  }
  return blocks;
}

export async function renderFolderContext(
  folderId: string,
  options: { currentSessionId?: string } = {},
): Promise<string | null> {
  const sessions = await loadSessionSummariesByFolder(folderId);
  const materials = folderId ? await loadFolderMaterials(folderId) : [];
  const instructions = folderId ? await loadFolderInstructions(folderId) : "";
  const label = folderId || "No folder";
  const lines = [
    `Folder context: ${label} (${sessions.length} ${sessions.length === 1 ? "note" : "notes"})`,
    folderId
      ? "Answer from notes in this folder. Use get_meeting or search_meetings with the listed IDs when you need full notes or transcripts. Use list_meetings with this folder_path to enumerate every note. Use read_folder_material with a listed material ID to read a syllabus or other folder file."
      : "Answer from these unfiled notes. Use get_meeting or search_meetings with the listed IDs when you need full notes or transcripts.",
  ];

  if (instructions.trim()) {
    lines.push("");
    lines.push("Folder instructions:");
    lines.push(instructions.trim());
  }

  if (materials.length > 0) {
    lines.push("");
    lines.push("Folder materials:");
    for (const material of materials) {
      lines.push(`- ${material.filename} [${material.id}]`);
    }
  }

  if (sessions.length === 0) {
    lines.push("");
    lines.push("This folder has no notes yet.");
    return lines.join("\n");
  }

  // Only for a real folder: the "No folder" view mixes unrelated meetings.
  if (folderId) {
    const recent = await renderRecentNotes(sessions, options.currentSessionId);
    if (recent.length > 0) {
      lines.push("");
      lines.push(
        "Recent summaries from earlier meetings in this folder (newest first). Treat them as background for the current meeting; say when the current discussion differs from them:",
      );
      lines.push(recent.join("\n\n"));
    }
  }

  const visible = sessions.slice(0, FOLDER_CONTEXT_SESSION_LIMIT);
  lines.push("");
  for (const session of visible) {
    const title = session.title.trim() || "Untitled";
    const date = session.created_at.trim();
    lines.push(`- ${title}${date ? ` (${date})` : ""} [${session.id}]`);
  }

  const hiddenCount = sessions.length - visible.length;
  if (hiddenCount > 0) {
    lines.push(
      folderId
        ? `- and ${hiddenCount} more (use list_meetings with folder_path "${folderId}" to enumerate every note)`
        : `- and ${hiddenCount} more`,
    );
  }

  return lines.join("\n");
}
