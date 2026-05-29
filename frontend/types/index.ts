// ─── Enums ────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export type StreamChunkType = "start" | "token" | "done" | "error";

// ─── Models ───────────────────────────────────────────────────────────────────

export interface OllamaModel {
  name: string;
  modified_at?: string;
  size?: number;
  digest?: string;
}

export interface ModelsResponse {
  models: OllamaModel[];
  default_model: string;
}

// ─── Files ────────────────────────────────────────────────────────────────────

export interface FileAttachment {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  model?: string;
  tokens?: number;
  attachments: FileAttachment[];
  created_at: string;
  // Client-only fields
  isStreaming?: boolean;
  streamContent?: string;
}

// ─── Conversations ────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatRequest {
  conversation_id: string;
  message: string;
  model: string;
  file_ids?: string[];
  stream?: boolean;
}

export interface StreamChunk {
  type: StreamChunkType;
  content?: string;
  message_id?: string;
  conversation_id?: string;
  error?: string;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  version: string;
  ollama_connected: boolean;
  ollama_models: number;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type ConnectionStatus = "connected" | "disconnected" | "checking";

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  selectedModel: string;
  pendingFiles: UploadedFile[];
  status: ConnectionStatus;
  ollamaModels: OllamaModel[];
  sidebarOpen: boolean;
}
