import { useLingui } from "@lingui/react/macro";
import { useCallback, useState } from "react";

import { cn } from "@anlg/utils";

import { useListener } from "~/stt/contexts";
import { useStartListening } from "~/stt/useStartListening";
import {
  isMainWebviewWindow,
  requestMainListenerControl,
} from "~/stt/window-control";

// A large start button on a blank note. Users missed the small "Record"
// button in the header. It starts the same listener as the header, so every
// other recording indicator (header, transcript tab, sidebar, floating bar,
// tray) updates as usual. It disappears once recording starts.
export function StartRecordingPrompt({ sessionId }: { sessionId: string }) {
  const { t } = useLingui();
  const sessionMode = useListener((state) => state.getSessionMode(sessionId));
  const startListening = useStartListening(sessionId);
  const [starting, setStarting] = useState(false);

  const handleStart = useCallback(async () => {
    setStarting(true);
    try {
      if (!isMainWebviewWindow()) {
        await requestMainListenerControl("start", sessionId);
        return;
      }

      await startListening();
    } finally {
      setStarting(false);
    }
  }, [sessionId, startListening]);

  if (sessionMode !== "inactive") {
    return null;
  }

  return (
    <div className="mb-8 flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => {
          void handleStart();
        }}
        disabled={starting}
        className={cn([
          "pointer-events-auto flex h-10 items-center gap-2.5 rounded-full px-5",
          "bg-red-500 text-sm font-medium text-white transition-colors",
          "hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-hidden",
          "disabled:opacity-60",
        ])}
      >
        <span aria-hidden className="size-2.5 rounded-full bg-white" />
        {t`Start recording`}
      </button>
      <p className="text-muted-foreground text-xs">
        {t`Recording starts right away. Press ⌘⇧N anytime to start a new meeting.`}
      </p>
    </div>
  );
}
