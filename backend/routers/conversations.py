from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import get_db
from models.schemas import (
    ConversationCreate, ConversationUpdate,
    ConversationOut, ConversationWithMessages,
)
from services.conversation_service import get_conversation_service, ConversationService

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationOut, status_code=201)
async def create_conversation(
    data: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    service: ConversationService = Depends(get_conversation_service),
):
    conversation = await service.create(db, data)
    return ConversationOut(
        id=conversation.id,
        title=conversation.title,
        model=conversation.model,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=0,
    )


@router.get("", response_model=list[ConversationOut])
async def list_conversations(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    service: ConversationService = Depends(get_conversation_service),
):
    rows = await service.get_all(db, limit=limit, offset=offset)
    return [ConversationOut(**row) for row in rows]


@router.get("/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    service: ConversationService = Depends(get_conversation_service),
):
    conversation = await service.get_by_id(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = await service.get_messages(db, conversation_id)

    return ConversationWithMessages(
        id=conversation.id,
        title=conversation.title,
        model=conversation.model,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=len(messages),
        messages=[
            {
                "id": m.id,
                "conversation_id": m.conversation_id,
                "role": m.role,
                "content": m.content,
                "model": m.model,
                "tokens": m.tokens,
                "attachments": [
                    {
                        "id": a.id,
                        "filename": a.filename,
                        "original_name": a.original_name,
                        "mime_type": a.mime_type,
                        "size_bytes": a.size_bytes,
                        "created_at": a.created_at,
                    }
                    for a in m.attachments
                ],
                "created_at": m.created_at,
            }
            for m in messages
        ],
    )


@router.patch("/{conversation_id}", response_model=ConversationOut)
async def update_conversation(
    conversation_id: str,
    data: ConversationUpdate,
    db: AsyncSession = Depends(get_db),
    service: ConversationService = Depends(get_conversation_service),
):
    conversation = await service.update(db, conversation_id, data)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = await service.get_messages(db, conversation_id)
    return ConversationOut(
        id=conversation.id,
        title=conversation.title,
        model=conversation.model,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=len(messages),
    )


@router.delete("/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    service: ConversationService = Depends(get_conversation_service),
):
    deleted = await service.delete(db, conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
