"""
Reranking module for SentinelAI RAG system.

Uses the cross‑encoder BAAI/bge-reranker-base to rerank a list of
(chunk, score) tuples produced by a retrieval stage (dense, BM25, RRF, …).

Only the reranker scores are returned – no LLM generation is performed.
"""

from typing import List, Tuple, Any
import logging

try:
    from sentence_transformers import CrossEncoder
except ImportError as e:  # pragma: no cover
    logging.error(
        "sentence-transformers is required for the reranker. "
        "Install it with: pip install sentence-transformers"
    )
    raise

logger = logging.getLogger(__name__)


class BGEReranker:
    """
    Wrapper around the BAAI/bge-reranker-base cross‑encoder model.
    """

    def __init__(self, model_name: str = "BAAI/bge-reranker-base"):
        """
        Load the cross‑encoder model.

        Args:
            model_name: HuggingFace model identifier.
        """
        self.model_name = model_name
        try:
            self.model = CrossEncoder(model_name)
            logger.info(f"Loaded reranker model: {model_name}")
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            raise

    def _get_text(self, chunk: Any) -> str:
        """Extract the raw text string from a chunk object."""
        if hasattr(chunk, "text"):
            return chunk.text
        if isinstance(chunk, dict) and "text" in chunk:
            return chunk["text"]
        raise ValueError(
            "Each chunk must expose a `text` attribute or be a dict with key 'text'."
        )

    def rerank(
        self,
        query: str,
        ranked_results: List[Tuple[Any, float]],
        top_k: int = 5,
    ) -> List[Tuple[Any, float]]:
        """
        Rerank a list of (chunk, original_score) tuples.

        Args:
            query: The user query string.
            ranked_results: List of tuples ``(chunk, score)`` where ``score`` is
                            the score from the previous retrieval stage (ignored
                            for reranking). The list should already be sorted
                            by descending original score (though the reranker
                            will re‑order it).
            top_k: Number of results to return after reranking (default 5).

        Returns:
            A list of tuples ``(chunk, rerank_score)`` sorted by descending
            reranker score.
        """
        if not query or not query.strip():
            return []

        # Extract texts in the same order as ranked_results
        texts = [self._get_text(chunk) for chunk, _ in ranked_results]

        # Predict relevance scores (higher = more relevant)
        # CrossEncoder.predict returns a 1‑D array of scores.
        scores = self.model.predict(list(zip([query] * len(texts), texts)))
        # Ensure we have a plain Python list of floats
        scores = scores.tolist() if hasattr(scores, "tolist") else list(scores)

        # Pair each chunk with its new score
        scored_chunks = list(zip([c for c, _ in ranked_results], scores))

        # Sort descending by the new score
        scored_chunks.sort(key=lambda x: x[1], reverse=True)

        # Return top_k
        return scored_chunks[:top_k]


def rerank_top_fused(
    query: str,
    fused_results: List[Tuple[Any, float]],
    top_k: int = 5,
) -> List[Tuple[Any, float]]:
    """
    Convenience function to rerank the output of the RRF fusion step.

    Args:
        query: The user query string.
        fused_results: List of tuples ``(chunk, rrf_score)`` from
                       :func:`retrieval.fuse_dense_and_bm25` (or any other
                       fusion method).
        top_k: Number of results to return after reranking.

    Returns:
        List of tuples ``(chunk, rerank_score)`` sorted by descending
        reranker score.
    """
    reranker = BGEReranker()
    return reranker.rerank(query, fused_results, top_k=top_k)


if __name__ == "__main__":  # pragma: no cover
    # Simple self‑test when run as a script.
    import sys
    import os

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    # Mock chunk objects – in reality these come from the chunking module.
    class MockChunk:
        def __init__(self, doc_id: str, sec_id: str, text: str):
            self.metadata = {
                "document_id": doc_id,
                "section_id": sec_id,
                "chunk_index": 0,
            }
            self.text = text

        def __repr__(self):
            return f"<Chunk {self.metadata['document_id']}:{self.metadata['section_id']}>"

    # Create a small ranked list as might be returned by RRF
    chunk_a = MockChunk("DOC-01", "FLOOD-1", "Flood alert levels...")
    chunk_b = MockChunk("DOC-02", "HEAT-2", "Priority groups during heatwave...")
    chunk_c = MockChunk("DOC-03", "CYC-3", "Fisherfolk advisory...")  # intentional bug to show error handling

    # Correct the mistake
    chunk_c = MockChunk("DOC-03", "CYC-3", "Fisherfolk advisory...")

    fused = [
        (chunk_a, 0.0325),
        (chunk_b, 0.0323),
        (chunk_c, 0.0320),
    ]

    query = "What should be done before monsoon to reduce flood risk?"
    reranked = rerank_top_fused(query, fused, top_k=3)

    print("\nReranked results:")
    for ch, score in reranked:
        print(f"  {ch.metadata['document_id']}:{ch.metadata['section_id']} -> {score:.4f}")