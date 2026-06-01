"use client";

import React from "react";
import { Message } from "@/types";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[75%] rounded-xl px-4 py-3 shadow-lg transition-all duration-200 ${
          isUser
            ? "bg-blue-600/80 backdrop-blur-md text-white rounded-br-none border border-blue-500/30"
            : "bg-zinc-900/60 backdrop-blur-md text-zinc-100 rounded-bl-none border border-zinc-800/50"
        }`}
      >
        {/* Message Content */}
        <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap select-text">
          {message.content}
        </div>

        {/* Timestamp / Context Indicator */}
        <div
          className={`text-[10px] mt-1.5 opacity-40 select-none ${
            isUser ? "text-right text-blue-200" : "text-left text-zinc-400"
          }`}
        >
          {new Date(message.created_at || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  );
};