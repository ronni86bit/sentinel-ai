"""
Dense retrieval module for SentinelAI RAG system.

Provides a simple Retriever that loads a FAISS index built with
BAAI/bge-small-en-v1.5 embeddings and returns the top‑k most similar
chunks for a given query.

The retriever does NOT re‑rank or generate answers – it only returns
the raw chunks and their similarity scores (inner product, which equals
cosine similarity because vectors are L2‑normalised).
"""

from typing import List, Tuple, Any
import numpy as np
import logging
import os

try:
    import faiss
except ImportError as e:
    logging.error(
        "faiss-cpu is required for dense retrieval. "
        "Install it with: pip install faiss-cpu"
    )
    raise

from embedding.model import BGESmallEmbedder

logger = logging.getLogger(__name__)


class Retriever:
    """
    Encapsulates a FAISS index and its associated metadata (chunks)
    and provides a method to retrieve the top‑k chunks for a query.
    """

    def __init__(self, index_path: str, metadata_path: str):
        """
        Load the FAISS index and the metadata (list of chunk objects)
        from disk.

        Args:
            index_path: Path to the FAISS index file (without the
                        ".index" suffix – the same prefix used when
                        saving). The file <index_path>.index must exist.
            metadata_path: Path to the pickle file containing the list
                           of chunk objects (without the ".meta.pkl"
                           suffix). The file <metadata_path>.meta.pkl
                           must exist.
        """
        self.index_path = f"{index_path}.index"
        self.metadata_path = f"{metadata_path}.meta.pkl"

        if not os.path.exists(self.index_path):
            raise FileNotFoundError(f"FAISS index not found: {self.index_path}")
        if not os.path.exists(self.metadata_path):
            raise FileNotFoundError(f"Metadata file not found: {self.metadata_path}")

        # Load index
        self.index = faiss.read_index(self.index_path)
        logger.info(f"Loaded FAISS index from {self.index_path} with {self.index.ntotal} vectors")

        # Load metadata (chunks)
        import pickle
        with open(self.metadata_path, "rb") as f:
            self.chunks = pickle.load(f)
        logger.info(f"Loaded metadata from {self.metadata_path} with {len(self.chunks)} chunks")

        # Embedder for query encoding
        self.embedder = BGESmallEmbedder()

    def retrieve(
        self,
        query: str,
        k: int = 5,
    ) -> List[tuple[Any, float]]:
        """
        Return the top‑k chunks most similar to the query.

        Args:
            query: The user query string.
            k: Number of results to return (default 5).

        Returns:
            A list of tuples ``(chunk, score)`` where ``chunk`` is the
            original chunk object (as stored in the metadata) and
            ``score`` is the inner product similarity (equivalent to
            cosine similarity because vectors are L2‑normalised).
            Results are sorted descending by score.
        """
        if not query or not query.strip():
            return []

        # Encode the query (single string) – returns a 1×D array, L2‑normalised
        query_vec = self.embedder.encode(
            [query],
            batch_size=1,
            show_progress_bar=False,
            normalize_embeddings=True,
        )  # shape (1, D), dtype=float32

        # Perform search
        # Faiss returns distances and indices; for IndexFlatIP the
        # "distance" is actually the inner product (higher = more similar).
        distances, indices = self.index.search(query_vec, k)

        # FAISS returns arrays of shape (1, k)
        scores = distances[0].tolist()
        idxs = indices[0].tolist()

        results: List[tuple[Any, float]] = []
        for score, idx in zip(scores, idxs):
            if idx < 0 or idx >= len(self.chunks):
                # Should not happen, but guard against corrupted index
                continue
            results.append((self.chunks[idx], float(score)))

        return results


def retrieve_from_prefix(
    prefix: str,
    query: str,
    k: int = 5,
) -> List[tuple[Any, float]]:
    """
    Convenience function that loads an index from a file prefix and
    runs a retrieval query.

    Args:
        prefix: File path prefix (without extension) used when saving
                the index and metadata (e.g. "vectorstore/my_index").
        query: The user query string.
        k: Number of results to return.

    Returns:
        List of (chunk, score) tuples as described in :meth:`Retriever.retrieve`.
    """
    retriever = Retriever(prefix, prefix)  # same prefix for both files
    return retriever.retrieve(query, k)


if __name__ == "__main__":
    # Simple self‑test when run as a script.
    # This assumes you have already built an index via the embedding
    # pipeline and saved it with prefix "demo_index" (see embedding/pipeline.py).
    import logging
    import sys
    import tempfile
    import os

    logging.basicConfig(level=logging.INFO)

    # Build a tiny index for demonstration if none exists.
    demo_index_prefix = os.path.join(tempfile.gettempdir(), "demo_index")
    if not (os.path.exists(demo_index_prefix + ".index") and
            os.path.exists(demo_index_prefix + ".meta.pkl")):
        from ingestion import ingest_documents
        from chunking import chunk_documents
        from embedding import embed_and_index

        docs = ingest_documents("docs")
        chunks = chunk_documents(docs)
        index, _, _ = embed_and_index(chunks, batch_size=8)
        # Save using the same naming convention as EmbeddingPipeline.save
        import faiss, pickle
        faiss.write_index(index, demo_index_prefix + ".index")
        with open(demo_index_prefix + ".meta.pkl", "wb") as f:
            pickle.dump(chunks, f)
        print(f"Demo index created at {demo_index_prefix}")

    # Run a retrieval query
    retriever = Retriever(demo_index_prefix, demo_index_prefix)
    test_query = "What should be done before monsoon to reduce flood risk?"
    results = retriever.retrieve(test_query, k=3)

    print(f"\nQuery: {test_query}")
    print(f"Top {len(results)} results:")
    for rank, (chunk, score) in enumerate(results, start=1):
        # Chunk is expected to have a .text attribute; fallback to dict.
        text = getattr(chunk, "text", chunk.get("text", "")) if isinstance(chunk, dict) else getattr(chunk, "text", "")
        print(f"{rank}. Score: {score:.4f}")
        print(f"   Text: {text[:150].replace(chr(10), ' ')}...")
        print()