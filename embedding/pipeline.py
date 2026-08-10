"""
High‑level embedding pipeline for the SentinelAI RAG system.

The pipeline:
    1. Takes a list of chunk objects (each with a `.text` attribute).
    2. Computes embeddings using the BAAI/bge-small-en-v1.5 model.
    3. Builds a FAISS IndexFlatIP (inner product) index.
    4. Provides methods to save/load the index and the associated chunk metadata.

This module does NOT implement retrieval (search) – that is left to the
retrieval component.
"""

import logging
import os
from typing import List, Tuple, Any

import numpy as np

from .model import BGESmallEmbedder
from .indexer import build_index, add_to_index, save_index, load_index

logger = logging.getLogger(__name__)

class EmbeddingPipeline:
    """
    Encapsulates the steps to go from raw text chunks to a searchable
    FAISS index using the BGE-small embedding model.
    """

    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        self.embedder = BGESmallEmbedder(model_name=model_name)
        self.index: object = None  # will be a faiss.Index
        self.embeddings: np.ndarray = None
        self.chunks: List[Any] = None

    def encode_chunks(self, chunks: List[Any], batch_size: int = 32) -> np.ndarray:
        """
        Compute embeddings for the supplied chunks.

        Args:
            chunks: List of objects, each expected to have a `.text` attribute
                    (or be a dict with a "text" key) containing the string to embed.
            batch_size: Batch size passed to the embedding model.

        Returns:
            A numpy array of shape (len(chunks), D) with dtype float32,
            L2‑normalized (ready for inner product similarity).
        """
        texts = []
        for ch in chunks:
            if hasattr(ch, "text"):
                texts.append(ch.text)
            elif isinstance(ch, dict) and "text" in ch:
                texts.append(ch["text"])
            else:
                raise ValueError(
                    "Each chunk must expose a `text` attribute or be a dict with key `text`."
                )
        embeddings = self.embedder.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            normalize_embeddings=True,
        )
        self.embeddings = embeddings
        self.chunks = list(chunks)  # keep a copy
        return embeddings

    def build_index(self, embeddings: np.ndarray = None) -> object:
        """
        Build a FAISS IndexFlatIP from embeddings.

        If `embeddings` is None, uses the embeddings produced by the most
        recent call to `embed_chunks`.

        Args:
            embeddings: Optional pre‑computed embedding matrix.

        Returns:
            The constructed FAISS index (also stored in `self.index`).
        """
        if embeddings is None:
            if self.embeddings is None:
                raise ValueError("No embeddings available. Call `embed_chunks` first.")
            embeddings = self.embeddings
        self.index = build_index(embeddings)
        return self.index

    def add_to_index(self, embeddings: np.ndarray) -> None:
        """
        Add additional vectors to an existing index.

        Args:
            embeddings: 2D numpy array of shape (n, D) to add.
        """
        if self.index is None:
            raise ValueError("Index not initialized. Call `build_index` first.")
        add_to_index(self.index, embeddings)

    def get_index(self) -> object:
        """Return the current FAISS index (or None if not built)."""
        return self.index

    def save(self, prefix: str) -> None:
        """
        Persist the index and the chunk metadata to disk.

        Args:
            prefix: File path stem (without extension). Two files will be created:
                    <prefix>.index   – the FAISS index
                    <prefix>.meta.pkl – a pickle containing the list of chunk objects
        """
        if self.index is None:
            raise ValueError("No index to save. Build it first.")
        if self.chunks is None:
            raise ValueError("No chunks stored. Run `encode_chunks` before saving.")
        # Ensure directory exists
        os.makedirs(
            os.path.dirname(os.path.abspath(prefix)) if os.path.dirname(prefix) else ".",
            exist_ok=True,
        )
        index_path = f"{prefix}.index"
        meta_path = f"{prefix}.meta.pkl"

        from sentence_transformers import SentenceTransformer  # noqa: F401
        import faiss
        import pickle

        faiss.write_index(self.index, index_path)
        with open(meta_path, "wb") as f:
            pickle.dump(self.chunks, f)

        logger.info(f"Saved FAISS index to {index_path}")
        logger.info(f"Saved chunk metadata to {meta_path}")

    @classmethod
    def load(cls, prefix: str) -> "EmbeddingPipeline":
        """
        Load a previously saved pipeline (index + chunk metadata) from disk.

        Args:
            prefix: File path stem (without extension) as used in `save`.

        Returns:
            An `EmbeddingPipeline` instance with `index` and `chunks` populated.
        """
        index_path = f"{prefix}.index"
        meta_path = f"{prefix}.meta.pkl"

        if not os.path.exists(index_path):
            raise FileNotFoundError(f"Index file not found: {index_path}")
        if not os.path.exists(meta_path):
            raise FileNotFoundError(f"Metadata file not found: {meta_path}")

        # Load index
        index = faiss.read_index(index_path)
        # Load chunks
        with open(meta_path, "rb") as f:
            chunks = pickle.load(f)

        # Create a new pipeline instance and populate its fields
        pipeline = cls()
        pipeline.index = index
        pipeline.chunks = chunks
        # Note: we do not recompute embeddings here; they are not needed for search
        # but could be recomputed from chunks if required.
        logger.info(f"Loaded FAISS index from {index_path} with {index.ntotal} vectors")
        logger.info(f"Loaded chunk metadata from {meta_path} with {len(chunks)} items")
        return pipeline

