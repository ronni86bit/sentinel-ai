"""
Metadata-aware retrieval using the Query Understanding Engine.

Given a user query, this module:
1. Parses the query to infer disaster type and information intent.
2. Retrieves dense (FAISS) and BM25 results.
3. Applies a soft boost to results whose metadata matches the inferred
   disaster type (via section_id prefix) or intent (via section title keywords).
4. Falls back to the original (non‑boosted) results if boosting does not
   improve the top score above a low threshold.
5. Fuses the (possibly boosted) dense and BM25 lists with Reciprocal Rank
   Fusion (RRF) and returns the fused list.

No LLM is used – all logic is rule‑based.
"""

from __future__ import annotations

from typing import List, Tuple, Any, Dict
import logging

from query_understanding import parse_query
from retrieval import reciprocal_rank_fusion

logger = logging.getLogger(__name__)

# ----------------------------------------------------------------------
# Configuration – can be moved to a config file later
# ----------------------------------------------------------------------
DISASTER_PREFIX_MAP: dict[str, str] = {
    "flood": "FLOOD",
    "heatwave": "HEAT",
    "cyclone": "CYC",
    "shelter": "SHELTER",
    # "unknown": ""  # no boost
}

INTENT_KEYWORDS: dict[str, List[str]] = {
    "preparedness": ["preparedness", "pre-monsoon", "prepare", "precaution"],
    "evacuation": ["evacuation", "evacuate", "relocate"],
    "assessment": ["assessment", "impact", "damage", "post-event", "survey"],
    "communication": ["communication", "message", "alert", "warning", "inform", "notify", "public"],
    "general": [],  # no specific boost
}

# Boost values added to the raw retrieval score
DISASTER_BOOST: float = 0.2
INTENT_BOOST: float = 0.1

# If the best boosted score is below this threshold we discard boosting
# and fall back to the original (non‑boosted) ranking.
DENSE_BOOST_THRESHOLD: float = 0.3   # inner‑product score range ≈ [0,1]
BM25_BOOST_THRESHOLD: float = 0.5    # BM25 scores are typically >0


def _apply_boost(
    results: List[tuple[Any, float]],
    disaster_type: str,
    info_intent: str,
    is_dense: bool,
) -> List[tuple[Any, float]]:
    """Return a new list where each score is increased if the chunk matches
    the inferred disaster type or intent."""
    if not results:
        return results

    prefix = DISASTER_PREFIX_MAP.get(disaster_type, "")
    intent_keywords = INTENT_KEYWORDS.get(info_intent, [])

    boosted: List[tuple[Any, float]] = []
    for chunk, score in results:
        boost = 0.0

        # Disaster type match via section_id prefix
        if prefix:
            meta = getattr(chunk, "metadata", {})
            sec_id = meta.get("section_id", "")
            if isinstance(sec_id, str) and sec_id.upper().startswith(prefix):
                boost += DISASTER_BOOST

        # Intent match via section title (case‑insensitive)
        if intent_keywords:
            meta = getattr(chunk, "metadata", {})
            title = meta.get("section_title", "")
            if isinstance(title, str):
                title_low = title.lower()
                if any(kw in title_low for kw in intent_keywords):
                    boost += INTENT_BOOST

        if boost:
            new_score = float(score) + boost
            boosted.append((chunk, new_score))
        else:
            boosted.append((chunk, float(score)))

    return boosted


def _maybe_fallback(
    original: List[tuple[Any, float]],
    boosted: List[tuple[Any, float]],
    is_dense: bool,
) -> List[tuple[Any, float]]:
    """If boosting did not improve the top score beyond a threshold,
    fall back to the original ordering."""
    if not original or not boosted:
        return original

    # Compare best scores
    best_orig = original[0][1]
    best_boost = boosted[0][1]

    threshold = DENSE_BOOST_THRESHOLD if is_dense else BM25_BOOST_THRESHOLD

    if best_boost < threshold:
        logger.debug(
            f"Boosting did not exceed threshold ({best_boost:.3f} < {threshold:.3f}); "
            "falling back to original ranking."
        )
        return original
    return boosted


