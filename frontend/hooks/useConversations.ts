"use client";

import { useChatStore } from "@/store/chatStore";

export const useConversations = () => {
  const store = useChatStore();

  const selectConversation = async (id: string | null) => {
    if (!id) {
      store.setActiveConversation(null);
      store.setMessages([]);
      return;
    }

    // 1. Highlight the row in the sidebar instantly
    store.setActiveConversation(id);

    try {
      // 2. Pull message history from your FastAPI backend
      const response = await fetch(`http://127.0.0.1:8000/api/conversations/${id}`);
      if (!response.ok) throw new Error("Failed to pull conversation context");
      
      const data = await response.json();
      
      // 3. Map backend response to the message display array
      // NOTE: If your API returns the conversation object containing messages, 
      // use data.messages. If it returns a raw array of messages, use data.
      store.setMessages(data.messages || data || []);
    } catch (error) {
      console.error("❌ Error syncing state from database:", error);
    }
  };

  const createConversation = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
      });
      if (!response.ok) throw new Error("Failed to create session");
      
      const newChat = await response.json();
      store.addConversation(newChat);
      store.setActiveConversation(newChat.id);
      store.setMessages([]); // Fresh slate for a new session
    } catch (error) {
      console.error("❌ Failed to initialize conversation layer:", error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete session");
      
      store.removeConversation(id);
      if (store.activeConversationId === id) {
        selectConversation(null);
      }
    } catch (error) {
      console.error("❌ Error purging conversation row:", error);
    }
  };

  return {
    conversations: store.conversations,
    currentId: store.activeConversationId,
    selectConversation,
    createConversation,
    deleteConversation,
  };
};