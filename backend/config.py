from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "NEUROS API"
    app_version: str = "1.0.0"
    debug: bool = False

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_default_model: str = "llama3"
    ollama_timeout: int = 120

    # Database
    database_url: str = "sqlite+aiosqlite:///./neuros.db"

    # Storage
    upload_dir: str = "./storage/uploads"
    max_upload_size_mb: int = 50

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
