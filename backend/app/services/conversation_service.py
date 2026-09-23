from sqlalchemy.orm import Session
from app.models.conversation import Conversation
from app.models.message import Message

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

def delete_conversation(db: Session, conversation_id: int):
    db.query(Message).filter(Message.conversation_id == conversation_id).delete()
    db.query(Conversation).filter(Conversation.id == conversation_id).delete()
    db.commit()

def update_conversation_title(db: Session, conversation_id: int, title: str):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    conversation.title = title
    db.commit()
    db.refresh(conversation)
    return conversation