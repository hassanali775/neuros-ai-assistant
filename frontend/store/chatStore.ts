import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  ChatState,
  Conversation,
  Message,
  OllamaModel,
  UploadedFile,
  ConnectionStatus,
} from "@/types";

interface ChatActions {
  // Connection
  setStatus: (status: ConnectionStatus) => void;
  setOllamaModels: (models: OllamaModel[]) => void;
  setSelectedModel: (model: string) => void;

  // Sidebar
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Conversations
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;

  // Messages
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  appendStreamToken: (messageId: string, token: string) => void;
  finalizeStreamMessage: (messageId: string, finalId: string, content: string) => void;

  // Streaming
  setStreaming: (isStreaming: boolean, messageId?: string | null) => void;

  // Files
  addPendingFile: (file: UploadedFile) => void;
  removePendingFile: (id: string) => void;
  clearPendingFiles: () => void;

  // Reset
  resetChat: () => void;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  selectedModel: "llama3",
  pendingFiles: [],
  status: "checking",
  ollamaModels: [],
  sidebarOpen: true,
};

export const useChatStore = create<ChatState & ChatActions>()(
  devtools(
    (set) => ({
      ...initialState,

      // ─── Connection ─────────────────────────────────────────────────────────
      setStatus: (status) => set({ status }),
      setOllamaModels: (models) => set({ ollamaModels: models }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),

      // ─── Sidebar ────────────────────────────────────────────────────────────
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // ─── Conversations ──────────────────────────────────────────────────────
      setConversations: (conversations) => set({ conversations }),

      addConversation: (conversation) =>
        set((s) => ({ conversations: [conversation, ...s.conversations] })),

      updateConversation: (id, updates) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      removeConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId:
            s.activeConversationId === id ? null : s.activeConversationId,
          messages: s.activeConversationId === id ? [] : s.messages,
        })),

      setActiveConversation: (id) =>
        set({ activeConversationId: id, messages: [] }),

      // ─── Messages ───────────────────────────────────────────────────────────
      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((s) => ({ messages: [...s.messages, message] })),

      updateMessage: (id, updates) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m,
          ),
        })),

      appendStreamToken: (messageId, token) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === messageId
              ? { ...m, streamContent: (m.streamContent ?? "") + token }
              : m,
          ),
        })),

      finalizeStreamMessage: (messageId, finalId, content) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  id: finalId,
                  content,
                  isStreaming: false,
                  streamContent: undefined,
                }
              : m,
          ),
        })),

      // ─── Streaming ──────────────────────────────────────────────────────────
      setStreaming: (isStreaming, messageId = null) =>
        set({ isStreaming, streamingMessageId: messageId }),

      // ─── Files ──────────────────────────────────────────────────────────────
      addPendingFile: (file) =>
        set((s) => ({ pendingFiles: [...s.pendingFiles, file] })),

      removePendingFile: (id) =>
        set((s) => ({
          pendingFiles: s.pendingFiles.filter((f) => f.id !== id),
        })),

      clearPendingFiles: () => set({ pendingFiles: [] }),

      // ─── Reset ──────────────────────────────────────────────────────────────
      resetChat: () => set(initialState),
    }),
    { name: "neuros-chat-store" },
  ),
);
