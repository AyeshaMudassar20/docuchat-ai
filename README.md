# 📄 DocuChat AI

DocuChat AI is a full-stack AI-powered chatbot that lets users upload PDF documents and ask questions about them, powered by Retrieval-Augmented Generation (RAG). Built as a hands-on learning project covering authentication, real-time AI chat, and a complete RAG pipeline.

## ✨ Features

- 🔐 Secure user authentication (signup/login) with JWT tokens and hashed passwords
- 💬 Real-time AI chat powered by Google Gemini
- 📎 PDF upload with automatic text extraction
- 🔍 Retrieval-Augmented Generation (RAG) — ask questions about your uploaded documents and get accurate, grounded answers
- 🗂️ Multiple conversations per user, each with auto-generated titles
- 🗑️ Delete conversations
- 🔒 User-scoped data access (protected against IDOR vulnerabilities)

## 🛠️ Tech Stack

**Backend:** FastAPI · PostgreSQL · SQLAlchemy · Alembic · LangChain · Google Gemini API · ChromaDB · JWT Authentication · Bcrypt

**Frontend:** React · React Router · Vite

## 🧠 How the RAG Pipeline Works

1. User uploads a PDF document
2. Text is extracted from the PDF (`pypdf`)
3. Extracted text is split into overlapping chunks (`LangChain`)
4. Each chunk is converted into a vector embedding (Google's embedding model)
5. Embeddings are stored in ChromaDB, a vector database
6. When the user asks a question, the question is embedded and compared against stored chunks using similarity search
7. The most relevant chunks are retrieved and injected into the AI's prompt as context
8. Google Gemini generates an answer grounded in the actual document content

## 📸 Screenshots

### Login
![Login](screenshots/login.png)

### Signup
![Signup](screenshots/signup.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### RAG in Action — AI answering questions from an uploaded document
![RAG Demo](screenshots/rag-demo.png)

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- A Google Gemini API key

### Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with:
```
DATABASE_URL=postgresql://username:password@localhost/dbname
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_API_KEY=your_google_gemini_api_key
```

Run migrations and start the server:
```bash
alembic upgrade head
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173/login` to get started.

## 🔮 Future Improvements

- OCR support for scanned/image-based PDFs
- Docker containerization and cloud deployment
- Automated test suite
- Support for multiple file formats (DOCX, TXT)
- Streaming AI responses

## 👩‍💻 Author

**Ayesha Mudassar**
CS Graduate, FAST-NUCES
