from fastapi import APIRouter, Depends
from models.schemas import ModelsResponse
from services.ollama_service import get_ollama_service, OllamaService
from config import get_settings

router = APIRouter(prefix="/models", tags=["models"])
settings = get_settings()


@router.get("", response_model=ModelsResponse)
async def list_models(ollama: OllamaService = Depends(get_ollama_service)):
    models = await ollama.list_models()
    return ModelsResponse(
        models=models,
        default_model=settings.ollama_default_model,
    )
