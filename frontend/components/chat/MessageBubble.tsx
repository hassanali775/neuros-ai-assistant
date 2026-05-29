"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn, formatRelativeTime, getMimeIcon, formatBytes } from "@/lib/utils";
import { TypingIndicator } from "./TypingIndicator";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.04] text-neutral-500 transition-colors hover:border-white/[0.1] hover:text-neutral-300"
      title="Copy code"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

export const MessageBubble = memo(function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;
  const displayContent = isStreaming
    ? (message.streamContent ?? "")
    : message.content;

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
          isUser
            ? "border border-white/[0.08] bg-white/[0.06] text-neutral-400"
            : "border border-violet-500/20 bg-violet-500/15 text-violet-300",
        )}
      >
        {isUser ? "U" : "N"}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1.5"
              >
                <span className="text-xs">{getMimeIcon(att.mime_type)}</span>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px] text-neutral-300">
                    {att.original_name.length > 20
                      ? att.original_name.slice(0, 18) + "…"
                      : att.original_name}
                  </span>
                  <span className="mt-0.5 font-mono text-[9px] text-neutral-700">
                    {formatBytes(att.size_bytes)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-white/[0.06] text-neutral-200"
              : "rounded-tl-sm border border-white/[0.04] bg-[#0f0f1a] text-neutral-200",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{displayContent}</p>
          ) : isStreaming && displayContent === "" ? (
            <TypingIndicator />
          ) : (
            <ReactMarkdown
              className="prose-neuros"
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeStr = String(children).replace(/\n$/, "");
                  const isBlock = match || codeStr.includes("\n");

                  if (isBlock) {
                    return (
                      <div className="group/code relative my-3 overflow-hidden rounded-xl border border-white/[0.06]">
                        {/* Code header */}
                        <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.03] px-4 py-2">
                          <span className="font-mono text-[10px] tracking-widest text-neutral-600 uppercase">
                            {match?.[1] ?? "code"}
                          </span>
                          <CopyButton text={codeStr} />
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match?.[1] ?? "text"}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            background: "transparent",
                            padding: "1rem",
                            fontSize: "0.75rem",
                            lineHeight: "1.6",
                          }}
                        >
                          {codeStr}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="rounded-md border border-white/[0.06] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.8em] text-violet-300"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return (
                    <p className="mb-3 last:mb-0 leading-relaxed text-neutral-200">
                      {children}
                    </p>
                  );
                },
                ul({ children }) {
                  return (
                    <ul className="mb-3 ml-4 list-disc space-y-1 text-neutral-300">
                      {children}
                    </ul>
                  );
                },
                ol({ children }) {
                  return (
                    <ol className="mb-3 ml-4 list-decimal space-y-1 text-neutral-300">
                      {children}
                    </ol>
                  );
                },
                h1({ children }) {
                  return (
                    <h1 className="mb-3 text-lg font-semibold text-white">
                      {children}
                    </h1>
                  );
                },
                h2({ children }) {
                  return (
                    <h2 className="mb-2 text-base font-semibold text-white">
                      {children}
                    </h2>
                  );
                },
                h3({ children }) {
                  return (
                    <h3 className="mb-2 text-sm font-semibold text-neutral-200">
                      {children}
                    </h3>
                  );
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="my-3 border-l-2 border-violet-500/40 pl-4 text-neutral-400 italic">
                      {children}
                    </blockquote>
                  );
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 underline underline-offset-2 hover:text-violet-300"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {displayContent}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            "flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100",
          )}
        >
          {!isUser && message.model && (
            <span className="font-mono text-[9px] tracking-widest text-neutral-700 uppercase">
              {message.model.split(":")[0]}
            </span>
          )}
          <span className="font-mono text-[9px] text-neutral-700">
            {formatRelativeTime(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
});
