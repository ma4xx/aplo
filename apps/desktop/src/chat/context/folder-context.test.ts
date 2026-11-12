import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadFolderInstructions: vi.fn(),
  loadFolderMaterials: vi.fn(),
  loadSessionSummariesByFolder: vi.fn(),
  loadSessionContentSnapshot: vi.fn(),
}));

vi.mock("~/session/content-queries", () => ({
  loadSessionContentSnapshot: mocks.loadSessionContentSnapshot,
}));

vi.mock("~/session/folder-catalog", () => ({
  loadFolderInstructions: mocks.loadFolderInstructions,
}));

vi.mock("~/session/folder-attachments", () => ({
  loadFolderMaterials: mocks.loadFolderMaterials,
}));

vi.mock("~/session/queries", () => ({
  loadSessionSummariesByFolder: mocks.loadSessionSummariesByFolder,
}));

import { renderFolderContext } from "./folder-context";

describe("folder chat context", () => {
  beforeEach(() => {
    mocks.loadSessionSummariesByFolder.mockReset();
    mocks.loadFolderMaterials.mockReset();
    mocks.loadFolderInstructions.mockReset();
    mocks.loadSessionContentSnapshot.mockReset();
    mocks.loadSessionContentSnapshot.mockResolvedValue(null);
    mocks.loadFolderMaterials.mockResolvedValue([]);
    mocks.loadFolderInstructions.mockResolvedValue("");
  });

  it("renders a folder index with session ids", async () => {
    mocks.loadSessionSummariesByFolder.mockResolvedValue([
      {
        id: "session-1",
        title: "Lecture 1",
        created_at: "2026-08-01T09:00:00.000Z",
      },
      {
        id: "session-2",
        title: "",
        created_at: "2026-08-08T09:00:00.000Z",
      },
    ]);

    const context = await renderFolderContext("CS 101");
    expect(context).toContain("Folder context: CS 101 (2 notes)");
    expect(context).toContain(
      "- Lecture 1 (2026-08-01T09:00:00.000Z) [session-1]",
    );
    expect(context).toContain(
      "- Untitled (2026-08-08T09:00:00.000Z) [session-2]",
    );
    expect(context!.indexOf("[session-1]")).toBeLessThan(
      context!.indexOf("[session-2]"),
    );
    expect(mocks.loadFolderMaterials).toHaveBeenCalledWith("CS 101");
    expect(mocks.loadFolderInstructions).toHaveBeenCalledWith("CS 101");
  });

  it("caps the preview and points to full enumeration past 50 notes", async () => {
    mocks.loadSessionSummariesByFolder.mockResolvedValue(
      Array.from({ length: 51 }, (_, index) => ({
        id: `session-${index + 1}`,
        title: `Lecture ${index + 1}`,
        created_at: "2026-08-01T09:00:00.000Z",
      })),
    );

    const context = await renderFolderContext("CS 101");
    expect(context).toContain("Folder context: CS 101 (51 notes)");
    expect(context).toContain("- Lecture 50 (2026-08-01T09:00:00.000Z)");
    expect(context).not.toContain("[session-51]");
    expect(context).toContain(
      '- and 1 more (use list_meetings with folder_path "CS 101" to enumerate every note)',
    );
  });

  it("keeps a plain count for hidden unfiled notes without a folder path", async () => {
    mocks.loadSessionSummariesByFolder.mockResolvedValue(
      Array.from({ length: 51 }, (_, index) => ({
        id: `session-${index + 1}`,
        title: `Note ${index + 1}`,
        created_at: "2026-08-01T09:00:00.000Z",
      })),
    );

    const context = await renderFolderContext("");
    expect(context).toContain("\n- and 1 more");
    expect(context).not.toContain('No folder" to enumerate');
  });

  it("includes saved folder instructions", async () => {
    mocks.loadSessionSummariesByFolder.mockResolvedValue([]);
    mocks.loadFolderInstructions.mockResolvedValue("Prefer the syllabus.");

    await expect(renderFolderContext("CS 101")).resolves.toContain(
      "Folder instructions:\nPrefer the syllabus.",
    );
  });

  it("lists folder materials before notes", async () => {
    mocks.loadSessionSummariesByFolder.mockResolvedValue([
      {
        id: "session-1",
        title: "Lecture 1",
        created_at: "2026-08-01T09:00:00.000Z",
      },
    ]);
    mocks.loadFolderMaterials.mockResolvedValue([
      {
        id: "mat-1",
        filename: "syllabus.pdf",
        contentType: "application/pdf",
        sizeBytes: 2048,
        relativePath: "materials/syllabus.pdf",
      },
    ]);

    await expect(renderFolderContext("CS 101")).resolves.toContain(
      "- syllabus.pdf [mat-1]",
    );
  });

  it("labels the unfiled view and empty folders", async () => {
    mocks.loadSessionSummariesByFolder.mockResolvedValue([]);

    await expect(renderFolderContext("")).resolves.toContain(
      "Folder context: No folder",
    );
    await expect(renderFolderContext("")).resolves.toContain(
      "This folder has no notes yet.",
    );
  });
  describe("recent summaries", () => {
    const sessions = [
      { id: "s4", title: "Kickoff 4", created_at: "2026-11-04T09:00:00Z" },
      { id: "s3", title: "Kickoff 3", created_at: "2026-11-03T09:00:00Z" },
      { id: "s2", title: "Kickoff 2", created_at: "2026-11-02T09:00:00Z" },
      { id: "s1", title: "Kickoff 1", created_at: "2026-11-01T09:00:00Z" },
    ];
    const summaryFor = (id: string) => ({
      enhancedNotes: [{ markdown: `Summary of ${id}` }],
    });

    it("adds the latest three summaries and leaves older ones out", async () => {
      mocks.loadSessionSummariesByFolder.mockResolvedValue(sessions);
      mocks.loadSessionContentSnapshot.mockImplementation(async (id: string) =>
        summaryFor(id),
      );

      const context = await renderFolderContext("Boss/Q4");
      expect(context).toContain("Summary of s4");
      expect(context).toContain("Summary of s3");
      expect(context).toContain("Summary of s2");
      expect(context).not.toContain("Summary of s1");
    });

    it("skips the meeting that is currently open", async () => {
      mocks.loadSessionSummariesByFolder.mockResolvedValue(sessions);
      mocks.loadSessionContentSnapshot.mockImplementation(async (id: string) =>
        summaryFor(id),
      );

      const context = await renderFolderContext("Boss/Q4", {
        currentSessionId: "s4",
      });
      expect(context).not.toContain("Summary of s4");
      expect(context).toContain("Summary of s3");
      expect(context).toContain("Summary of s1");
    });

    it("skips meetings without a generated summary instead of leaving gaps", async () => {
      mocks.loadSessionSummariesByFolder.mockResolvedValue(sessions);
      mocks.loadSessionContentSnapshot.mockImplementation(async (id: string) =>
        id === "s3" ? { enhancedNotes: [] } : summaryFor(id),
      );

      const context = await renderFolderContext("Boss/Q4");
      expect(context).not.toContain("Summary of s3");
      expect(context).toContain("Summary of s4");
      expect(context).toContain("Summary of s2");
      expect(context).toContain("Summary of s1");
    });

    it("clips a very long summary", async () => {
      mocks.loadSessionSummariesByFolder.mockResolvedValue([sessions[0]]);
      mocks.loadSessionContentSnapshot.mockResolvedValue({
        enhancedNotes: [{ markdown: "x".repeat(10_000) }],
      });

      const context = (await renderFolderContext("Boss/Q4")) ?? "";
      expect(context.length).toBeLessThan(4_000);
      expect(context).toContain("…");
    });

    it("never adds summaries to the unfiled view", async () => {
      mocks.loadSessionSummariesByFolder.mockResolvedValue(sessions);
      mocks.loadSessionContentSnapshot.mockImplementation(async (id: string) =>
        summaryFor(id),
      );

      const context = await renderFolderContext("");
      expect(context).not.toContain("Summary of");
      expect(mocks.loadSessionContentSnapshot).not.toHaveBeenCalled();
    });
  });
});
