"use client";

import { useChatStore } from "@/store/chatStore";
import { StatusIndicator } from "./StatusIndicator";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { toggleSidebar, sidebarOpen } = useChatStore();

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0f]/80 px-4 backdrop-blur-xl">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            "text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300",
          )}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5">
          {/* Logomark */}
          <div className="relative flex h-7 w-7 items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-500/20 blur-sm" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-violet-600/40 to-cyan-600/30">
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z"
                  stroke="url(#ng)"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="8" r="2" fill="url(#ng)" />
                <defs>
                  <linearGradient
                    id="ng"
                    x1="2"
                    y1="2"
                    x2="14"
                    y2="14"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#a78bfa" />
                    <stop offset="1" stopColor="#67e8f9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="flex flex-col leading-none">
            <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text font-mono text-sm font-bold tracking-widest text-transparent">
              NEUROS
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em] text-neutral-600">
              AI OS v1.0
            </span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <StatusIndicator />
        <div className="h-4 w-px bg-white/[0.06]" />
        <div className="font-mono text-[10px] tracking-widest text-neutral-600">
          PHASE 1
        </div>
      </div>
    </header>
  );
}
