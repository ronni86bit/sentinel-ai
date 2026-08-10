"""
Retrieval package for SentinelAI RAG system.

Exports both dense (FAISS) and sparse (BM25) retrievers,
plus a fusion utility for Reciprocal Rank Fusion (RRF) and
a query‑understanding‑aware retrieval helper.
"""

# Dense retriever (FAISS) - reuse earlier implementation if present.
try:
    from .retriever import Retriever, retrieve_from_prefix  # noqa: F401
except Exception:  # pragma: no cover
    # If dense retriever not yet present, ignore.
    pass

# Sparse retriever (BM25)
from .bm25 import (
    BM25Retriever,
    bm25_from_chunks,
)

# Fusion (RRF)
from .rrf import (
    reciprocal_rank_fusion,
    fuse_dense_and_bm25,
)

# Query‑understanding‑aware retrieval
from .understanding_retrieval import retrieve_with_understanding

__all__ = [
    # Dense (if available)
    "Retriever",
    "retrieve_from_prefix",
    # Sparse
    "BM25Retriever",
    "bm25_from_chunks",
    # Fusion
    "reciprocal_rank_fusion",
    "fuse_dense_and_bm25",
    # Understanding‑aware retrieval
    "retrieve_with_understanding",
]