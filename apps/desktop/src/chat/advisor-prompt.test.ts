import { describe, expect, it } from "vitest";

import { DEFAULT_ADVISOR_PROMPT, resolveAdvisorPrompt } from "./advisor-prompt";

describe("resolveAdvisorPrompt", () => {
  it("returns nothing when the advisor is turned off", () => {
    expect(resolveAdvisorPrompt({ enabled: false, custom: "x" })).toBeNull();
    expect(resolveAdvisorPrompt({ enabled: false, custom: "" })).toBeNull();
  });

  it("falls back to the built-in default for empty or blank text", () => {
    expect(resolveAdvisorPrompt({ enabled: true, custom: "" })).toBe(
      DEFAULT_ADVISOR_PROMPT,
    );
    expect(resolveAdvisorPrompt({ enabled: true, custom: "  \n " })).toBe(
      DEFAULT_ADVISOR_PROMPT,
    );
  });

  it("uses the user's text when present, trimmed", () => {
    expect(
      resolveAdvisorPrompt({ enabled: true, custom: "  只回答一句话  " }),
    ).toBe("只回答一句话");
  });

  it("keeps the default free of scenario-specific hard-coding", () => {
    // The first use case is boss requirement meetings, but the default must
    // stay usable for any meeting; scenario wording belongs in user edits.
    expect(DEFAULT_ADVISOR_PROMPT).not.toMatch(/老板|需求评审|PRD/);
  });
});
