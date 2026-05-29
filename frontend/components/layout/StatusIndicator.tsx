"use client";

import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/types";

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  connected: {
    label: "ONLINE",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]",
    textClass: "text-emerald-400",
  },
  disconnected: {
    label: "OFFLINE",
    dotClass: "bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.4)]",
    textClass: "text-red-400",
  },
  checking: {
    label: "SYNCING",
    dotClass: "bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.4)]",
    textClass: "text-amber-400",
  },
};

export function StatusIndicator() {
  const status = useChatStore((s) => s.status);
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "relative flex h-2 w-2 shrink-0",
        )}
      >
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75",
            status === "connected" && "animate-ping bg-emerald-400",
            status === "checking" && "animate-ping bg-amber-400",
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            config.dotClass,
          )}
        />
      </span>
      <span
        className={cn(
          "font-mono text-[10px] font-semibold tracking-widest",
          config.textClass,
        )}
      >
        {config.label}
      </span>
    </div>
  );
}
