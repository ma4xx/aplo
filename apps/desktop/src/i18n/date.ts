import { i18n } from "@lingui/core";
import { setDefaultOptions } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";

import type { DisplayLocale } from "./locales";

// date-fns formats in English unless it is given a locale. Set it once when the
// display language changes so every format()/formatDistance*() call follows it.
export function applyDateFnsLocale(locale: DisplayLocale) {
  setDefaultOptions({ locale: locale === "zh" ? zhCN : undefined });
}

function isChinese() {
  return i18n.locale === "zh";
}

// Date patterns that read naturally in the active display language.
// English output is unchanged from the previous hard-coded patterns.
export function monthDayPattern() {
  return isChinese() ? "M月d日" : "MMM d";
}

export function fullDatePattern() {
  return isChinese() ? "yyyy年M月d日" : "MMM d, yyyy";
}

export function monthYearPattern() {
  return isChinese() ? "yyyy年M月" : "MMMM yyyy";
}
