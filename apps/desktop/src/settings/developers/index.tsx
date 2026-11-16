import { t } from "@lingui/core/macro";

import { CliSettingsSections } from "./cli";
import { CloudApiSection } from "./cloud-api";
import { WebhooksSection } from "./webhooks";

import { SettingsPageTitle } from "~/settings/page-title";
import { CLOUD_API_ENABLED } from "~/shared/features";

export {
  buildMcpConfiguration,
  buildMcpSetupMessage,
  getCliInstallNotification,
} from "./cli";

export function SettingsDevelopers() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsPageTitle title={t`Connect AI agents`} />
      <CliSettingsSections />
      {CLOUD_API_ENABLED ? (
        <>
          <CloudApiSection />
          <WebhooksSection />
        </>
      ) : null}
    </div>
  );
}
