import { i18n } from "@lingui/core";

import { useConfigValue } from "~/shared/config";

export function useTimeFormat() {
  const use24Hour = useConfigValue("use_24_hour_time");
  if (use24Hour) return "HH:mm";
  return i18n.locale === "zh" ? "ah:mm" : "h:mm a";
}
