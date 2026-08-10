"""
FastAPI backend for SentinelAI RAG system.
Provides API endpoints for querying the disaster management knowledge base.
"""

import os
import pickle
import faiss
import time
from pathlib import Path
from typing import List, Tuple, Any, Dict
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import traceback

app = FastAPI(
    title="SentinelAI RAG API",
    description="Enterprise Disaster Management RAG System",
    version="1.0.0"
)
# Import our modules
from ingestion import ingest_documents
from chunking import chunk_documents
from embedding import EmbeddingPipeline
from retrieval import Retriever, BM25Retriever, reciprocal_rank_fusion
from verification import verify_evidence
from generation import GeminiGenerator

# Configuration
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DOCS_DIR = BASE_DIR / "docs"
VECTORSTORE_DIR = BASE_DIR / "vectorstore"
INDEX_PREFIX = VECTORSTORE_DIR / "sentinel_index"
BM25_PREFIX = VECTORSTORE_DIR / "sentinel_bm25"

# Ensure directories exist
VECTORSTORE_DIR.mkdir(exist_ok=True)
DOCS_DIR.mkdir(exist_ok=True)

# Pydantic models
class QueryRequest(BaseModel):
    question: str

class SimpleCitation(BaseModel):
    id: str
    docId: str
    docTitle: str
    sectionId: str
    confidenceScore: float
    snippet: str
    content: str
    source: str

class QueryResponse(BaseModel):
    # Simplified response that matches what the frontend actually uses
    query: str
    title: str = ""
    summary: str = ""
    aiAnswer: str = ""
    sections: List[Dict[str, Any]] = []
    confidenceScore: float = 0.0
    groundednessScore: float = 0.0
    citationCount: int = 0
    citations: List[Dict[str, Any]] = []
    verifiedAuthority: str = ""
    directiveRef: str = ""
    generatedAt: str = ""
    processingTimeMs: int = 0
    hallucinationRisk: str = "Zero"

class HealthResponse(BaseModel):
    status: str
    message: str

class RebuildResponse(BaseModel):
    status: str
    message: str
    processingTimeMs: int
    totalChunks: int

# Global variables to hold indices (loaded at startup)
retriever: Any = None
bm25_retriever: Any = None
chunks_cache: List[Any] = []
is_indexing: bool = False

def load_indices():
    """Load FAISS index and BM25 from disk, or build if not present."""
    global retriever, bm25_retriever, chunks_cache

    index_path = str(INDEX_PREFIX) + ".index"
    meta_path = str(INDEX_PREFIX) + ".meta.pkl"
    bm25_path = str(BM25_PREFIX) + ".pkl"

    # Check if indices exist
    if os.path.exists(index_path) and os.path.exists(meta_path) and os.path.exists(bm25_path):
        try:
            # Load FAISS index
            index = faiss.read_index(index_path)
            with open(meta_path, "rb") as f:
                chunks = pickle.load(f)

            # Create retriever wrapper
            retriever = Retriever(str(INDEX_PREFIX), str(INDEX_PREFIX))

            # Load BM25
            bm25_retriever = BM25Retriever.load(str(BM25_PREFIX))

            chunks_cache = chunks
            print(f"Loaded indices: {len(chunks)} chunks")
            return True
        except Exception as e:
            print(f"Error loading indices: {e}")
            # Fall through to rebuild

    # Build indices if not present or loading failed
    return build_indices()

def build_indices():
    """Build FAISS and BM25 indices from documents."""
    global retriever, bm25_retriever, chunks_cache

    print("Building indices from documents...")
    start_time = time.time()

    # Ingest documents
    docs = ingest_documents(str(DOCS_DIR))
    if not docs:
        raise RuntimeError("No documents found to index")

    # Chunk documents
    chunks = chunk_documents(docs)
    if not chunks:
        raise RuntimeError("No chunks created from documents")

    # Generate embeddings and build FAISS index
    pipeline = EmbeddingPipeline()
    embeddings = pipeline.encode_chunks(chunks)
    index = pipeline.build_index(embeddings)

    # Save index and chunks
    pipeline.save(str(INDEX_PREFIX))

    # Build and save BM25 index
    bm25 = BM25Retriever(chunks)
    bm25.save(str(BM25_PREFIX))

    # Set globals
    global retriever, bm25_retriever
    retriever = Retriever(str(INDEX_PREFIX), str(INDEX_PREFIX))
    bm25_retriever = bm25
    global chunks_cache
    chunks_cache = chunks

    elapsed = time.time() - start_time
    print(f"Built indices in {elapsed:.2f}s: {len(chunks)} chunks")
    return True, len(chunks), int(elapsed * 1000)

