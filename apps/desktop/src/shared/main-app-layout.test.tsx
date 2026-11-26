import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  windowLabel: "main",
}));

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div data-testid="outlet" />,
  useNavigate: () => vi.fn(),
}));

vi.mock("@tauri-apps/api/webviewWindow", () => ({
  getCurrentWebviewWindow: () => ({}),
}));

vi.mock("@anlg/plugin-windows", () => ({
  events: {},
  getCurrentWebviewWindowLabel: () => mocks.windowLabel,
}));

vi.mock("./useNewNote", () => ({
  openNewNoteAndListen: vi.fn(),
  openSessionAndListen: vi.fn(),
  useNewNote: () => vi.fn(),
}));

vi.mock("~/auth", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock("~/auth/billing", () => ({
  BillingProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("~/enterprise-capture/lifecycle", () => ({
  EnterpriseCaptureSync: () => <div data-testid="enterprise-capture-sync" />,
}));

vi.mock("~/session/queries", () => ({
  getOrCreateSessionForEventId: vi.fn(),
}));

vi.mock("~/services/meeting-import-sync", () => ({
  MeetingImportSync: () => <div data-testid="meeting-import-sync" />,
}));

vi.mock("~/settings/team/mirror", () => ({
  useMyWorkspacesWithMirror: vi.fn(),
}));

vi.mock("~/settings/team/invitation-toast", () => ({
  WorkspaceInvitationToasts: () => (
    <div data-testid="workspace-invitation-toasts" />
  ),
}));

vi.mock("@anlg/ui/hooks/use-mount-effect", () => ({
  useMountEffect: vi.fn(),
}));

vi.mock("~/sidebar/toast/undo-delete-toast", () => ({
  UndoDeleteToast: () => null,
}));

vi.mock("~/store/zustand/tabs", () => ({
  isTabInputSupported: vi.fn(() => true),
  useTabs: () => vi.fn(),
}));

import MainAppLayout, { handleOpenTabRequest } from "./main-app-layout";
import { openNewNoteAndListen } from "./useNewNote";

describe("MainAppLayout", () => {
  beforeEach(() => {
    mocks.windowLabel = "main";
  });

  afterEach(cleanup);

  it("mounts main-window sync services inside the auth provider", () => {
    render(<MainAppLayout />);

    const authProvider = screen.getByTestId("auth-provider");
    expect(
      authProvider.contains(screen.getByTestId("meeting-import-sync")),
    ).toBe(true);
    expect(
      authProvider.contains(screen.getByTestId("enterprise-capture-sync")),
    ).toBe(true);
    expect(
      authProvider.contains(screen.getByTestId("workspace-invitation-toasts")),
    ).toBe(true);
  });

  it("does not mount connected import sync in secondary windows", () => {
    mocks.windowLabel = "note";

    render(<MainAppLayout />);

    expect(screen.queryByTestId("meeting-import-sync")).toBeNull();
    expect(screen.queryByTestId("enterprise-capture-sync")).toBeNull();
    expect(screen.queryByTestId("workspace-invitation-toasts")).toBeNull();
  });
});

describe("handleOpenTabRequest", () => {
  afterEach(() => {
    vi.mocked(openNewNoteAndListen).mockClear();
  });

  it("starts recording when the tray asks for a new meeting", () => {
    const openNewNote = vi.fn();
    const openNew = vi.fn();

    handleOpenTabRequest(
      { type: "sessions", id: "new", state: { view: null, autoStart: true } },
      { openNewNote, openNew },
    );

    expect(openNewNoteAndListen).toHaveBeenCalledWith({ behavior: "new" });
    expect(openNewNote).not.toHaveBeenCalled();
    expect(openNew).not.toHaveBeenCalled();
  });

  it("opens a blank note when autoStart is not set", () => {
    const openNewNote = vi.fn();
    const openNew = vi.fn();

    handleOpenTabRequest(
      { type: "sessions", id: "new", state: { view: null, autoStart: null } },
      { openNewNote, openNew },
    );
    handleOpenTabRequest({ type: "sessions", id: "new" }, {
      openNewNote,
      openNew,
    });

    expect(openNewNote).toHaveBeenCalledTimes(2);
    expect(openNewNoteAndListen).not.toHaveBeenCalled();
  });

  it("opens other tabs as before", () => {
    const openNewNote = vi.fn();
    const openNew = vi.fn();
    const tab = { type: "sessions" as const, id: "abc" };

    handleOpenTabRequest(tab, { openNewNote, openNew });

    expect(openNew).toHaveBeenCalledWith(tab);
    expect(openNewNote).not.toHaveBeenCalled();
  });
});
