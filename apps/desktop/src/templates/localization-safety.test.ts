import { describe, expect, it } from "vitest";

import { factoryTemplates } from "./locales/factory";
import { localizeTemplate } from "./locales";

// The edit form autosaves whatever it was given. These tests pin the contract
// that keeps translated text out of the database.
describe("template localization safety", () => {
  const stored = {
    id: "default-technical-design-review",
    title: factoryTemplates["default-technical-design-review"]!.title,
    description:
      factoryTemplates["default-technical-design-review"]!.description,
    category: factoryTemplates["default-technical-design-review"]!.category,
    targets: [...factoryTemplates["default-technical-design-review"]!.targets],
    sections: factoryTemplates["default-technical-design-review"]!.sections.map(
      (s) => ({ ...s }),
    ),
  };

  it("a localized copy differs from stored data, so it must never reach the save path", () => {
    const localized = localizeTemplate(stored, "zh");
    expect(localized.title).not.toBe(stored.title);
    expect(localized.sections[0]!.title).not.toBe(stored.sections[0]!.title);
  });

  it("the stored object stays English after localizing", () => {
    localizeTemplate(stored, "zh");
    expect(stored.title).toBe("Technical Design Review");
    expect(stored.sections[0]!.title).toBe("Problem Statement");
  });
});
