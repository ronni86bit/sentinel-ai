"""
Groq-based answer generator for SentinelAI RAG system.

Uses Groq's Llama 3.3 70B model (via Groq API). The model is instructed to answer strictly from the provided context, never fabricate facts, phone numbers, or laws, and to cite section IDs. If the context does not contain enough information, it returns exactly:
    "Not found in the provided documents."

The public method `generate` returns a dict:
    {"answer": str, "citations": List[str]}
"""

from __future__ import annotations

import logging
import os
import re
from typing import Any, Dict, List, Tuple

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

try:
    from groq import Groq
except ImportError as e:  # pragma: no cover
    raise ImportError(
        "groq is not installed. Install it with "
        "`pip install groq`."
    ) from e


class GeminiGenerator:
    """
    Groq-based generator wrapper that maintains the same interface as the
    original GeminiGenerator for backward compatibility.
    """

    def __init__(
        self,
        model_name: str = "llama-3.3-70b-versatile",
        api_key: str | None = None,
    ) -> None:
        """
        Initialize the Groq generator.

        Args:
            model_name: Name of the Groq model to use. Defaults to "llama3-70b-8192".
            api_key: Groq API key. If None, reads from the environment variable
                `GROQ_API_KEY`.
        """
        self.model_name = model_name
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Groq API key not provided. Set GROQ_API_KEY env var or pass api_key."
            )
        self.client = Groq(api_key=self.api_key)
        self.model = model_name  # Keep for compatibility

    # -----------------------------------------------------------------
    # Internal helpers
    # -----------------------------------------------------------------
    def _format_context(self, chunks: List[Tuple[Any, float]]) -> str:
        """
        Turn retrieved chunks into a readable block with section IDs.
        """
        lines: List[str] = []
        for chunk, _score in chunks:
            meta = getattr(chunk, "metadata", {})
            section_id = meta.get("section_id", "unknown")
            text = getattr(chunk, "text", "")
            lines.append(f"[Section ID: {section_id}]\n{text}\n")
        return "\n---\n".join(lines)

    # -----------------------------------------------------------------
    # Public API
    # -----------------------------------------------------------------
    def generate(
        self,
        query: str,
        retrieved_chunks: List[Tuple[Any, float]],
    ) -> Dict[str, Any]:
        """
        Generate an answer based solely on the retrieved chunks.

        Args:
            query: User question.
            retrieved_chunks: List of (chunk, score) from retrieval/reranking.

        Returns:
            Dictionary with keys:
                - "answer": The generated answer string.
                - "citations": List of unique section IDs cited in the answer.
        """
        if not retrieved_chunks:
            return {
                "answer": "Not found in the provided documents.",
                "citations": [],
            }

        context = self._format_context(retrieved_chunks)

        prompt = f"""You are an expert assistant for disaster management guidelines. Your task is to answer the user's question using ONLY the provided context. Follow these rules strictly:

1. Answer only from the provided context. Do not add any information that is not present in the context.
2. Do NOT invent facts, phone numbers, laws, or any other details.
3. If the context does not contain enough information to answer the question, respond exactly with:
   "Not found in the provided documents."
4. When you include information from the context, you MUST cite the corresponding Section ID(s) in square brackets, e.g., [FLOOD-2].
5. Provide a concise answer that directly addresses the question.
6. List all cited Section IDs at the end of the answer under a "Citations:" line, each ID separated by a comma.

Context:
{context}

Question: {query}

Answer:
"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                temperature=0.1,
                max_tokens=1024,
                top_p=0.9,
                stream=False,
            )

            response_text = getattr(chat_completion.choices[0].message, "content", "").strip()

            # Default fallback if model refuses or returns empty
            if not response_text or "not found" in response_text.lower():
                answer_text = "Not found in the provided documents."
                citations: List[str] = []
            else:
                # Extract citation tags like [SECTION-ID]
                citations = sorted(set(re.findall(r"\[([^\]]+)\]", response_text)))
                answer_text = response_text.strip()

            return {"answer": answer_text, "citations": citations}

        except Exception:
            # Surface real failures instead of silently masking them as a refusal.
            # Logging with logger.exception() records the real exception along with
            # its traceback so it is preserved for diagnosis.
            logger.exception(
                "Groq generation failed unexpectedly. Real exception and traceback "
                "above; propagating to caller rather than converting to a refusal."
            )
            raise


# Keep the same interface for backward compatibility
def embed_and_index(chunks: List[Any], model_name: str = "BAAI/bge-small-en-v1.5", batch_size: int = 32):
    """Placeholder for backward compatibility - not used in this module."""
    raise NotImplementedError("This function is not available in the Groq generator module.")


if __name__ == "__main__":  # pragma: no cover
    # Simple sanity test (requires API key)
    import sys

    if len(sys.argv) < 2:
        print("Usage: python gemini.py <question>")
        sys.exit(1)
    question = " ".join(sys.argv[1:])

    # Dummy chunks for demonstration – replace with real retrieval in practice
    class DummyChunk:
        def __init__(self, text: str, section_id: str):
            self.text = text
            self.metadata = {"section_id": section_id}

    dummy_chunks = [
        (DummyChunk("Before monsoon, clean storm drains and check embankments.", "FLOOD-2"), 0.9),
        (DummyChunk("Evacuate when water level exceeds the danger mark.", "FLOOD-3"), 0.8),
    ]

    gen = GeminiGenerator()
    result = gen.generate(question, dummy_chunks)
    print("Answer:", result["answer"])
    print("Citations:", result["citations"])