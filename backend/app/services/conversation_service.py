from sqlalchemy.orm import Session
from app.models.conversation import Conversation

def create_conversation(db: Session, user_id: int, title: str) -> Conversation:
    new_conversation = Conversation(title=title, user_id=user_id)
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    return new_conversation

def get_user_conversations(db: Session, user_id: int):
    return db.query(Conversation).filter(Conversation.user_id == user_id).all()

def get_conversation_by_id(db: Session, conversation_id: int):
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()