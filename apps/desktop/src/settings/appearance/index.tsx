import { Trans } from "@lingui/react/macro";

import { AppIconSelector } from "./app-icon";
import { SidebarItemFieldsSettings } from "./sidebar-item-fields";
import { ThemeSelector } from "./theme";
import { TimeFormatSettings } from "./time-format";

import { SettingsPageTitle } from "~/settings/page-title";
import { PAID_FEATURES_ENABLED } from "~/shared/features";

export function SettingsAppearance() {
  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <SettingsPageTitle title={<Trans>Appearance</Trans>} />
      <ThemeSelector />
      <TimeFormatSettings />
      {PAID_FEATURES_ENABLED ? <AppIconSelector /> : null}
      <SidebarItemFieldsSettings />
    </div>
  );
}