# Convenience functional interface (optional)
def embed_and_index(
    chunks: List[Any],
    model_name: str = "BAAI/bge-small-en-v1.5",
    batch_size: int = 32,
) -> tuple[object, np.ndarray, List[Any]]:
    """
    One‑shot helper: embed a list of chunks and return the ready‑to‑use FAISS index.

    Args:
        chunks: List of chunk objects (see `EmbeddingPipeline.encode_chunks`).
        model_name: Name of the sentence‑transformer model to use.
        batch_size: Batch size for encoding.

    Returns:
        (index, embeddings, chunks) where:
            - index: a populated faiss.IndexFlatIP
            - embeddings: the numpy array of embeddings (float32, L2‑normed)
            - chunks: the original chunks list (for metadata alignment)
    """
    pipeline = EmbeddingPipeline(model_name=model_name)
    embeddings = pipeline.encode_chunks(chunks, batch_size=batch_size)
    index = pipeline.build_index(embeddings)
    return index, embeddings, chunks

if __name__ == "__main__":
    # Simple smoke‑test when run as a script
    logging.basicConfig(level=logging.INFO)

    # Dummy chunks for demonstration
    class DummyChunk:
        def __init__(self, text: str, meta: dict = None):
            self.text = text
            self.meta = meta or {}

    demo_chunks = [
        DummyChunk("The quick brown fox jumps over the lazy dog.", {"src": "test"}),
        DummyChunk("FAISS is a library for efficient similarity search and clustering of dense vectors.", {"src": "test"}),
        DummyChunk("BSGE‑small‑en‑v1.5 produces sentence embeddings suitable for information retrieval.", {"src": "test"}),
    ]

    # Run the pipeline
    idx, embs, chs = embed_and_index(demo_chunks)
    print(f"Built index with {idx.ntotal} vectors of dimension {embs.shape[1]}")

    # Optional: save and reload to verify persistence
    import tempfile
    import os
    with tempfile.TemporaryDirectory() as tmp:
        prefix = os.path.join(tmp, "demo_index")
        # Save
        # We need an EmbeddingPipeline instance to use its save method; recreate:
        pipe = EmbeddingPipeline()
        pipe.encode_chunks(demo_chunks)
        pipe.build_index()
        pipe.save(prefix)
        # Load
        pipe2 = EmbeddingPipeline.load(prefix)
        print(f"Reloaded index has {pipe2.index.ntotal} vectors")
        assert pipe2.index.ntotal == idx.ntotal