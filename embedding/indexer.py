"""
FAISS index utilities for the embedding pipeline.
"""

import logging
import os
from typing import List, Tuple, Any
import numpy as np

try:
    import faiss
except ImportError as e:
    logging.error(
        "faiss-cpu is required for FAISS index. "
        "Install it with: pip install faiss-cpu"
    )
    raise

logger = logging.getLogger(__name__)

def build_index(embeddings: np.ndarray) -> "faiss.Index":
    """
    Build a FAISS IndexFlatIP (inner product) from embeddings.

    Assumes embeddings are already L2-normalized (so inner product = cosine similarity).

    Args:
        embeddings: 2D numpy array of shape (n, d) with dtype float32.

    Returns:
        A faiss.IndexFlatIP containing the vectors.
    """
    if embeddings.ndim != 2:
        raise ValueError(f"Embeddings must be 2D, got shape {embeddings.shape}")
    if embeddings.dtype != np.float32:
        embeddings = embeddings.astype(np.float32)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    logger.info(f"Built FAISS index with {index.ntotal} vectors of dimension {dim}")
    return index

def add_to_index(index: "faiss.Index", embeddings: np.ndarray) -> None:
    """
    Add vectors to an existing FAISS index.

    Args:
        index: A faiss.Index instance.
        embeddings: 2D numpy array of shape (n, d) with dtype float32.
    """
    if embeddings.ndim != 2:
        raise ValueError(f"Embeddings must be 2D, got shape {embeddings.shape}")
    if embeddings.dtype != np.float32:
        embeddings = embeddings.astype(np.float32)
    index.add(embeddings)
    logger.info(f"Added {embeddings.shape[0]} vectors to index. Total now: {index.ntotal}")

def save_index(index: "faiss.Index", metadata: List[Any], prefix: str) -> None:
    """
    Save a FAISS index and associated metadata to disk.

    Args:
        index: The FAISS index to save.
        metadata: A list of metadata objects (one per vector) to save alongside the index.
        prefix: File path prefix (without extension). Two files will be created:
                <prefix>.index (the FAISS index)
                <prefix>.meta.pkl (pickle containing the metadata list)
    """
    # Ensure directory exists
    os.makedirs(os.path.dirname(os.path.abspath(prefix)) if os.path.dirname(prefix) else ".", exist_ok=True)

    index_path = f"{prefix}.index"
    meta_path = f"{prefix}.meta.pkl"

    faiss.write_index(index, index_path)
    import pickle
    with open(meta_path, "wb") as f:
        pickle.dump(metadata, f)

    logger.info(f"Saved FAISS index to {index_path} and metadata to {meta_path}")

def load_index(prefix: str) -> tuple["faiss.Index", List[Any]]:
    """
    Load a FAISS index and its metadata from disk.

    Args:
        prefix: File path prefix (without extension) as used in `save_index`.

    Returns:
        A tuple (index, metadata) where index is the loaded faiss.Index
        and metadata is the list of metadata objects.
    """
    index_path = f"{prefix}.index"
    meta_path = f"{prefix}.meta.pkl"

    if not os.path.exists(index_path):
        raise FileNotFoundError(f"FAISS index file not found: {index_path}")
    if not os.path.exists(meta_path):
        raise FileNotFoundError(f"Metadata file not found: {meta_path}")

    index = faiss.read_index(index_path)
    import pickle
    with open(meta_path, "rb") as f:
        metadata = pickle.load(f)

    logger.info(f"Loaded FAISS index from {index_path} with {index.ntotal} vectors")
    return index, metadata