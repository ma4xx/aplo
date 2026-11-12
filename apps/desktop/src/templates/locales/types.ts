export type TemplateLocaleEntry = {
  title: string;
  description: string;
  category: string;
  targets: string[];
  sections: Array<{ title: string; description: string }>;
};

export type TemplateLocalePack = Record<string, TemplateLocaleEntry>;
