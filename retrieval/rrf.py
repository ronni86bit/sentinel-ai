"""
Reciprocal Rank Fusion (RRF) module for SentinelAI RAG system.

Provides a function to fuse multiple ranked lists (e.g., dense and BM25 results)
into a single ranking using the RRF formula:

    score_rrf = sum_{r in runs} 1.0 / (k + rank_r)

where rank_r is the position (1-based) of the item in run r.

The function is backend‑agnostic: it only requires that each run is a list of
(chunk, score) tuples sorted in descending order of the original score.
"""

from typing import List, Tuple, Any, Dict
import logging

logger = logging.getLogger(__name__)


def _make_chunk_key(chunk: Any) -> str:
    """
    Create a stable, hashable key for a chunk object.

    The chunk is expected to have a ``metadata`` attribute (or be a dict with
    a ``metadata`` key) that contains at least ``document_id`` and ``section_id``.
    If those are missing, we fall back to a hash of the chunk's text.

    Args:
        chunk: A chunk object as returned by the retrievers.

    Returns:
        A string that can be used as a dictionary key.
    """
    # Try to get metadata
    meta = None
    if hasattr(chunk, "metadata"):
        meta = chunk.metadata
    elif isinstance(chunk, dict):
        meta = chunk.get("metadata")

    if isinstance(meta, dict):
        doc_id = meta.get("document_id")
        sec_id = meta.get("section_id")
        chunk_idx = meta.get("chunk_index", 0)
        if doc_id is not None and sec_id is not None:
            return f"{doc_id}:{sec_id}:{chunk_idx}"

    # Fallback: use the text (hash it to keep length reasonable)
    text = ""
    if hasattr(chunk, "text"):
        text = chunk.text
    elif isinstance(chunk, dict):
        text = chunk.get("text", "")
    # Use a simple hash of the text; collisions are extremely unlikely for our use case.
    return f"text:{hash(text)}"


def reciprocal_rank_fusion(
    runs: List[List[Tuple[Any, float]]],
    k: int = 60,
) -> List[Tuple[Any, float]]:
    """
    Fuse multiple ranked lists using Reciprocal Rank Fusion.

    Args:
        runs: A list of ranked lists. Each inner list contains tuples
              ``(chunk, score)`` sorted by descending original score (the
              original score is ignored for RRF; only the rank matters).
        k: The constant in the RRF formula (default 60). Common values in
           the literature are 60 or 10.

    Returns:
        A list of tuples ``(chunk, rrf_score)`` sorted by descending RRF score.
    """
    if not runs:
        return []

    # Maps chunk key -> (chunk object, accumulated rrf score)
    key_to_chunk: Dict[str, Any] = {}
    rrf_scores: Dict[str, float] = {}

    for run_idx, run in enumerate(runs):
        if not run:
            continue
        for rank, (chunk, _) in enumerate(run, start=1):  # rank starts at 1
            key = _make_chunk_key(chunk)
            # Store the chunk object the first time we see it
            if key not in key_to_chunk:
                key_to_chunk[key] = chunk
            # Accumulate the RRF contribution
            rrf_scores[key] = rrf_scores.get(key, 0.0) + 1.0 / (k + rank)

    # Sort keys by descending RRF score
    sorted_keys = sorted(rrf_scores.keys(), key=lambda k: rrf_scores[k], reverse=True)

    # Build the final list of (chunk, score) tuples
    fused_results: List[Tuple[Any, float]] = []
    for key in sorted_keys:
        fused_results.append((key_to_chunk[key], rrf_scores[key]))

    logger.info(f"RRF fused {len(fused_results)} unique chunks from {len(runs)} runs")
    return fused_results


def fuse_dense_and_bm25(
    dense_results: List[Tuple[Any, float]],
    bm25_results: List[Tuple[Any, float]],
    k: int = 60,
) -> List[Tuple[Any, float]]:
    """
    Convenience function to fuse dense (FAISS) and BM25 retrieval results.

    Args:
        dense_results: Output from a dense retriever (list of (chunk, score)).
        bm25_results: Output from a BM25 retriever (list of (chunk, score)).
        k: RRF constant.

    Returns:
        Fused ranking as list of (chunk, rrf_score).
    """
    return reciprocal_rank_fusion([dense_results, bm25_results], k=k)


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

    # Create two fake ranked lists
    chunk_a = MockChunk("DOC-01", "FLOOD-1", "Flood alert levels...")
    chunk_b = MockChunk("DOC-02", "HEAT-2", "Priority groups during heatwave...")
    chunk_c = MockChunk("DOC-03", "CYC-3", "Fisherfolk advisory...")

    dense = [
        (chunk_a, 0.9),
        (chunk_c, 0.7),
        (chunk_b, 0.5),
    ]
    bm25 = [
        (chunk_b, 10.0),
        (chunk_a, 8.0),
        (chunk_c, 5.0),
    ]

    fused = fuse_dense_and_bm25(dense, bm25, k=60)

    print("Dense results:")
    for ch, sc in dense:
        print(f"  {ch.metadata['document_id']}:{ch.metadata['section_id']} -> {sc:.4f}")
    print("\nBM25 results:")
    for ch, sc in bm25:
        print(f"  {ch.metadata['document_id']}:{ch.metadata['section_id']} -> {sc:.2f}")
    print("\nFused (RRF) results:")
    for ch, sc in fused:
        print(f"  {ch.metadata['document_id']}:{ch.metadata['section_id']} -> {sc:.4f}")