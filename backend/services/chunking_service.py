from typing import List, Dict, Any
import uuid

class ChunkingService:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        chunk_size: Maximum characters per vector segment
        chunk_overlap: Shared characters between consecutive chunks to maintain context
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text: str) -> List[str]:
        """Splits raw document text into overlapping sliding-window segments."""
        if not text:
            return []
            
        chunks = []
        position = 0
        text_length = len(text)
        
        # Sliding window chunking algorithm
        while position < text_length:
            # Grab slice
            chunk = text[position : position + self.chunk_size]
            if chunk.strip():
                chunks.append(chunk.strip())
                
            # Move window forward by size minus the overlap state
            position += self.chunk_size - self.chunk_overlap
            
            # Prevent infinite loops if configuration weights are bad
            if self.chunk_size <= self.chunk_overlap:
                break
                
        return chunks

def get_chunking_service() -> ChunkingService:
    return ChunkingService()