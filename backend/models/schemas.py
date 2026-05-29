from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


# ─── File Attachment ─────────────────────────────────────────────────────────

class FileAttachmentOut(BaseModel):
    id: str
    filename: str
    original_name: str
    mime_type: str
    size_bytes: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Message ──────────────────────────────────────────────────────────────────

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    role: MessageRole
    content: str
    model: Optional[str] = None
    tokens: Optional[int] = None
    attachments: list[FileAttachmentOut] = []
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Conversation ─────────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    title: str = Field(default="New Conversation", max_length=255)
    model: str = Field(default="llama3", max_length=100)


class ConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)


class ConversationOut(BaseModel):
    id: str
    title: str
    model: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class ConversationWithMessages(ConversationOut):
    messages: list[MessageOut] = []

    class Config:
        from_attributes = True


# ─── Chat ─────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: MessageRole
    content: str


class ChatRequest(BaseModel):
    conversation_id: str
    message: str
    model: str = "llama3"
    file_ids: list[str] = []
    stream: bool = True


# ─── Models ───────────────────────────────────────────────────────────────────

class OllamaModelDetail(BaseModel):
    name: str
    modified_at: Optional[str] = None
    size: Optional[int] = None
    digest: Optional[str] = None


class ModelsResponse(BaseModel):
    models: list[OllamaModelDetail]
    default_model: str


# ─── Health ───────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    ollama_connected: bool
    ollama_models: int


# ─── File Upload ──────────────────────────────────────────────────────────────

class FileUploadResponse(BaseModel):
    id: str
    filename: str
    original_name: str
    mime_type: str
    size_bytes: int


# ─── Stream Chunk ─────────────────────────────────────────────────────────────

class StreamChunk(BaseModel):
    type: str  # "token" | "done" | "error"
    content: Optional[str] = None
    message_id: Optional[str] = None
    conversation_id: Optional[str] = None
    error: Optional[str] = None