def retrieve_with_understanding(
    dense_retriever: Any,  # instance of retrieval.Retriever
    bm25_retriever: Any,   # instance of retrieval.BM25Retriever
    query: str,
    k: int = 5,
) -> List[tuple[Any, float]]:
    """
    Perform metadata‑aware dense + BM25 retrieval guided by query understanding.

    Parameters
    ----------
    dense_retriever: Retriever
        Initialized dense (FAISS) retriever.
    bm25_retriever: BM25Retriever
        Initialized BM25 retriever (already fitted on the same chunk set).
    query: str
        User question.
    k: int
        Number of final fused results to return.

    Returns
    -------
    List[Tuple[chunk, score]]
        Fused list sorted by descending RRF score.
    """
    if not query or not query.strip():
        return []

    # 1️⃣ Understand the query
    understanding = parse_query(query)
    disaster_type = understanding.get("disaster_type", "unknown")
    info_intent = understanding.get("info_intent", "unknown")
    logger.debug(
        f"Query understanding – disaster: {disaster_type}, intent: {info_intent}"
    )

    # 2️⃣ Retrieve raw results
    dense_raw = dense_retriever.retrieve(query, k=k)
    bm25_raw = bm25_retriever.retrieve(query, k=k)

    # 3️⃣ Apply boost based on understanding
    dense_boosted = _apply_boost(dense_raw, disaster_type, info_intent, is_dense=True)
    bm25_boosted = _apply_boost(bm25_raw, disaster_type, info_intent, is_dense=False)

    # 4️⃣ Fallback if boosting didn't help
    dense_final = _maybe_fallback(dense_raw, dense_boosted, is_dense=True)
    bm25_final = _maybe_fallback(bm25_raw, bm25_boosted, is_dense=False)

    # 5️⃣ Fuse with weighted RRF (dense weighted higher to dampen noisy BM25)
    fused = reciprocal_rank_fusion(
        [dense_final, bm25_final], k=20, weights=[0.7, 0.3]
    )

    # Return top k
    return fused[:k]


# ----------------------------------------------------------------------
# Simple demo when run as a script
# ----------------------------------------------------------------------
if __name__ == "__main__":  # pragma: no cover
    import logging
    import tempfile
    import os

    logging.basicConfig(level=logging.DEBUG)

    # Build a tiny demo index if none exists (re‑using the demo from retriever.py)
    demo_prefix = os.path.join(tempfile.gettempdir(), "demo_index")
    if not (os.path.exists(demo_prefix + ".index") and os.path.exists(demo_prefix + ".meta.pkl")):
        from ingestion import ingest_documents
        from chunking import chunk_documents
        from embedding import embed_and_index
        from retrieval import BM25Retriever

        docs = ingest_documents("docs")
        chunks = chunk_documents(docs)
        index, _, _ = embed_and_index(chunks, batch_size=8)

        import faiss, pickle
        faiss.write_index(index, demo_prefix + ".index")
        with open(demo_prefix + ".meta.pkl", "wb") as f:
            pickle.dump(chunks, f)
        bm25 = BM25Retriever(chunks)
        bm25.save(demo_prefix + "_bm25.pkl")
        print(f"Demo index and BM25 created at {demo_prefix}")

    # Load retrievers
    from retrieval import Retriever
    bm25_ret = BM25Retriever.load(demo_prefix + "_bm25.pkl")
    dense_ret = Retriever(demo_prefix, demo_prefix)

    test_queries = [
        "What should be done before monsoon to reduce flood risk?",
        "When should we evacuate during a flood?",
        "Explain the impact of flood damage after water recedes.",
        "How to send a public warning about incoming cyclone?",
        "Is there any immediate action needed for heatwave today?",
    ]

    for q in test_queries:
        print(f"\nQuery: {q}")
        res = retrieve_with_understanding(dense_ret, bm25_ret, q, k=3)
        for i, (chunk, score) in enumerate(res, start=1):
            meta = getattr(chunk, "metadata", {})
            sec_id = meta.get("section_id", "?")
            txt = getattr(chunk, "text", "")
            print(f"{i}. Score: {score:.4f} | Section: {sec_id} | {txt[:80]}...")