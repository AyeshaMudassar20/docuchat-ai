from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.conversation import ConversationCreate, ConversationResponse
from app.services import conversation_service
from app.services.auth_service import get_current_user
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse
from app.services import message_service

router = APIRouter(prefix="/conversations", tags=["conversations"])

@router.post("/", response_model=ConversationResponse)
def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return conversation_service.create_conversation(db, current_user.id, data.title)

@router.get("/", response_model=list[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return conversation_service.get_user_conversations(db, current_user.id)
@router.post("/{conversation_id}/messages", response_model=MessageResponse)
def add_message(
    conversation_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = conversation_service.get_conversation_by_id(db, conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return message_service.create_message(db, conversation_id, data.role, data.content)

@router.get("/{conversation_id}/messages", response_model=list[MessageResponse])
def list_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = conversation_service.get_conversation_by_id(db, conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return message_service.get_conversation_messages(db, conversation_id)