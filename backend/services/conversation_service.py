import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from models.database import Conversation, Message, FileAttachment
from models.schemas import ConversationCreate, ConversationUpdate, MessageRole


class ConversationService:

    async def create(self, db: AsyncSession, data: ConversationCreate) -> Conversation:
        conversation = Conversation(
            id=str(uuid.uuid4()),
            title=data.title,
            model=data.model,
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        return conversation

    async def get_all(self, db: AsyncSession, limit: int = 50, offset: int = 0) -> list[dict]:
        # Get conversations with message count
        stmt = (
            select(
                Conversation,
                func.count(Message.id).label("message_count"),
            )
            .outerjoin(Message, Message.conversation_id == Conversation.id)
            .group_by(Conversation.id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(stmt)
        rows = result.all()

        conversations = []
        for row in rows:
            conv = row[0]
            count = row[1]
            conversations.append({
                "id": conv.id,
                "title": conv.title,
                "model": conv.model,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "message_count": count,
            })
        return conversations

    async def get_by_id(self, db: AsyncSession, conversation_id: str) -> Conversation | None:
        stmt = (
            select(Conversation)
            .options(
                selectinload(Conversation.messages).selectinload(Message.attachments)
            )
            .where(Conversation.id == conversation_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, db: AsyncSession, conversation_id: str, data: ConversationUpdate) -> Conversation | None:
        conversation = await self.get_by_id(db, conversation_id)
        if not conversation:
            return None
        if data.title is not None:
            conversation.title = data.title
        await db.commit()
        await db.refresh(conversation)
        return conversation

    async def delete(self, db: AsyncSession, conversation_id: str) -> bool:
        stmt = delete(Conversation).where(Conversation.id == conversation_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    async def add_message(
        self,
        db: AsyncSession,
        conversation_id: str,
        role: MessageRole,
        content: str,
        model: str | None = None,
        tokens: int | None = None,
    ) -> Message:
        message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role=role.value,
            content=content,
            model=model,
            tokens=tokens,
        )
        db.add(message)

        # Update conversation timestamp
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()
        if conversation:
            from sqlalchemy import text
            await db.execute(
                text("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = :id"),
                {"id": conversation_id}
            )

        await db.commit()
        await db.refresh(message)
        return message

    async def get_messages(self, db: AsyncSession, conversation_id: str) -> list[Message]:
        stmt = (
            select(Message)
            .options(selectinload(Message.attachments))
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def auto_title(self, db: AsyncSession, conversation_id: str, first_message: str) -> None:
        print("===== AUTO TITLE START =====")

        title = first_message[:60].strip()
        if len(first_message) > 60:
            title += "..."

        stmt = select(Conversation).where(Conversation.id == conversation_id)
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()

        print("Conversation ID:", conversation_id)
        print("Generated Title:", title)

        if conversation:
            print("Current DB Title:", conversation.title)
        else:
            print("Conversation NOT FOUND")

        DEFAULT_TITLES = {
            "New Conversation",
            "New Intelligence Session",
            "Untitled Operation",
        }

        if conversation and conversation.title in DEFAULT_TITLES:
            print("UPDATING TITLE...")
            conversation.title = title
            await db.commit()
            await db.refresh(conversation)
            print("NEW TITLE:", conversation.title)
        else:
            print("TITLE NOT UPDATED")

        print("===== AUTO TITLE END =====")


def get_conversation_service() -> ConversationService:
    return ConversationService()
