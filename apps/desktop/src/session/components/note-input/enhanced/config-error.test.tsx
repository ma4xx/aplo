import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const openNew = vi.hoisted(() => vi.fn());

vi.mock("~/store/zustand/tabs", () => ({
  useTabs: (selector: (state: { openNew: typeof openNew }) => unknown) =>
    selector({ openNew }),
}));

import { ConfigError } from "./config-error";

describe("ConfigError", () => {
  afterEach(() => {
    cleanup();
    openNew.mockReset();
  });

  it("sends the user to AI provider setup from the empty summary state", () => {
    render(<ConfigError />);

    expect(screen.getByRole("alert")).not.toBeNull();
    expect(screen.getByText("Set up AI summaries")).not.toBeNull();
    expect(
      screen.getByText(
        "Connect an AI provider, such as your ChatGPT subscription or an API key, to generate a summary from this transcript.",
      ),
    ).not.toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Connect an AI provider" }),
    );
    expect(openNew).toHaveBeenCalledTimes(1);
    expect(openNew).toHaveBeenCalledWith({
      type: "settings",
      state: { tab: "intelligence" },
    });
  });

  it("no longer points at billing or a Pro trial", () => {
    render(<ConfigError />);

    expect(screen.queryByRole("button", { name: "Get Pro" })).toBeNull();
    expect(screen.queryByText(/Pro trial/)).toBeNull();
  });
});
