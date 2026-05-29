"use client";

import { useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { conversationsApi } from "@/lib/api";
import type { ConversationWithMessages } from "@/types";

export function useConversations() {
  const store = useChatStore();

  const loadConversations = useCallback(async () => {
    try {
      const conversations = await conversationsApi.list();
      store.setConversations(conversations);
    } catch {
      // Silent fail — handled by status indicator
    }
  }, [store]);

  const selectConversation = useCallback(
    async (id: string) => {
      if (store.activeConversationId === id) return;
      store.setActiveConversation(id);

      try {
        const data: ConversationWithMessages = await conversationsApi.get(id);
        store.setMessages(data.messages);
      } catch {
        store.setMessages([]);
      }
    },
    [store],
  );

  const createConversation = useCallback(async () => {
    try {
      const conv = await conversationsApi.create(store.selectedModel);
      store.addConversation(conv);
      store.setActiveConversation(conv.id);
      store.setMessages([]);
      return conv;
    } catch {
      return null;
    }
  }, [store]);

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await conversationsApi.delete(id);
        store.removeConversation(id);
        if (store.activeConversationId === id) {
          store.setMessages([]);
        }
      } catch {
        // Handle silently
      }
    },
    [store],
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      try {
        await conversationsApi.rename(id, title);
        store.updateConversation(id, { title });
      } catch {
        // Handle silently
      }
    },
    [store],
  );

  return {
    loadConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    renameConversation,
  };
}
