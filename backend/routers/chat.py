import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import get_db
from models.schemas import ChatRequest, ChatMessage, MessageRole, StreamChunk
from services.ollama_service import get_ollama_service, OllamaService
from services.conversation_service import get_conversation_service, ConversationService
from services.file_service import get_file_service, FileService

router = APIRouter(prefix="/chat", tags=["chat"])

NEUROS_SYSTEM_PROMPT = """You are NEUROS, an advanced AI operating system assistant. 
You are precise, intelligent, and efficient. You help users with complex tasks, 
coding, analysis, research, and creative work. You are direct and insightful.
Current capabilities: AI chat, file analysis, conversation memory.
Respond with clarity and depth. Format code properly using markdown."""


@router.post("")
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    ollama: OllamaService = Depends(get_ollama_service),
    conv_service: ConversationService = Depends(get_conversation_service),
    file_service: FileService = Depends(get_file_service),
):
    # Verify conversation exists
    conversation = await conv_service.get_by_id(db, request.conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Build message content (include file context if any)
    user_content = request.message
    if request.file_ids:
        file_contexts = []
        for fid in request.file_ids:
            text = await file_service.read_text(fid)
            attachment = await file_service.get_by_id(db, fid)
            if text and attachment:
                file_contexts.append(
                    f"\n[Attached file: {attachment.original_name}]\n```\n{text[:8000]}\n```"
                )
        if file_contexts:
            user_content += "\n" + "\n".join(file_contexts)

    # Persist user message
    user_msg = await conv_service.add_message(
        db=db,
        conversation_id=request.conversation_id,
        role=MessageRole.user,
        content=user_content,
    )

    # Link uploaded files to user message
    if request.file_ids:
        await file_service.link_to_message(db, request.file_ids, user_msg.id)

    # Auto-title on first message
    messages = await conv_service.get_messages(db, request.conversation_id)
    if len(messages) == 1:
        await conv_service.auto_title(db, request.conversation_id, request.message)

    # Build message history for Ollama
    chat_messages = [
        ChatMessage(role=MessageRole(m.role), content=m.content)
        for m in messages
    ]

    async def stream_generator():
        full_response = ""
        assistant_msg_id = str(uuid.uuid4())

        try:
            # Signal start
            start_chunk = StreamChunk(
                type="start",
                message_id=assistant_msg_id,
                conversation_id=request.conversation_id,
            )
            yield f"data: {start_chunk.model_dump_json()}\n\n"

            # Stream tokens
            async for token in ollama.stream_chat(
                model=request.model,
                messages=chat_messages,
                system_prompt=NEUROS_SYSTEM_PROMPT,
            ):
                full_response += token
                chunk = StreamChunk(type="token", content=token)
                yield f"data: {chunk.model_dump_json()}\n\n"

            # Persist assistant response
            assistant_msg = await conv_service.add_message(
                db=db,
                conversation_id=request.conversation_id,
                role=MessageRole.assistant,
                content=full_response,
                model=request.model,
            )

            # Signal done
            done_chunk = StreamChunk(
                type="done",
                message_id=assistant_msg.id,
                conversation_id=request.conversation_id,
            )
            yield f"data: {done_chunk.model_dump_json()}\n\n"

        except Exception as e:
            error_chunk = StreamChunk(type="error", error=str(e))
            yield f"data: {error_chunk.model_dump_json()}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
