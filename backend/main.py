from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from models.database import init_db
from models.schemas import HealthResponse
from services.ollama_service import get_ollama_service
from routers import chat, models, conversations, files

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown (cleanup if needed)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(files.router, prefix="/api")


@app.get("/api/health", response_model=HealthResponse, tags=["system"])
async def health_check():
    ollama = get_ollama_service()
    is_connected = await ollama.is_available()
    model_list = await ollama.list_models() if is_connected else []

    return HealthResponse(
        status="operational",
        version=settings.app_version,
        ollama_connected=is_connected,
        ollama_models=len(model_list),
    )


@app.get("/", tags=["system"])
async def root():
    return {"name": "NEUROS API", "version": settings.app_version, "docs": "/api/docs"}
