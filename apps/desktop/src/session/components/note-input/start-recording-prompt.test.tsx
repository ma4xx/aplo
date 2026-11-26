import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sessionMode: "inactive" as string,
  startListening: vi.fn(async () => {}),
  isMainWindow: true,
  requestMainListenerControl: vi.fn(async () => {}),
}));

vi.mock("@lingui/react/macro", () => ({
  useLingui: () => ({
    t: (strings: TemplateStringsArray) => strings.join(""),
  }),
}));

vi.mock("~/stt/contexts", () => ({
  useListener: (
    selector: (state: { getSessionMode: () => string }) => unknown,
  ) => selector({ getSessionMode: () => mocks.sessionMode }),
}));

vi.mock("~/stt/useStartListening", () => ({
  useStartListening: () => mocks.startListening,
}));

vi.mock("~/stt/window-control", () => ({
  isMainWebviewWindow: () => mocks.isMainWindow,
  requestMainListenerControl: mocks.requestMainListenerControl,
}));

import { StartRecordingPrompt } from "./start-recording-prompt";

describe("StartRecordingPrompt", () => {
  beforeEach(() => {
    mocks.sessionMode = "inactive";
    mocks.isMainWindow = true;
    mocks.startListening.mockClear();
    mocks.requestMainListenerControl.mockClear();
  });

  afterEach(cleanup);

  it("starts recording this note when clicked", () => {
    render(<StartRecordingPrompt sessionId="s1" />);

    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));

    expect(mocks.startListening).toHaveBeenCalledTimes(1);
    expect(mocks.requestMainListenerControl).not.toHaveBeenCalled();
  });

  it("asks the main window to record when shown in a note window", () => {
    mocks.isMainWindow = false;
    render(<StartRecordingPrompt sessionId="s1" />);

    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));

    expect(mocks.requestMainListenerControl).toHaveBeenCalledWith(
      "start",
      "s1",
    );
    expect(mocks.startListening).not.toHaveBeenCalled();
  });

  it.each(["active", "finalizing", "running_batch"])(
    "is hidden while the session is %s",
    (mode) => {
      mocks.sessionMode = mode;
      render(<StartRecordingPrompt sessionId="s1" />);

      expect(screen.queryByRole("button")).toBeNull();
    },
  );
});
