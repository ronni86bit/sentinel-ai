"""
Embedding package for SentinelAI RAG system.
"""

from .pipeline import EmbeddingPipeline, embed_and_index
from .model import BGESmallEmbedder
from .indexer import (
    build_index,
    add_to_index,
    save_index,
    load_index,
)

__all__ = [
    "EmbeddingPipeline",
    "embed_and_index",
    "BGESmallEmbedder",
    "build_index",
    "add_to_index",
    "save_index",
    "load_index",
]