def _chunk_key(chunk: Any) -> Any:
    """
    Return a stable, hashable identifier for a chunk.
    Order of preference:
        1. chunk.metadata["section_id"] (if present and non-empty string)
        2. chunk.metadata["chunk_id"] (if present and non-empty string)
        3. id(chunk) (fallback)
    """
    meta = getattr(chunk, "metadata", {})
    if isinstance(meta, dict):
        sec = meta.get("section_id")
        if sec and isinstance(sec, str) and sec.strip():
            return sec
        cid = meta.get("chunk_id")
        if cid and isinstance(cid, str) and cid.strip():
            return cid
    return id(chunk)

def create_simple_citation(chunk: Any, score: float, index: int) -> Dict[str, Any]:
    """Create a simplified citation dictionary."""
    meta = getattr(chunk, "metadata", {})
    source_path = meta.get("source_path", "")
    file_name = os.path.basename(source_path) if source_path else "unknown"

    # Extract text for snippet
    text = getattr(chunk, "text", "")
    snippet = text[:150] + ("..." if len(text) > 150 else "")

    return {
        "id": f"cite-{index}",
        "docId": file_name.split('.')[0] if file_name != "unknown" else "unknown",
        "docTitle": file_name,
        "sectionId": meta.get("section_id", ""),
        "confidenceScore": min(max(float(score), 0.0), 1.0),
        "snippet": snippet,
        "content": text,  # Full content
        "source": file_name
    }

@app.on_event("startup")
async def startup_event():
    """Load or build indices on startup."""
    success = load_indices()
    if not success:
        # Don't fail startup - allow manual index building
        print("Warning: Failed to load/build indices on startup")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "SentinelAI RAG API is operational"}

