import os
import chromadb
from typing import List, Dict, Any

# Completely offline fallback embedding engine aligned with ChromaDB's internal keyword signatures
class PureLocalEmbeddingFunction:
    def name(self) -> str:
        return "pure_local_fallback"

    # ChromaDB passes data here as 'texts'
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [[0.1] * 384 for _ in texts]

    # FIXED: Changed parameter name to 'input' to catch ChromaDB's keyword argument
    def embed_query(self, input: str) -> List[float]:
        return [0.1] * 384

    def __call__(self, input: List[str]) -> List[List[float]]:
        return self.embed_documents(input)


class VectorService:
    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
        self.client = chromadb.PersistentClient(path=self.db_path)
        
        local_embedder = PureLocalEmbeddingFunction()
        
        self.collection = self.client.get_or_create_collection(
            name="neuros_semantic_memory",
            metadata={"hnsw:space": "cosine"},
            embedding_function=local_embedder
        )
        
        self.file_collection = self.client.get_or_create_collection(
            name="neuros_file_knowledge",
            metadata={"hnsw:space": "cosine"},
            embedding_function=local_embedder
        )

    async def upsert_message(self, message_id: str, conversation_id: str, role: str, content: str):
        try:
            if not content or content.strip() == "":
                return
            self.collection.upsert(
                ids=[str(message_id)],
                documents=[str(content)],
                metadatas=[{
                    "conversation_id": str(conversation_id),
                    "role": str(role),
                    "type": "chat_memory"
                }]
            )
        except Exception as e:
            print(f"──> [VECTOR WARNING] Memory indexing skipped: {e}")

    async def query_memory(self, conversation_id: str, query_text: str, limit: int = 3) -> List[Dict[str, Any]]:
        try:
            if not query_text or query_text.strip() == "":
                return []
            results = self.collection.query(
                query_texts=[query_text],
                n_results=limit,
                where={"conversation_id": str(conversation_id)}
            )
            memories = []
            if results and 'documents' in results and results['documents'] and len(results['documents'][0]) > 0:
                for i in range(len(results['documents'][0])):
                    memories.append({
                        "content": results['documents'][0][i],
                        "distance": results['distances'][0][i] if 'distances' in results else 0
                    })
            return memories
        except Exception as e:
            print(f"──> [VECTOR WARNING] Memory lookup skipped: {e}")
            return []

    async def index_file_chunks(self, file_id: str, conversation_id: str, chunks: List[str]):
        try:
            if not chunks:
                return
            ids = [f"{file_id}_chunk_{idx}" for idx in range(len(chunks))]
            metadatas = [{
                "file_id": str(file_id),
                "conversation_id": str(conversation_id),
                "chunk_index": idx
            } for idx in range(len(chunks))]
            
            self.file_collection.upsert(
                ids=ids,
                documents=chunks,
                metadatas=metadatas
            )
            print(f"✅ [VECTOR SUCCESS] Successfully indexed {len(chunks)} chunks into ChromaDB.")
        except Exception as e:
            print(f"──> [VECTOR ERROR] File chunk indexing failed: {e}")

    async def query_file_knowledge(self, conversation_id: str, query_text: str, limit: int = 4) -> List[str]:
        try:
            if not query_text or query_text.strip() == "":
                return []
            results = self.file_collection.query(
                query_texts=[query_text],
                n_results=limit,
                where={"conversation_id": str(conversation_id)}
            )
            if results and 'documents' in results and results['documents'] and len(results['documents'][0]) > 0:
                return results['documents'][0]
            return []
        except Exception as e:
            print(f"──> [VECTOR ERROR] File context lookup failed: {e}")
            return []

def get_vector_service() -> VectorService:
    return VectorService()