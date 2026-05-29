import type {
  Conversation,
  ConversationWithMessages,
  HealthResponse,
  ModelsResponse,
  UploadedFile,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.detail ?? body?.message ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => request<HealthResponse>("/health"),
};

// ─── Models ───────────────────────────────────────────────────────────────────

export const modelsApi = {
  list: () => request<ModelsResponse>("/models"),
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversationsApi = {
  list: (limit = 50, offset = 0) =>
    request<Conversation[]>(`/conversations?limit=${limit}&offset=${offset}`),

  create: (model: string, title = "New Conversation") =>
    request<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify({ title, model }),
    }),

  get: (id: string) =>
    request<ConversationWithMessages>(`/conversations/${id}`),

  rename: (id: string, title: string) =>
    request<Conversation>(`/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),

  delete: (id: string) =>
    request<void>(`/conversations/${id}`, { method: "DELETE" }),
};

// ─── Files ────────────────────────────────────────────────────────────────────

export const filesApi = {
  upload: async (file: File): Promise<UploadedFile> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/files/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      let message = `Upload failed: HTTP ${res.status}`;
      try {
        const body = await res.json();
        message = body?.detail ?? message;
      } catch {
        // ignore
      }
      throw new ApiError(res.status, message);
    }
    return res.json();
  },
};

// ─── Streaming Chat ───────────────────────────────────────────────────────────

export interface StreamChatOptions {
  conversationId: string;
  message: string;
  model: string;
  fileIds?: string[];
  onToken: (token: string) => void;
  onStart: (messageId: string) => void;
  onDone: (messageId: string) => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

export async function streamChat(opts: StreamChatOptions): Promise<void> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: opts.conversationId,
      message: opts.message,
      model: opts.model,
      file_ids: opts.fileIds ?? [],
      stream: true,
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    let message = `Chat failed: HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.detail ?? message;
    } catch {
      // ignore
    }
    opts.onError(message);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    opts.onError("No response stream available");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr) continue;

        try {
          const chunk = JSON.parse(jsonStr);
          switch (chunk.type) {
            case "start":
              opts.onStart(chunk.message_id);
              break;
            case "token":
              opts.onToken(chunk.content ?? "");
              break;
            case "done":
              opts.onDone(chunk.message_id);
              break;
            case "error":
              opts.onError(chunk.error ?? "Unknown stream error");
              break;
          }
        } catch {
          // malformed JSON chunk — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export { ApiError };
