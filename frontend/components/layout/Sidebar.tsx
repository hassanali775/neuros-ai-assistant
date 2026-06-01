"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConversations } from "@/hooks/useConversations";

export const Sidebar: React.FC = () => {
  const { conversations = [], currentId, selectConversation, createConversation, deleteConversation } = useConversations();

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-64 h-full bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/40 flex flex-col justify-between select-none"
    >
      {/* Top Section */}
      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 scrollbar-thin">
        {/* New Chat Button with Scale Interaction */}
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "rgba(37, 99, 235, 0.2)" }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.preventDefault();
            createConversation();
          }}
          className="w-full py-2.5 px-4 rounded-xl border border-blue-500/30 bg-blue-600/10 text-blue-400 text-sm font-medium transition-colors duration-200"
        >
          + New Intelligence Session
        </motion.button>

        {/* Conversation List Container */}
        <div className="flex flex-col gap-1 mt-2">
          <AnimatePresence initial={false}>
            {(conversations || []).map((chat) => {
              const isActive = chat.id === currentId;
              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    e.preventDefault();
                    selectConversation(chat.id);
                  }}
                  className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer pointer-events-auto transition-all duration-200 ${
                    isActive 
                      ? "bg-zinc-800/60 border border-zinc-700/50 text-zinc-100 font-semibold" 
                      : "hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-xs truncate max-w-[80%] pointer-events-none">
                    {chat.title || "Untitled Operation"}
                  </span>

                  {/* Contextual Delete Button */}
                  <motion.button
                    whileHover={{ scale: 1.1, color: "#ef4444" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      deleteConversation(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 text-xs transition-opacity duration-200 px-1 pointer-events-auto"
                  >
                    ✕
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Branding Layer */}
      <div className="p-4 border-t border-zinc-900/60 text-[10px] text-zinc-500 tracking-wider font-mono select-none">
        SYSTEM LAYER // LOCAL_OS
      </div>
    </motion.div>
  );
};