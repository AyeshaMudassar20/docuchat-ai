from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    content: str
    role: str = "user"

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True