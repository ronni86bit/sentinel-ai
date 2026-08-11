"""
BM25 retrieval module for SentinelAI RAG system.

Provides a simple BM25 indexer and retriever that works on the
enriched chunk objects produced by the chunking module.

The index is built using the rank-bm25 library (BM25Okapi) and
can be saved/loaded via pickle.

Only retrieval is performed – no re-ranking, no answer generation.
"""

import pickle
import re
from pathlib import Path
from typing import List, Tuple, Any
import logging

try:
    from rank_bm25 import BM25Okapi
except ImportError as e:  # pragma: no cover
    logging.error(
        "rank-bm25 is required for BM25 retrieval. "
        "Install it with: pip install rank-bm25"
    )
    raise

logger = logging.getLogger(__name__)


# Small set of English function words dropped during tokenization. Disaster
# terms (e.g. "flood", "storm") are deliberately NOT included so the sparse
# retriever can still match them.
STOPWORDS: frozenset = frozenset({
    "a", "an", "and", "are", "as", "at", "be", "been", "but", "by",
    "can", "could", "did", "do", "does", "during", "for", "from",
    "had", "has", "have", "he", "her", "his", "how", "i", "if", "in",
    "is", "it", "its", "may", "me", "my", "no", "not", "of", "on",
    "or", "our", "should", "so", "than", "that", "the", "their",
    "there", "these", "they", "this", "to", "was", "we", "were",
    "what", "when", "which", "who", "will", "with", "would", "you",
    "your",
})


class BM25Retriever:
    """
    Encapsulates a BM25 index and the associated chunk metadata.
    """

    def __init__(self, chunks: List[Any]):
        """
        Build the BM25 index from a list of chunk objects.

        Args:
            chunks: List of objects, each expected to expose a ``.text`` attribute
                    (or be a dict with key ``"text"``) containing the chunk's
                    textual content.
        """
        self.chunks = list(chunks)  # keep a copy for later retrieval
        tokenized_corpus = [self._tokenize(self._get_text(c)) for c in self.chunks]
        self.bm25 = BM25Okapi(tokenized_corpus)
        logger.info(f"Built BM25 index with {len(self.chunks)} documents")

    @staticmethod
    def _get_text(chunk: Any) -> str:
        """Extract the raw text string from a chunk object."""
        if hasattr(chunk, "text"):
            return chunk.text
        if isinstance(chunk, dict) and "text" in chunk:
            return chunk["text"]
        raise ValueError(
            "Each chunk must expose a `text` attribute or be a dict with key 'text'."
        )

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        """
        Tokenizer for BM25: lower‑cases, normalises punctuation (so
        "hurricane," and "hurricane" are the same token), and drops English
        stopwords and single‑character tokens so that high‑frequency function
        words do not dominate the sparse scores.
        """
        tokens = re.findall(r"[a-z0-9]+", text.lower())
        return [t for t in tokens if t not in STOPWORDS and len(t) > 1]

    def get_scores(self, query: str) -> List[float]:
        """
        Return raw BM25 scores for the query against all indexed chunks.

        Args:
            query: The user query string.

        Returns:
            List of scores (same length as ``self.chunks``).
        """
        tokenized_query = self._tokenize(query)
        return self.bm25.get_scores(tokenized_query)

    def retrieve(self, query: str, k: int = 5) -> List[tuple[Any, float]]:
        """
        Return the top‑k chunks ranked by BM25 score.

        Args:
            query: The user query string.
            k: Number of results to return (default 5).

        Returns:
            List of tuples ``(chunk, score)`` sorted descending by score.
        """
        if not query or not query.strip():
            return []

        scores = self.get_scores(query)
        # Get indices of top k scores
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
        results = [(self.chunks[i], float(scores[i])) for i in top_indices]
        return results

    # -----------------------------------------------------------------
    # Persistence helpers
    # -----------------------------------------------------------------
    def save(self, prefix: str) -> None:
        """
        Save the BM25 object and the chunk metadata to disk.

        Args:
            prefix: File path prefix (without extension). Two files will be created:
                    <prefix>.pkl      – the pickled BM25Retriever instance
                    <prefix>_chunks.pkl – the raw chunk list (optional, but kept for symmetry)
        """
        data = {
            "bm25": self.bm25,
            "chunks": self.chunks,
        }
        with open(f"{prefix}.pkl", "wb") as f:
            pickle.dump(data, f, protocol=pickle.HIGHEST_PROTOCOL)
        logger.info(f"Saved BM25 index and chunks to {prefix}.pkl")

    @classmethod
    def load(cls, prefix: str) -> "BM25Retriever":
        """
        Load a previously saved BM25 index.

        Args:
            prefix: File path prefix (without extension) used in :meth:`save`.

        Returns:
            A ``BM25Retriever`` instance with the restored index and chunks.
        """
        with open(f"{prefix}.pkl", "rb") as f:
            data = pickle.load(f)
        bm25 = data["bm25"]
        chunks = data["chunks"]
        obj = cls.__new__(cls)  # bypass __init__
        obj.bm25 = bm25
        obj.chunks = chunks
        logger.info(f"Loaded BM25 index from {prefix}.pkl with {len(chunks)} documents")
        return obj


def bm25_from_chunks(chunks: List[Any]) -> BM25Retriever:
    """
    Convenience function to build a BM25Retriever from a list of chunks.

    Args:
        chunks: List of chunk objects (see :class:`BM25Retriever.__init__`).

    Returns:
        Initialized BM25Retriever.
    """
    return BM25Retriever(chunks)


if __name__ == "__main__":  # pragma: no cover
    # Simple demonstration when run as a script.
    import sys
    import tempfile
    import os

    logging.basicConfig(level=logging.INFO)

    # Build a tiny example from the ingestion + chunking pipeline.
    from ingestion import ingest_documents
    from chunking import chunk_documents

    docs = ingest_documents("docs")
    chunks = chunk_documents(docs)
    print(f"Built {len(chunks)} chunks from {len(docs)} documents")

    # Create BM25 index
    retriever = BM25Retriever(chunks)

    # Save to a temporary location
    with tempfile.TemporaryDirectory() as tmpdir:
        prefix = os.path.join(tmpdir, "bm25_index")
        retriever.save(prefix)

        # Load it back
        loaded = BM25Retriever.load(prefix)

        # Run a query
        query = "What should be done before monsoon to reduce flood risk?"
        results = loaded.retrieve(query, k=3)
        print(f"\nQuery: {query}")
        for rank, (chunk, score) in enumerate(results, start=1):
            text = getattr(chunk, "text", chunk.get("text", "")) if isinstance(chunk, dict) else getattr(chunk, "text", "")
            print(f"{rank}. Score: {score:.4f}")
            print(f"   Text: {text[:120].replace(chr(10), ' ')}...")
            print()