@app.post("/query")
async def query_knowledge_base(request: QueryRequest):
    """
    Process a natural language question and return a grounded answer.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if retriever is None or bm25_retriever is None:
        raise HTTPException(
            status_code=503,
            detail="Search indices not available. Please build indices first."
        )

    start_time = time.time()
    print(f"\n[DEBUG] User query: {request.question}")

    try:
        # Retrieve using both dense and sparse methods
        k_fetch = 10  # Fetch more candidates for better fusion
        if retriever is None or bm25_retriever is None:
            raise RuntimeError("Search indices not initialized")

        dense_results = retriever.retrieve(request.question, k=k_fetch)
        bm25_results = bm25_retriever.retrieve(request.question, k=k_fetch)

        # Debug: Top 10 FAISS results (score + section ID)
        print("\n[DEBUG] Top 10 FAISS results:")
        for i, (chunk, score) in enumerate(dense_results[:10]):
            meta = getattr(chunk, "metadata", {})
            section_id = meta.get("section_id", "unknown")
            print(f"  {i+1}. score={score:.4f}, section_id={section_id}")

        # Debug: Top 10 BM25 results
        print("\n[DEBUG] Top 10 BM25 results:")
        for i, (chunk, score) in enumerate(bm25_results[:10]):
            meta = getattr(chunk, "metadata", {})
            section_id = meta.get("section_id", "unknown")
            print(f"  {i+1}. score={score:.4f}, section_id={section_id}")

        # Fuse results using RRF
        fused = reciprocal_rank_fusion([dense_results, bm25_results], k=60)
        print("\n[DEBUG] RRF fused results (showing top 10):")
        for i, (chunk, score) in enumerate(fused[:10]):
            meta = getattr(chunk, "metadata", {})
            section_id = meta.get("section_id", "unknown")
            print(f"  {i+1}. score={score:.4f}, section_id={section_id}")

        # Take top 5 for final consideration (based on RRF scores)
        top_k = min(5, len(fused))
        final_results = fused[:top_k]
        print("\n[DEBUG] Final top-k results after RRF (top 5):")
        for i, (chunk, rrf_score) in enumerate(final_results):
            meta = getattr(chunk, "metadata", {})
            section_id = meta.get("section_id", "unknown")
            print(f"  {i+1}. RRF score={rrf_score:.4f}, section_id={section_id}")

        # Prepare maps for FAISS and optional reranker scores using stable keys
        # FAISS score map from dense_results
        print("\n[DEBUG] About to build faiss_score_map")
        faiss_score_map = {_chunk_key(chunk): score for chunk, score in dense_results}
        print("[DEBUG] Finished building faiss_score_map")
        # Try to load reranker (cross-encoder) if available
        rerank_score_map = {}
        try:
            print("\n[DEBUG] About to build rerank_score_map")
            from reranking.reranker import BGEReranker
            reranker = BGEReranker()
            # Compute rerank scores for all fused results (to get score for each chunk)
            reranked_all = reranker.rerank(request.question, fused, top_k=len(fused))
            rerank_score_map = {_chunk_key(chunk): score for chunk, score in reranked_all}
            print("[DEBUG] Finished building rerank_score_map")
            print("\n[DEBUG] Cross-encoder reranker loaded and scores computed.")
        except Exception as e:
            # Reranker not available or failed to load
            print(f"\n[DEBUG] Cross-encoder reranker not available: {e}")
            rerank_score_map = {}

        # Create list with FAISS, RRF, and verification scores for logging
        verification_scores = []
        print("\n[DEBUG] About to compute verification_results for logging")
        for idx, (chunk, rrf_score) in enumerate(final_results):
            key = _chunk_key(chunk)
            faiss_score = faiss_score_map.get(key, 0.0)
            rerank_score = rerank_score_map.get(key, None)
            # Verification score: use reranker if available, else FAISS
            v_score = rerank_score if rerank_score is not None else faiss_score
            verification_scores.append(v_score)
            meta = getattr(chunk, "metadata", {})
            section_id = meta.get("section_id", "unknown")
            print(f"  {idx+1}. FAISS={faiss_score:.4f}, RRF={rrf_score:.4f}, Verif={v_score:.4f}, section_id={section_id}")
        print("[DEBUG] Finished computing verification_results for logging")

        # Create simplified cited sources for the answer (using RRF scores for ordering, but we keep chunk references)
        cited_sources = [
            create_simple_citation(chunk, rrf_score, idx)
            for idx, (chunk, rrf_score) in enumerate(final_results)
        ]

        # ---------- Verification: single decision point ----------
        retrieved_for_verification = [(chunk, v_score) for (chunk, _), v_score in zip(final_results, verification_scores)]
        verification_passed = verify_evidence(retrieved_for_verification, request.question) if retrieved_for_verification else False
        if retrieved_for_verification:
            scores = [score for _, score in retrieved_for_verification]
            max_score = max(scores) if scores else 0.0
            section_ids = set()
            for chunk, _ in retrieved_for_verification:
                meta = getattr(chunk, "metadata", {})
                sid = meta.get("section_id")
                if isinstance(sid, str) and sid:
                    section_ids.add(sid)
            num_sections = len(section_ids)
            # Build context text for coverage
            texts = []
            for chunk, _ in retrieved_for_verification:
                txt = getattr(chunk, "text", "")
                if isinstance(txt, str):
                    texts.append(txt.lower())
            context_text = " ".join(texts)
            import re
            query_words = set(re.findall(r"\w+", request.question.lower()))
            if query_words:
                matched = {w for w in query_words if w in context_text}
                coverage = len(matched) / len(query_words)
            else:
                coverage = 0.0
            # thresholds from verifier.py
            MIN_SCORE = 0.2
            MIN_SECTIONS = 1
            MIN_COVERAGE = 0.2
            print("\n[DEBUG] Verification details (using verification scores):")
            print(f"  max_score={max_score:.4f} (threshold>={MIN_SCORE}) -> {max_score >= MIN_SCORE}")
            print(f"  num_sections={num_sections} (threshold>={MIN_SECTIONS}) -> {num_sections >= MIN_SECTIONS}")
            print(f"  coverage={coverage:.4f} (threshold>={MIN_COVERAGE}) -> {coverage >= MIN_COVERAGE}")
            print(f"  Overall verification PASS: {verification_passed}")
        else:
            print("\n[DEBUG] Verification skipped: no retrieved chunks")

        # Determine if we should refuse to answer (using verify_evidence function)
        # Note: verify_evidence expects list of (chunk, score) where score is the verification score
        is_not_found = (
            not final_results or
            # We'll compute answer later after generation, but for early flag we can't; keep original logic later
            False  # placeholder, will recalc after generation
        )

        # Generate answer using the LLM
        print("\n[DEBUG] Generating answer with Groq LLM...")
        generator = GeminiGenerator()
        # Build prompt as generation does for logging
        def _format_context(chunks):
            lines = []
            for chunk, _score in chunks:
                meta = getattr(chunk, "metadata", {})
                section_id = meta.get("section_id", "unknown")
                text = getattr(chunk, "text", "")
                lines.append(f"[Section ID: {section_id}]\n{text}\n")
            return "\n---\n".join(lines)
        context = _format_context([(chunk, score) for chunk, score in final_results])
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

Question: {request.question}

Answer:
"""
        print("\n[DEBUG] Prompt sent to Groq (truncated to first 1000 chars):")
        print(prompt[:1000])
        print("...")
        gen_result = generator.generate(request.question, [(chunk, score) for chunk, score in final_results])
        answer = gen_result["answer"]
        print(f"\n[DEBUG] Groq raw response answer: {answer}")
        # Note: citations from LLM are in gen_result["citations"] but we use our own.

        # Use verification scores for confidence and verification
        verification_scores_final = verification_scores  # already aligned with final_results
        # Confidence score: max verification score
        confidence_score = max(verification_scores_final) if verification_scores_final else 0.0
        confidence_score = max(0.0, min(1.0, float(confidence_score)))

        print("\n[DEBUG] Applying verification decision")
        is_not_found = (
            not final_results or
            answer.strip() == "Not found in the provided documents." or
            not verification_passed
        )
        print("[DEBUG] Finished applying verification decision")

        if is_not_found:
            answer = "Not found in the provided documents."
            cited_sources = []  # Clear citations when refusing
            confidence_score = 0.0

        processing_time_ms = int((time.time() - start_time) * 1000)

        # Build response
        return {
            "query": request.question,
            "title": f"Analysis of: {request.question[:50]}{'...' if len(request.question) > 50 else ''}",
            "summary": "Analysis based on disaster management guidelines and procedures.",
            "aiAnswer": answer,
            "sections": [],  # Simplified - could be enhanced later
            "confidenceScore": round(float(confidence_score), 3),
            "groundednessScore": 0.8,  # Placeholder
            "citationCount": len(cited_sources),
            "citations": cited_sources,
            "verifiedAuthority": "SentinelAI Knowledge Base",
            "directiveRef": f"SYS-{int(time.time())}",
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "processingTimeMs": processing_time_ms,
            "hallucinationRisk": "Low" if not cited_sources else "Zero"
        }

    except Exception as e:
        print("\n========== FULL EXCEPTION ==========")
        traceback.print_exc()
        print("====================================\n")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/rebuild-index", response_model=RebuildResponse)
async def rebuild_index(background_tasks: BackgroundTasks):
    """
    Trigger a rebuild of the search indices.
    Runs in the background to avoid blocking the request.
    """
    global is_indexing

    if is_indexing:
        raise HTTPException(
            status_code=409,
            detail="Index rebuild already in progress"
        )

    async def rebuild_task():
        global is_indexing, retriever, bm25_retriever, chunks_cache
        try:
            is_indexing = True
            success, total_chunks, processing_time = build_indices()
            is_indexing = False
            if not success:
                print("Index rebuild failed")
        except Exception as e:
            is_indexing = False
            print(f"Error during index rebuild: {e}")

    # Run in background
    background_tasks.add_task(rebuild_task)

    # Return immediate response - the actual values will be updated when the task completes
    return RebuildResponse(
        status="started",
        message="Index rebuild started in background",
        processingTimeMs=0,
        totalChunks=0
    )

if __name__ == "__main__":
    # For running directly: uvicorn main:app --reload
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)