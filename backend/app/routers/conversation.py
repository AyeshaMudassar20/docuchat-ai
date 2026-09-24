from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.conversation import ConversationCreate, ConversationResponse
from app.services import conversation_service
from app.services.auth_service import get_current_user
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse
from app.services import message_service
from app.services import llm_service
from app.schemas.document import DocumentResponse
from app.services import document_service

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

@router.post("/{conversation_id}/messages", response_model=list[MessageResponse])
def add_message(
    conversation_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = conversation_service.get_conversation_by_id(db, conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    existing_messages = message_service.get_conversation_messages(db, conversation_id)
    if len(existing_messages) == 0 and conversation.title == "New Chat":
        new_title = data.content[:30] + ("..." if len(data.content) > 30 else "")
        conversation_service.update_conversation_title(db, conversation_id, new_title)

    user_message = message_service.create_message(db, conversation_id, data.role, data.content)

    retrieved = document_service.retrieve_relevant_chunks(conversation_id, data.content)
    context = None
    if retrieved:
        context_parts = [f"(from {meta.get('filename', 'uploaded document')}): {chunk}" for chunk, meta in retrieved]
        context = "\n\n".join(context_parts)

    ai_reply = llm_service.get_ai_response(data.content, context=context)
    assistant_message = message_service.create_message(db, conversation_id, "assistant", ai_reply)

    return [user_message, assistant_message]

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

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = conversation_service.get_conversation_by_id(db, conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conversation_service.delete_conversation(db, conversation_id)
    return {"message": "Conversation deleted"}

@router.post("/{conversation_id}/documents/upload", response_model=DocumentResponse)
async def upload_document(
    conversation_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = conversation_service.get_conversation_by_id(db, conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    file_bytes = await file.read()
    extracted_text = document_service.extract_text_from_pdf(file_bytes)

    document = document_service.create_document(db, conversation_id, file.filename)

    chunks = document_service.chunk_text(extracted_text)
    document_service.store_chunks_in_chromadb(document.id, conversation_id, document.filename, chunks)
    print(f"Stored {len(chunks)} chunks in ChromaDB for document {document.id}")

    return document