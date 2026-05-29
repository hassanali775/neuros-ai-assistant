"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { conversationsApi, streamChat } from "@/lib/api";
import type { Message } from "@/types";
import { generateId } from "@/lib/utils";

export function useChat() {
  const store = useChatStore();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || store.isStreaming) return;

      let conversationId = store.activeConversationId;

      // Auto-create conversation if none is active
      if (!conversationId) {
        try {
          const conv = await conversationsApi.create(store.selectedModel);
          store.addConversation(conv);
          store.setActiveConversation(conv.id);
          conversationId = conv.id;
        } catch {
          return;
        }
      }

      const fileIds = store.pendingFiles.map((f) => f.id);
      const pendingFiles = [...store.pendingFiles];
      store.clearPendingFiles();

      // Optimistic user message
      const userMsg: Message = {
        id: generateId(),
        conversation_id: conversationId,
        role: "user",
        content,
        attachments: pendingFiles.map((f) => ({
          id: f.id,
          filename: f.filename,
          original_name: f.original_name,
          mime_type: f.mime_type,
          size_bytes: f.size_bytes,
          created_at: new Date().toISOString(),
        })),
        created_at: new Date().toISOString(),
      };
      store.addMessage(userMsg);

      // Placeholder streaming assistant message
      const placeholderId = generateId();
      const assistantPlaceholder: Message = {
        id: placeholderId,
        conversation_id: conversationId,
        role: "assistant",
        content: "",
        attachments: [],
        created_at: new Date().toISOString(),
        isStreaming: true,
        streamContent: "",
      };
      store.addMessage(assistantPlaceholder);
      store.setStreaming(true, placeholderId);

      abortRef.current = new AbortController();

      try {
        await streamChat({
          conversationId,
          message: content,
          model: store.selectedModel,
          fileIds,
          signal: abortRef.current.signal,

          onStart: (_msgId) => {
            // streaming started — placeholder already added
          },

          onToken: (token) => {
            store.appendStreamToken(placeholderId, token);
          },

          onDone: (finalMsgId) => {
            const finalMsg = useChatStore
              .getState()
              .messages.find((m) => m.id === placeholderId);
            const finalContent = finalMsg?.streamContent ?? "";
            store.finalizeStreamMessage(placeholderId, finalMsgId, finalContent);
            store.setStreaming(false, null);
            store.updateConversation(conversationId!, {
              message_count:
                (store.conversations.find((c) => c.id === conversationId)?.message_count ?? 0) + 2,
              updated_at: new Date().toISOString(),
            });
          },

          onError: (error) => {
            store.updateMessage(placeholderId, {
              content: `⚠️ Error: ${error}`,
              isStreaming: false,
              streamContent: undefined,
            });
            store.setStreaming(false, null);
          },
        });
      } catch (err: unknown) {
        const isAbort =
          err instanceof Error && err.name === "AbortError";
        if (!isAbort) {
          store.updateMessage(placeholderId, {
            content: "⚠️ Connection interrupted.",
            isStreaming: false,
            streamContent: undefined,
          });
        } else {
          store.updateMessage(placeholderId, {
            isStreaming: false,
            streamContent: undefined,
          });
        }
        store.setStreaming(false, null);
      }
    },
    [store],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    store.setStreaming(false, null);
  }, [store]);

  return { sendMessage, stopStreaming };
}
