"use client";

import { useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { useModels } from "@/hooks/useModels";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  useModels(); // Initialises health polling + model fetching

  const sidebarOpen = useChatStore((s) => s.sidebarOpen);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#0a0a0f]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-violet-900/10 blur-[120px]" />
        <div className="absolute -bottom-64 -right-32 h-[400px] w-[400px] rounded-full bg-cyan-900/8 blur-[100px]" />
      </div>

      {/* Scanline overlay */}
      <div className="scanline-overlay pointer-events-none absolute inset-0 z-0" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <main
        className={cn(
          "relative z-10 flex min-w-0 flex-1 flex-col transition-all duration-300",
        )}
      >
        <TopBar />

        {/* Chat area */}
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatWindow />
          <ChatInput />
        </div>
      </main>
    </div>
  );
}
