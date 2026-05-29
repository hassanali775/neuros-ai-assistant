"use client";

import {
  useState,
  useRef,
  useCallback,
  type KeyboardEvent,
  type DragEvent,
} from "react";
import { useChatStore } from "@/store/chatStore";
import { useChat } from "@/hooks/useChat";
import { filesApi } from "@/lib/api";
import { ModelSelector } from "./ModelSelector";
import { cn, formatBytes, getMimeIcon } from "@/lib/utils";
import { Send, Square, Paperclip, X } from "lucide-react";

export function ChatInput() {
  const [input, setInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isStreaming, pendingFiles, addPendingFile, removePendingFile } =
    useChatStore();
  const { sendMessage, stopStreaming } = useChat();

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendMessage(trimmed);
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      setIsUploading(true);
      try {
        for (const file of fileArray) {
          const uploaded = await filesApi.upload(file);
          addPendingFile(uploaded);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setIsUploading(false);
      }
    },
    [addPendingFile],
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const canSend = input.trim().length > 0 && !isStreaming;

  return (
    <div className="shrink-0 border-t border-white/[0.04] bg-[#0a0a0f] px-4 py-4">
      {/* Pending file attachments */}
      {pendingFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {pendingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2"
            >
              <span className="text-sm">{getMimeIcon(file.mime_type)}</span>
              <div className="flex flex-col leading-none">
                <span className="text-[11px] text-neutral-300">
                  {file.original_name.length > 24
                    ? file.original_name.slice(0, 22) + "…"
                    : file.original_name}
                </span>
                <span className="mt-0.5 font-mono text-[9px] text-neutral-700">
                  {formatBytes(file.size_bytes)}
                </span>
              </div>
              <button
                onClick={() => removePendingFile(file.id)}
                className="ml-1 rounded-full p-0.5 text-neutral-600 hover:bg-white/[0.06] hover:text-neutral-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-all",
          isDragging
            ? "border-violet-500/60 bg-violet-500/10"
            : "border-white/[0.08] bg-[#0f0f18] focus-within:border-white/[0.14]",
        )}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-violet-500/10 backdrop-blur-sm">
            <p className="font-mono text-sm tracking-wider text-violet-400">
              DROP FILE TO ATTACH
            </p>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isStreaming
              ? "NEUROS is thinking…"
              : "Message NEUROS  (Shift+Enter for newline)"
          }
          disabled={isStreaming && input === ""}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent px-4 py-3.5 text-sm text-neutral-200 placeholder:text-neutral-700 outline-none",
            "leading-relaxed",
          )}
          style={{ minHeight: "52px", maxHeight: "200px" }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-3 py-2">
          <div className="flex items-center gap-2">
            {/* File attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                isUploading
                  ? "text-violet-400"
                  : "text-neutral-600 hover:bg-white/[0.06] hover:text-neutral-400",
              )}
              title="Attach file"
            >
              {isUploading ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border border-violet-400 border-t-transparent" />
              ) : (
                <Paperclip className="h-3.5 w-3.5" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) =>
                e.target.files && handleFileSelect(e.target.files)
              }
            />

            {/* Model selector */}
            <ModelSelector />
          </div>

          {/* Send / Stop */}
          <div className="flex items-center gap-2">
            {input.trim() && (
              <span className="font-mono text-[9px] text-neutral-700">
                ENTER ↵
              </span>
            )}
            <button
              onClick={isStreaming ? stopStreaming : handleSend}
              disabled={!isStreaming && !canSend}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                isStreaming
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : canSend
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500"
                    : "bg-white/[0.04] text-neutral-700 cursor-not-allowed",
              )}
              title={isStreaming ? "Stop generation" : "Send message"}
            >
              {isStreaming ? (
                <Square className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="mt-2 text-center font-mono text-[9px] text-neutral-800">
        NEUROS can make mistakes · Verify important information
      </p>
    </div>
  );
}
