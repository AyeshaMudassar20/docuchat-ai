from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)