from pypdf import PdfReader
from sqlalchemy.orm import Session
from app.models.document import Document
import io
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import chromadb

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

chroma_client = chromadb.PersistentClient(path="./chroma_db")

embeddings_model = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-2-preview",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
)

def chunk_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    return splitter.split_text(text)

def store_chunks_in_chromadb(document_id: int, conversation_id: int, chunks: list[str]):
    collection = chroma_client.get_or_create_collection(name=f"conversation_{conversation_id}")

    for i, chunk in enumerate(chunks):
        embedding = embeddings_model.embed_query(chunk)
        collection.add(
            ids=[f"doc{document_id}_chunk{i}"],
            embeddings=[embedding],
            documents=[chunk],
            metadatas=[{"document_id": document_id, "chunk_index": i}],
        )