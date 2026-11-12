import { factoryTemplates } from "./factory";
import type { TemplateLocalePack } from "./types";
import { zhTemplates } from "./zh";

import type { DisplayLocale } from "~/i18n/locales";

// Add a language here (and a file next to zh.ts) to localize built-in templates.
// Locales without a pack fall back to the English data stored in the database.
const PACKS: Partial<Record<DisplayLocale, TemplateLocalePack>> = {
  zh: zhTemplates,
};

type LocalizableTemplate = {
  id: string;
  title: string;
  description: string;
  category?: string;
  targets?: string[];
  sections: Array<{ title: string; description: string }>;
};

function sameList(a: readonly string[] | undefined, b: readonly string[]) {
  const left = a ?? [];
  return left.length === b.length && left.every((v, i) => v === b[i]);
}

// True while the stored template still equals the shipped English content.
// Once the user edits any field it stops matching and is shown exactly as saved.
export function isUntouchedFactoryTemplate(
  template: LocalizableTemplate,
): boolean {
  const factory = factoryTemplates[template.id];
  if (!factory) return false;
  if (template.title !== factory.title) return false;
  if (template.description !== factory.description) return false;
  if ((template.category ?? "") !== factory.category) return false;
  if (!sameList(template.targets, factory.targets)) return false;
  if (template.sections.length !== factory.sections.length) return false;
  return template.sections.every(
    (section, i) =>
      section.title === factory.sections[i]!.title &&
      section.description === factory.sections[i]!.description,
  );
}

// Returns a display copy in the given locale, or the input unchanged.
// Never use the result for editing or saving: it would write translated text
// over the English data stored in the database.
export function localizeTemplate<T extends LocalizableTemplate>(
  template: T,
  locale: string,
): T {
  const pack = PACKS[locale as DisplayLocale];
  const entry = pack?.[template.id];
  if (!entry || !isUntouchedFactoryTemplate(template)) return template;

  return {
    ...template,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    targets: entry.targets,
    sections: entry.sections.map((section) => ({ ...section })),
  };
}
