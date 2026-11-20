import { Trans, useLingui } from "@lingui/react/macro";

import { commands as openerCommands } from "@anlg/plugin-opener2";
import {
  ArrowCounterClockwise,
  ArrowSquareOut,
} from "@anlg/ui/components/icons";

import { ActionButton, MessageBubble, MessageContainer } from "./shared";

import { env } from "~/env";
import { UPSTREAM_COMMUNITY_ENABLED } from "~/shared/features";

const WEB_APP_BASE_URL = env.VITE_APP_URL ?? "http://localhost:3000";

// `useChat().error` is typed as Error but holds whatever the transport threw.
export function getChatErrorText(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === "string" ? error : String(error);
}

export type ChatErrorKind = "openai_api_quota" | "api_quota" | "other";

// The provider's raw error (often JSON) is unreadable for most users; the
// common billing case gets a plain explanation, with the raw text kept below.
export function classifyChatError(message: string): ChatErrorKind {
  const lower = message.toLowerCase();
  const isQuota =
    lower.includes("insufficient_quota") ||
    lower.includes("credit_balance_exhausted") ||
    lower.includes("no credits remaining") ||
    lower.includes("exceeded your current quota") ||
    lower.includes("credit balance is too low");
  if (!isQuota) {
    return "other";
  }
  return lower.includes("platform.openai.com") ? "openai_api_quota" : "api_quota";
}

function isContextLengthError(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    (lowerMessage.includes("n_keep") && lowerMessage.includes("n_ctx")) ||
    (lowerMessage.includes("context") && lowerMessage.includes("exceeds")) ||
    lowerMessage.includes("context length") ||
    lowerMessage.includes("context size")
  );
}

export function ErrorMessage({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const { t } = useLingui();
  const message = getChatErrorText(error);
  const kind = classifyChatError(message);
  // The help page lives on the upstream product's website.
  const showContextLengthHelp =
    UPSTREAM_COMMUNITY_ENABLED && isContextLengthError(message);

  const handleOpenFaq = () => {
    void openerCommands.openUrl(
      `${WEB_APP_BASE_URL}/docs/faq/local-llm-setup#context-length-error`,
      null,
    );
  };

  return (
    <MessageContainer align="start">
      <MessageBubble variant="error" withActionButton={!!onRetry}>
        {kind === "other" ? (
          <p className="text-sm">{message}</p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-sm">
              {kind === "openai_api_quota" ? (
                <Trans>
                  The OpenAI API balance has run out. To use your ChatGPT plan
                  instead, choose ChatGPT under Settings → Intelligence.
                </Trans>
              ) : (
                <Trans>
                  This AI service has no balance left. Top up with the
                  provider, or choose another service under Settings →
                  Intelligence.
                </Trans>
              )}
            </p>
            <details className="text-xs opacity-70">
              <summary className="cursor-pointer">
                <Trans>Original error</Trans>
              </summary>
              <p className="mt-1 break-all">{message}</p>
            </details>
          </div>
        )}
        {showContextLengthHelp && (
          <button
            onClick={handleOpenFaq}
            className="mt-2 flex items-center gap-1 text-xs text-red-700 underline hover:text-red-900"
          >
            <ArrowSquareOut className="h-3 w-3" />
            <Trans>Learn how to fix this</Trans>
          </button>
        )}
        {onRetry && (
          <ActionButton
            onClick={onRetry}
            variant="error"
            icon={ArrowCounterClockwise}
            label={t`Retry`}
          />
        )}
      </MessageBubble>
    </MessageContainer>
  );
}
