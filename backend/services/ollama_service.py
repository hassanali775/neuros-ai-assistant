import httpx
import json
from typing import AsyncIterator
from config import get_settings
from models.schemas import ChatMessage, OllamaModelDetail

settings = get_settings()


class OllamaService:
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.timeout = settings.ollama_timeout

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=self.base_url,
            timeout=httpx.Timeout(self.timeout, connect=10.0),
        )

    async def is_available(self) -> bool:
        try:
            async with self._client() as client:
                response = await client.get("/api/tags")
                return response.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> list[OllamaModelDetail]:
        try:
            async with self._client() as client:
                response = await client.get("/api/tags")
                response.raise_for_status()
                data = response.json()
                return [
                    OllamaModelDetail(
                        name=m.get("name", ""),
                        modified_at=m.get("modified_at"),
                        size=m.get("size"),
                        digest=m.get("digest"),
                    )
                    for m in data.get("models", [])
                ]
        except Exception:
            return []

    async def stream_chat(
        self,
        model: str,
        messages: list[ChatMessage],
        system_prompt: str | None = None,
    ) -> AsyncIterator[str]:
        payload_messages = []

        if system_prompt:
            payload_messages.append({"role": "system", "content": system_prompt})

        for msg in messages:
            payload_messages.append({"role": msg.role.value, "content": msg.content})

        payload = {
            "model": model,
            "messages": payload_messages,
            "stream": True,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            },
        }

        async with self._client() as client:
            async with client.stream("POST", "/api/chat", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        chunk = json.loads(line)
                        token = chunk.get("message", {}).get("content", "")
                        if token:
                            yield token
                        if chunk.get("done", False):
                            break
                    except json.JSONDecodeError:
                        continue

    async def generate(self, model: str, messages: list[ChatMessage]) -> str:
        """Non-streaming full response."""
        full_response = ""
        async for token in self.stream_chat(model, messages):
            full_response += token
        return full_response


_ollama_service: OllamaService | None = None


def get_ollama_service() -> OllamaService:
    global _ollama_service
    if _ollama_service is None:
        _ollama_service = OllamaService()
    return _ollama_service
