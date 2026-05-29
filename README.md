# NEUROS — AI Operating System Assistant

> Production-grade AI desktop assistant · Phase 1: Foundation

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 · TypeScript · TailwindCSS · Zustand |
| Backend | FastAPI · SQLAlchemy · SQLite (async) |
| AI | Ollama (llama3, mistral, etc.) |
| Deployment | Docker Compose |

---

## Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Python 3.11+](https://python.org)
- [Ollama](https://ollama.com) installed and running

---

## Quick Start (Local Development)

### 1. Install & Start Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Pull default model
ollama pull llama3
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/api/docs

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.local.example .env.local

# Start dev server
npm run dev
```

App available at: http://localhost:3000

---

## Docker Compose (Full Stack)

```bash
# Build and start all services
docker compose up --build

# Pull llama3 into the Ollama container
docker exec -it neuros-ollama ollama pull llama3
```

Services:
- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- Ollama → http://localhost:11434

---

## Project Structure

```
neuros/
├── backend/                # FastAPI application
│   ├── main.py             # App entry, CORS, routers
│   ├── config.py           # Pydantic settings
│   ├── models/             # Database ORM + Pydantic schemas
│   ├── routers/            # API route handlers
│   ├── services/           # Business logic layer
│   └── storage/uploads/    # Uploaded files
│
├── frontend/               # Next.js 15 application
│   ├── app/                # App router pages + layouts
│   ├── components/         # React components
│   │   ├── chat/           # Chat-specific components
│   │   └── layout/         # Layout shell components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API client + utilities
│   ├── store/              # Zustand global state
│   └── types/              # TypeScript type definitions
│
└── docker-compose.yml      # Multi-service orchestration
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | System health check |
| GET | `/api/models` | List available Ollama models |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations` | List all conversations |
| GET | `/api/conversations/:id` | Get conversation + messages |
| PATCH | `/api/conversations/:id` | Rename conversation |
| DELETE | `/api/conversations/:id` | Delete conversation |
| POST | `/api/chat` | Stream chat response (SSE) |
| POST | `/api/files/upload` | Upload file |
| GET | `/api/files/:id` | Download file |

---

## Phase Roadmap

- [x] **Phase 1** — Foundation: UI, chat, Ollama, history, file upload
- [ ] **Phase 2** — Memory: Vector DB, RAG, semantic search
- [ ] **Phase 3** — Tools: Web search, code execution, shell
- [ ] **Phase 4** — Automation: Browser control, workflow engine
- [ ] **Phase 5** — Voice: STT/TTS, wake word detection
- [ ] **Phase 6** — Desktop: Electron wrapper, OS integration

---

## Environment Variables

### Backend (`.env`)

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama endpoint |
| `OLLAMA_DEFAULT_MODEL` | `llama3` | Default model |
| `DATABASE_URL` | SQLite local | Async DB URL |
| `UPLOAD_DIR` | `./storage/uploads` | File storage path |
| `MAX_UPLOAD_SIZE_MB` | `50` | Max upload size |
| `ALLOWED_ORIGINS` | localhost:3000 | CORS origins |

### Frontend (`.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Backend API URL |
