import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CheckCircle, CircleNotch, Copy } from "@anlg/ui/components/icons";
import { Button } from "@anlg/ui/components/ui/button";
import { toast } from "@anlg/ui/components/ui/toast";
import { cn } from "@anlg/utils";

import { SkillsRow } from "./skills";

import { commands, type EmbeddedCliStatus } from "~/types/tauri.gen";

const CLI_STATUS_QUERY_KEY = ["embedded-cli-status"] as const;

async function loadStatus() {
  const result = await commands.checkEmbeddedCli();
  if (result.status === "error") {
    throw new Error(result.error);
  }
  return result.data;
}

async function copyText(
  text: string,
  successMessage: string,
  fallbackErrorMessage: string,
) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : fallbackErrorMessage);
  }
}

export function buildMcpConfiguration(command: string) {
  return JSON.stringify(
    {
      mcpServers: {
        aplo: {
          command,
          args: ["mcp"],
        },
      },
    },
    null,
    2,
  );
}

// What the user pastes into their AI agent (Claude Code, Codex, WorkBuddy...). It is
// written for the agent to read, so it is plain Chinese instructions plus the exact
// configuration, and it asks the agent to prove the setup works. Not translated:
// it is an instruction for the model, not interface text.
export function buildMcpSetupMessage(command: string) {
  return [
    "请帮我把 Aplo（我电脑上的会议记录软件）的 MCP 服务配置到你自己的 MCP 设置里，这样你以后可以直接查阅我的会议纪要和逐字稿。",
    "",
    "要添加的服务：",
    "- 名称：aplo",
    `- 启动命令：${command}`,
    "- 参数：mcp",
    "- 传输方式：stdio（本地命令，不需要网络，也不需要任何账号）",
    "",
    "标准的 JSON 配置如下。如果你的配置文件是别的格式（比如 TOML），请按你自己的格式写入同样的内容：",
    "",
    "```json",
    buildMcpConfiguration(command),
    "```",
    "",
    "请按这个顺序做：",
    "1. 找到你自己的 MCP 配置位置，把上面的 aplo 服务加进去。不要改动、删除我已有的其他服务。",
    "2. 告诉我配置写在了哪个文件，以及是否需要重启你、或者新开一个对话才能生效，并告诉我具体怎么做。",
    "3. 生效之后，调用 list_meetings 列出我最近的 3 场会议，让我确认配置成功。",
    "",
    "说明：这是我自己电脑上的本地服务，只读取我自己的会议。会议内容属于隐私，没有我明确同意，不要发给其他服务或其他人。",
  ].join("\n");
}

export function getCliInstallNotification(status: EmbeddedCliStatus) {
  if (status.state === "installed") {
    return {
      type: "success" as const,
      message: t`${status.commandName} is ready to use`,
    };
  }

  return {
    type: "error" as const,
    message: status.details ?? t`${status.commandName} could not be installed`,
  };
}

export function CliSettingsSections() {
  const queryClient = useQueryClient();
  const statusQuery = useQuery({
    queryKey: CLI_STATUS_QUERY_KEY,
    queryFn: loadStatus,
  });
  const installMutation = useMutation({
    mutationFn: async () => {
      const result = await commands.installEmbeddedCli();
      if (result.status === "error") {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (status) => {
      queryClient.setQueryData(CLI_STATUS_QUERY_KEY, status);
      const notification = getCliInstallNotification(status);
      if (notification.type === "success") {
        toast.success(notification.message);
      } else {
        toast.error(notification.message);
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const status = statusQuery.data;

  return (
    <CliSection
      status={status}
      isLoading={statusQuery.isPending}
      error={statusQuery.error}
      isInstalling={installMutation.isPending}
      onInstall={() => installMutation.mutate()}
    />
  );
}

function CliSection({
  status,
  isLoading,
  error,
  isInstalling,
  onInstall,
}: {
  status: EmbeddedCliStatus | undefined;
  isLoading: boolean;
  error: Error | null;
  isInstalling: boolean;
  onInstall: () => void;
}) {
  const canInstall =
    status?.supported === true &&
    status.state !== "resource_missing" &&
    status.state !== "conflict";
  const isInstalled = status?.state === "installed";

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-sans text-lg font-semibold">
          {t`Let AI agents read your meetings`}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t`Claude, Cursor and other AI agents can look up your meeting notes and transcripts themselves, so you don't have to copy and paste them. Everything stays on this Mac.`}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-muted-foreground mb-0.5 text-xs">
              {isInstalled ? (
                <Trans>Step 1 · Done automatically</Trans>
              ) : (
                <Trans>Step 1 · Install the connector first</Trans>
              )}
            </p>
            <h3 className="flex items-center gap-1.5 text-sm font-medium">
              <Trans>Connector</Trans>
              {isInstalled && (
                <CheckCircle
                  aria-label={t`Installed`}
                  className="size-3.5 text-emerald-600"
                />
              )}
            </h3>
            <CliStatus status={status} isLoading={isLoading} error={error} />
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!canInstall || isInstalling}
              onClick={onInstall}
            >
              {isInstalling ? (
                <CircleNotch className="size-3.5 animate-spin" />
              ) : isInstalled ? (
                t`Reinstall`
              ) : (
                t`Install`
              )}
            </Button>
          </div>
        </div>
        <McpRow status={status} />
        <SkillsRow />
      </div>
    </section>
  );
}

function CliStatus({
  status,
  isLoading,
  error,
}: {
  status: EmbeddedCliStatus | undefined;
  isLoading: boolean;
  error: Error | null;
}) {
  if (isLoading) {
    return (
      <span className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
        <CircleNotch className="size-3 animate-spin" />
        {t`Checking…`}
      </span>
    );
  }

  if (error) {
    return (
      <p className="text-destructive mt-1 text-xs">
        {t`Could not check the CLI: ${error.message}`}
      </p>
    );
  }

  if (!status) {
    return null;
  }

  if (status.state === "installed") {
    return (
      <span className="text-muted-foreground mt-1 block text-xs">
        {t`Ready. AI agents on this Mac can use it.`}
      </span>
    );
  }

  const showDetails = ["conflict", "unsupported", "resource_missing"].includes(
    status.state,
  );

  return (
    <div className="mt-1 flex items-start gap-1.5 text-xs">
      <span
        className={cn([
          "mt-1 size-2 shrink-0 rounded-full",
          status.state === "conflict"
            ? "bg-amber-500"
            : "bg-muted-foreground/50",
        ])}
      />
      <span className="text-muted-foreground break-all">
        {showDetails ? (status.details ?? t`Unavailable`) : t`Not installed`}
      </span>
    </div>
  );
}

function McpRow({ status }: { status: EmbeddedCliStatus | undefined }) {
  const isInstalled = status?.state === "installed";
  const commandName = status?.commandName ?? "aplo";
  const message = buildMcpSetupMessage(
    isInstalled ? status.installPath : commandName,
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-muted-foreground mb-0.5 text-xs">
          {t`Step 2 · Required`}
        </p>
        <h3 className="text-sm font-medium">{t`Connect your AI agent`}</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          {t`Copy this and send it to your AI agent (Claude Code, Codex and so on). It sets everything up for you.`}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!isInstalled}
          onClick={() =>
            void copyText(
              message,
              t`Copied. Paste it to your AI agent.`,
              t`Could not copy the setup message`,
            )
          }
        >
          <Copy className="size-3.5" />
          {t`Copy setup message`}
        </Button>
      </div>
    </div>
  );
}
