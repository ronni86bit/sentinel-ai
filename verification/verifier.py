"""
Verification layer for SentinelAI RAG.

Before sending retrieved context to the LLM, this module checks:
- retrieval score (max similarity)
- number of supporting sections (unique section IDs)
- context coverage (fraction of query words present in the retrieved text)

If any check fails, returns False, indicating evidence is weak and the
caller should return "Not found in the provided documents." without invoking
the LLM.

The thresholds are configurable at the top of the file.
"""

import re
from typing import List, Tuple, Any

# ----------------------- Configuration -----------------------
# Minimum acceptable retrieval score (max of similarity scores)
# For inner‑product cosine similarity (range ~0‑1) a value of 0.2 is a low bar.
MIN_SCORE: float = 0.2

# Minimum number of distinct sections that must be present
MIN_SECTIONS: int = 1

# Minimum fraction of query words that must appear in the retrieved context
MIN_COVERAGE: float = 0.2   # 20% of query terms


def verify_evidence(
    retrieved_chunks: List[Tuple[Any, float]],
    query: str,
) -> bool:
    """
    Determine whether the retrieved evidence is strong enough to proceed
    to LLM generation.

    Parameters
    ----------
    retrieved_chunks : List[Tuple[chunk, score]]
        Output from the retrieval/reranking pipeline.  The score is the
        relevance score returned by the retriever (higher = more relevant).
    query : str
        The original user question.

    Returns
    -------
    bool
        True if evidence meets all thresholds, False otherwise.
    """
    if not retrieved_chunks:
        return False

    # 1️⃣ Retrieval score – use the maximum score as a conservative signal
    scores = [score for _, score in retrieved_chunks]
    max_score = max(scores) if scores else 0.0

    # 2️⃣ Number of supporting sections – unique section IDs in metadata
    section_ids = set()
    for chunk, _ in retrieved_chunks:
        meta = getattr(chunk, "metadata", {})
        sid = meta.get("section_id")
        if isinstance(sid, str) and sid:
            section_ids.add(sid)
    num_sections = len(section_ids)

    # 3️⃣ Context coverage – proportion of query words found in the retrieved text
    # Build a single lowercase string from all chunk texts
    texts = []
    for chunk, _ in retrieved_chunks:
        txt = getattr(chunk, "text", "")
        if isinstance(txt, str):
            texts.append(txt.lower())
    context_text = " ".join(texts)

    # Tokenise query into words (alphanumeric)
    query_words = set(re.findall(r"\w+", query.lower()))
    if not query_words:
        # Empty query – treat as insufficient
        return False

    matched = {w for w in query_words if w in context_text}
    coverage = len(matched) / len(query_words) if query_words else 0.0

    # Decision: all three criteria must be satisfied
    passes = (
        max_score >= MIN_SCORE
        and num_sections >= MIN_SECTIONS
        and coverage >= MIN_COVERAGE
    )

    # Optional: log why it failed (for debugging)
    # In a real system you would use a logger; here we just return bool.
    return passes


if __name__ == "__main__":  # pragma: no cover
    # Simple manual test
    class DummyChunk:
        def __init__(self, text: str, section_id: str):
            self.text = text
            self.metadata = {"section_id": section_id}

    # Example 1 – strong evidence
    chunks1 = [
        (DummyChunk("Before monsoon, clean storm drains and check embankments.", "FLOOD-2"), 0.85),
        (DummyChunk("Evacuate when water level exceeds the danger mark.", "FLOOD-3"), 0.78),
    ]
    q1 = "What should be done before monsoon to reduce flood risk?"
    print("Test 1 (should be True):", verify_evidence(chunks1, q1))

    # Example 2 – weak score
    chunks2 = [
        (DummyChunk("Some unrelated text.", "OTHER-1"), 0.05),
    ]
    q2 = "What should be done before monsoon?"
    print("Test 2 (should be False):", verify_evidence(chunks2, q2))

    # Example 3 – insufficient sections (same section repeated)
    chunks3 = [
        (DummyChunk("Before monsoon, clean drains.", "FLOOD-2"), 0.9),
        (DummyChunk("Another sentence from same section.", "FLOOD-2"), 0.8),
    ]
    q3 = "What should be done before monsoon?"
    # With MIN_SECTIONS=1 this will still pass; just demonstrating.
    print("Test 3 (sections count):", verify_evidence(chunks3, q3))