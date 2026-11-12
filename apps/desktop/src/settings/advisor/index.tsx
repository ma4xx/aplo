import { Trans, useLingui } from "@lingui/react/macro";
import { useEffect, useState } from "react";

import { Button } from "@anlg/ui/components/ui/button";
import { Textarea } from "@anlg/ui/components/ui/textarea";

import { DEFAULT_ADVISOR_PROMPT } from "~/chat/advisor-prompt";
import { SettingsPageTitle } from "~/settings/page-title";
import { useSetSettingValue } from "~/settings/queries";
import { SettingSwitchRow } from "~/settings/setting-row";
import { useConfigValue } from "~/shared/config";

export function SettingsAdvisor() {
  const { t } = useLingui();
  const enabled = useConfigValue("chat_advisor_enabled");
  const saved = useConfigValue("chat_advisor_prompt");
  const setEnabled = useSetSettingValue("chat_advisor_enabled");
  const setPrompt = useSetSettingValue("chat_advisor_prompt");

  // What is shown is the saved text, or the built-in default when nothing is
  // saved. An empty saved value always means "use the default".
  const shown = saved.trim() ? saved : DEFAULT_ADVISOR_PROMPT;
  const [draft, setDraft] = useState(shown);
  useEffect(() => {
    setDraft(shown);
  }, [shown]);

  const isDefault = !saved.trim();
  const commit = () => {
    const next = draft.trim();
    if (next === shown.trim()) return;
    // Saving the default text verbatim stores nothing, so later improvements
    // to the built-in default still reach people who never customized it.
    setPrompt(next === DEFAULT_ADVISOR_PROMPT.trim() ? "" : draft);
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsPageTitle title={<Trans>Meeting advisor</Trans>} />

      <SettingSwitchRow
        title={<Trans>Enable meeting advisor</Trans>}
        description={
          <Trans>
            Chat acts as a second listener during meetings and helps you
            understand, respond, and decide.
          </Trans>
        }
        checked={enabled}
        onChange={setEnabled}
      />

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">
          <Trans>Advisor instructions</Trans>
        </h3>
        <p className="text-muted-foreground text-xs">
          <Trans>
            Added to every chat. Change the role, the way it analyzes, or how
            short its answers should be. Edits apply to your next message.
          </Trans>
        </p>
        <Textarea
          aria-label={t`Advisor instructions`}
          value={draft}
          rows={16}
          disabled={!enabled}
          className="text-sm leading-6"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!enabled || isDefault}
            onClick={() => setPrompt("")}
          >
            <Trans>Restore default</Trans>
          </Button>
          <span className="text-muted-foreground text-xs">
            {isDefault ? (
              <Trans>Using the built-in default.</Trans>
            ) : (
              <Trans>Using your custom instructions.</Trans>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
