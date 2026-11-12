import { describe, expect, it } from "vitest";

import { factoryTemplates } from "./factory";
import { isUntouchedFactoryTemplate, localizeTemplate } from "./index";
import { zhTemplates } from "./zh";

function stored(id: string) {
  const factory = factoryTemplates[id]!;
  return {
    id,
    title: factory.title,
    description: factory.description,
    category: factory.category,
    targets: [...factory.targets],
    sections: factory.sections.map((section) => ({ ...section })),
  };
}

describe("template localization", () => {
  it("has a Chinese entry with matching shape for every factory template", () => {
    for (const [id, factory] of Object.entries(factoryTemplates)) {
      const zh = zhTemplates[id];
      expect(zh, id).toBeDefined();
      expect(zh!.targets.length, id).toBe(factory.targets.length);
      expect(zh!.sections.length, id).toBe(factory.sections.length);
      factory.sections.forEach((section, i) => {
        // Empty descriptions stay empty so the AI input keeps the same shape.
        expect(zh!.sections[i]!.description === "", `${id}[${i}]`).toBe(
          section.description === "",
        );
      });
    }
  });

  it("translates an untouched built-in template in zh", () => {
    const result = localizeTemplate(stored("default-board-meeting"), "zh");
    expect(result.title).toBe("董事会会议");
    expect(result.category).toBe("管理层");
    expect(result.targets).toEqual(["创始人", "CEO", "董事"]);
    expect(result.sections[0]).toEqual({
      title: "公司业绩",
      description: "财务和运营进展",
    });
  });

  it("keeps English for locales without a pack", () => {
    const template = stored("default-board-meeting");
    expect(localizeTemplate(template, "en")).toBe(template);
    expect(localizeTemplate(template, "fr")).toBe(template);
  });

  it("never translates a template the user edited", () => {
    const base = stored("default-daily-standup");
    const edits = [
      { ...base, title: "My Standup" },
      { ...base, description: `${base.description} (mine)` },
      { ...base, category: "Custom" },
      { ...base, targets: [...base.targets, "Intern"] },
      { ...base, sections: base.sections.slice(1) },
      {
        ...base,
        sections: base.sections.map((section, i) =>
          i === 0 ? { ...section, title: "Wins" } : section,
        ),
      },
    ];
    for (const edited of edits) {
      expect(isUntouchedFactoryTemplate(edited)).toBe(false);
      expect(localizeTemplate(edited, "zh")).toBe(edited);
    }
  });

  it("ignores templates that are not built in", () => {
    const custom = { ...stored("default-board-meeting"), id: "my-own-id" };
    expect(localizeTemplate(custom, "zh")).toBe(custom);
  });

  it("does not mutate the stored template", () => {
    const template = stored("default-sprint-planning");
    const snapshot = JSON.stringify(template);
    localizeTemplate(template, "zh");
    expect(JSON.stringify(template)).toBe(snapshot);
  });

  it("treats a missing category like the factory empty value", () => {
    const template = {
      ...stored("default-board-meeting"),
      category: undefined,
    };
    expect(isUntouchedFactoryTemplate(template)).toBe(false);
  });
});
