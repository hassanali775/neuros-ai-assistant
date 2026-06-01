"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { MessageBubble } from "./MessageBubble";
import { Bot, Zap, FileText, Cpu } from "lucide-react";

const EMPTY_STATE_FEATURES = [
  {
    icon: Zap,
    title: "AI Reasoning",
    desc: "Powered by local Ollama LLMs",
  },
  {
    icon: FileText,
    title: "File Analysis",
    desc: "Upload code, PDFs, text files",
  },
  {
    icon: Cpu,
    title: "Local & Private",
    desc: "Runs entirely on your machine",
  },
];

export function ChatWindow() {
  const { messages, activeConversationId } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
    >
      {isEmpty ? (
        /* Empty state */
        <div className="flex h-full flex-col items-center justify-center px-8 py-16">
          {/* Central logo glow */}
          <div className="relative mb-8">
            <div className="absolute inset-0 h-24 w-24 rounded-full bg-violet-500/20 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-900/40 to-cyan-900/20">
              <Bot className="h-10 w-10 text-violet-400" />
            </div>
          </div>

          <h2 className="mb-2 font-mono text-xl font-bold tracking-widest text-neutral-300">
            NEUROS
          </h2>
          <p className="mb-10 max-w-xs text-center text-sm text-neutral-600">
            {activeConversationId
              ? "This conversation is empty. Send a message to begin."
              : "Start a new conversation or select one from the sidebar."}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {EMPTY_STATE_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
                  <Icon className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-300">{title}</p>
                  <p className="text-[11px] text-neutral-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Message list */
        <div className="py-4">
          {messages.map((msg, index) => (
  <MessageBubble 
    key={`${msg.id}-${msg.role}-${index}`} 
    message={msg} 
  />
))}
          <div ref={bottomRef} className="h-px" />
        </div>
      )}
    </div>
  );
}
