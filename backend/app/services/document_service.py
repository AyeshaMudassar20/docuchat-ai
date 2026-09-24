from pypdf import PdfReader
from sqlalchemy.orm import Session
from app.models.document import Document
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def create_document(db: Session, conversation_id: int, filename: str) -> Document:
    new_document = Document(filename=filename, conversation_id=conversation_id)
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    return new_document