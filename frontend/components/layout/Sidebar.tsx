"use client";

import { useEffect, useState, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { useConversations } from "@/hooks/useConversations";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import {
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";

export function Sidebar() {
  const { conversations, activeConversationId, sidebarOpen } = useChatStore();
  const { loadConversations, selectConversation, createConversation, deleteConversation, renameConversation } =
    useConversations();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startEdit = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const commitEdit = async (id: string) => {
    if (editTitle.trim() && editTitle.trim() !== conversations.find((c) => c.id === id)?.title) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-white/[0.06] bg-[#08080d] transition-all duration-300",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden",
      )}
    >
      {/* New Chat button */}
      <div className="p-3">
        <button
          onClick={createConversation}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5",
            "border border-white/[0.06] bg-white/[0.03] transition-all",
            "hover:border-violet-500/30 hover:bg-violet-500/10",
            "font-mono text-xs font-medium tracking-wider text-neutral-400",
            "hover:text-violet-300",
          )}
        >
          <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
          NEW CONVERSATION
        </button>
      </div>

      {/* Section label */}
      <div className="px-4 pb-2 pt-1">
        <span className="font-mono text-[9px] font-semibold tracking-[0.2em] text-neutral-700">
          HISTORY
        </span>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <MessageSquare className="h-6 w-6 text-neutral-800" />
            <p className="font-mono text-[10px] text-neutral-700">
              NO CONVERSATIONS
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <li key={conv.id}>
                  <div
                    onClick={() => !isEditing && selectConversation(conv.id)}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2.5 transition-all",
                      isActive
                        ? "bg-violet-500/15 border border-violet-500/20"
                        : "border border-transparent hover:bg-white/[0.04]",
                    )}
                  >
                    {/* Active accent */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-violet-400" />
                    )}

                    <MessageSquare
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        isActive ? "text-violet-400" : "text-neutral-700",
                      )}
                    />

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(conv.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-xs text-white outline-none"
                        />
                      ) : (
                        <p
                          className={cn(
                            "text-xs leading-snug",
                            isActive ? "text-neutral-200" : "text-neutral-500",
                            "group-hover:text-neutral-300",
                          )}
                        >
                          {truncate(conv.title, 32)}
                        </p>
                      )}
                      <p className="mt-0.5 font-mono text-[9px] text-neutral-700">
                        {formatRelativeTime(conv.updated_at)} · {conv.message_count} msg
                      </p>
                    </div>

                    {/* Actions */}
                    {isEditing ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); commitEdit(conv.id); }}
                          className="rounded p-0.5 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                          className="rounded p-0.5 text-neutral-500 hover:bg-white/[0.06]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => startEdit(conv.id, conv.title, e)}
                          className="rounded p-0.5 text-neutral-600 hover:bg-white/[0.06] hover:text-neutral-400"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                          className="rounded p-0.5 text-neutral-600 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.04] px-4 py-3">
        <p className="font-mono text-[9px] text-neutral-800">
          NEUROS © 2025 · PHASE 1
        </p>
      </div>
    </aside>
  );
}
