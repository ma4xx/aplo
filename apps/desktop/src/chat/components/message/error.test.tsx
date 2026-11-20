import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@anlg/plugin-opener2", () => ({
  commands: { openUrl: vi.fn() },
}));

vi.mock("~/chat/hooks/use-chat-appearance", () => ({
  useChatAppearance: () => ({
    isDarkAppearance: false,
    toolbarSurface: "light",
    panelClassName: "",
    panelBorderClassName: "",
    elevatedSurfaceClassName: "",
    inputEditorClassName: "",
  }),
}));

vi.mock("~/env", () => ({
  env: { VITE_APP_URL: "http://localhost:3000" },
}));

import { classifyChatError, ErrorMessage, getChatErrorText } from "./error";

describe("ErrorMessage", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders a bare string rejection instead of crashing", () => {
    // Tauri `invoke` rejects with the serialized Rust error, which is a plain
    // string; the AI SDK stores it as `useChat().error` as-is.
    render(<ErrorMessage error="cloudsync_activity_drain_timeout" />);

    expect(screen.getByText("cloudsync_activity_drain_timeout")).toBeTruthy();
  });
});

const OPENAI_QUOTA_ERROR =
  '{"type":"error","sequence_number":2,"error":{"type":"insufficient_quota","code":"credit_balance_exhausted","message":"You have no credits remaining. Add credits to continue using the API at https://platform.openai.com/settings/organization/billing/.","param":null}}';

describe("classifyChatError", () => {
  it("recognizes an exhausted OpenAI API balance", () => {
    expect(classifyChatError(OPENAI_QUOTA_ERROR)).toBe("openai_api_quota");
  });

  it("recognizes other providers' quota errors without pointing at ChatGPT", () => {
    expect(
      classifyChatError("You exceeded your current quota, please check your plan"),
    ).toBe("api_quota");
    expect(
      classifyChatError("Your credit balance is too low to access the API"),
    ).toBe("api_quota");
  });

  it("leaves unrelated errors alone", () => {
    expect(classifyChatError("Request timeout")).toBe("other");
  });
});

describe("ErrorMessage quota hint", () => {
  beforeEach(() => {
    cleanup();
  });

  it("explains an OpenAI quota error and keeps the raw text available", () => {
    render(<ErrorMessage error={new Error(OPENAI_QUOTA_ERROR)} />);

    expect(screen.getByText(/OpenAI API balance has run out/)).toBeTruthy();
    expect(screen.getByText(OPENAI_QUOTA_ERROR)).toBeTruthy();
  });
});

describe("getChatErrorText", () => {
  it("normalizes non-Error values to a string", () => {
    expect(getChatErrorText(new Error("boom"))).toBe("boom");
    expect(getChatErrorText("boom")).toBe("boom");
    expect(getChatErrorText(42)).toBe("42");
    expect(getChatErrorText(undefined)).toBe("undefined");
  });
});
