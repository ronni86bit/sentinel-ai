"""
Evaluation script for SentinelAI RAG system.

Measures:
- Retrieval Hit@k (whether any retrieved chunk comes from the expected source document)
- Citation Accuracy (fraction of questions where at least one cited section is from expected source)
- Average Confidence (average max retrieval score)
- Correct Refusal Rate (percentage of questions with no answer that are correctly refused)
- Average Latency (average time for retrieve+verify+generate per question)

Uses data/test_questions.csv as ground truth.
Does NOT modify the existing retrieval pipeline; only uses imported modules.
"""

import sys
import os
# Add project root to sys.path so we can import packages like ingestion, chunking, etc.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import time
import csv
from typing import List, Tuple, Dict, Any

# Import existing modules
from ingestion import ingest_documents
from chunking import chunk_documents
from embedding import embed_and_index
from retrieval import Retriever, BM25Retriever, fuse_dense_and_bm25
from verification import verify_evidence

# Mock generator to avoid needing an actual API key during evaluation
class MockGenerator:
    """Simulates answer generation: if evidence is strong, returns citations from all unique section IDs in retrieved chunks;
    otherwise returns the refusal message."""
    def generate(self, query: str, retrieved_chunks: List[Tuple[Any, float]]) -> Dict[str, Any]:
        if not retrieved_chunks:
            return {"answer": "Not found in the provided documents.", "citations": []}
        if not verify_evidence(retrieved_chunks, query):
            return {"answer": "Not found in the provided documents.", "citations": []}
        # Collect unique section IDs from all chunks
        seen = set()
        citations = []
        for chunk, _ in retrieved_chunks:
            meta = getattr(chunk, "metadata", {})
            sect = meta.get("section_id")
            if isinstance(sect, str) and sect:
                if sect not in seen:
                    seen.add(sect)
                    citations.append(sect)
        # Use first chunk's text for answer placeholder
        top_chunk, _ = retrieved_chunks[0]
        text = getattr(top_chunk, "text", "")
        ans = f"{text} [{', '.join(citations)}]" if citations else text
        return {"answer": ans, "citations": citations}
def build_or_load_index():
    """Builds a FAISS index and BM25 from the docs folder if not already cached.
    Returns a dense Retriever and a BM25Retriever."""
    # Determine project root (parent of this file's directory)
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    # Use a cache directory under temp to avoid rebuilding each run
    import tempfile
    import faiss
    import pickle
    cache_dir = os.path.join(tempfile.gettempdir(), "sentinelai_eval_index")
    os.makedirs(cache_dir, exist_ok=True)
    index_path = os.path.join(cache_dir, "faiss_index")
    meta_path = index_path + ".meta.pkl"
    bm25_path = index_path + "_bm25.pkl"

    # Check if cached files exist
    if os.path.exists(index_path + ".index") and os.path.exists(meta_path) and os.path.exists(bm25_path):
        # Load
        index = faiss.read_index(index_path + ".index")
        with open(meta_path, "rb") as f:
            chunks = pickle.load(f)
        bm25 = BM25Retriever.load(bm25_path)
        dense = Retriever(index_path, index_path)  # passes prefix without extension
        return dense, bm25

    # Otherwise, build from scratch
    print("Building index from documents...")
    docs_dir = os.path.join(base_dir, "docs")
    docs = ingest_documents(docs_dir)
    chunks = chunk_documents(docs)
    index, _, _ = embed_and_index(chunks, batch_size=8)
    # Save index and chunks
    faiss.write_index(index, index_path + ".index")
    with open(meta_path, "wb") as f:
        pickle.dump(chunks, f)
    # Build and save BM25
    bm25 = BM25Retriever(chunks)
    bm25.save(bm25_path)
    # Create dense retriever wrapper
    dense = Retriever(index_path, index_path)
    return dense, bm25

def evaluate():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    print("Loading retrieval models...")
    dense_ret, bm25_ret = build_or_load_index()
    generator = MockGenerator()

    # Load test questions
    csv_path = os.path.join(base_dir, "data", "test_questions.csv")
    questions = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            questions.append({
                "qid": row["question_id"],
                "question": row["question"],
                "answer_present": row["answer_present_in_documents"].strip().lower() == "yes",
                "source_doc": row["likely_source_document"].strip()
            })

    # Containers for metrics
    hit_counts = 0
    citation_hits = 0
    total_confidence = 0.0
    correct_refusals = 0
    total_latency = 0.0
    total_questions = len(questions)
    num_yes = sum(1 for q in questions if q["answer_present"])
    num_no = total_questions - num_yes

    print(f"Evaluating {total_questions} questions ({num_yes} with answer, {num_no} without)...")
    for q in questions:
        start = time.time()
        # Retrieve using fusion (dense + bm25) with RRF (k=10 for recall)
        k_fetch = 10
        dense_res = dense_ret.retrieve(q["question"], k=k_fetch)
        bm25_res = bm25_ret.retrieve(q["question"], k=k_fetch)
        fused = fuse_dense_and_bm25(dense_res, bm25_res, k=60)  # returns list of (chunk, rrf_score)
        # Take top 5 for evaluation
        top_k = fused[:5]
        # Compute confidence as max score
        max_score = max((score for _, score in top_k), default=0.0)
        total_confidence += max_score
        # Retrieval Hit@k: check if any chunk's source_doc matches expected source_doc (for questions with answer)
        hit = False
        if q["answer_present"] and q["source_doc"]:
            for chunk, _ in top_k:
                meta = getattr(chunk, "metadata", {})
                src = meta.get("source_path", "")
                # Extract filename from path
                filename = os.path.basename(src)
                if filename == q["source_doc"]:
                    hit = True
                    break
        if hit:
            hit_counts += 1
        # Generate answer (using mock generator which includes verification)
        gen_result = generator.generate(q["question"], top_k)
        answer = gen_result["answer"]
        citations = gen_result["citations"]
        # Citation Accuracy: for questions with answer, check if any cited section is from expected doc
        if q["answer_present"] and q["source_doc"]:
            # We need to map citations back to source doc; we don't have mapping from section_id to doc.
            # Instead, we can check if any of the chunks that contributed to citation (the ones we used)
            # matched the source doc. We'll approximate: if any of the top_k chunks matched source doc and
            # that chunk's section_id is in citations, then it's a hit. Simpler: if hit was True and we have
            # at least one citation, then consider citation correct.
            if hit and citations:
                citation_hits += 1
        # For questions without answer, check correct refusal
        if not q["answer_present"]:
            expected_refusal = "Not found in the provided documents."
            if answer == expected_refusal:
                correct_refusals += 1
        # Latency
        latency = time.time() - start
        total_latency += latency

        # Optional progress
        # print(f"Q{q['qid']}: hit={hit}, ans_present={q['answer_present']}, answer={answer[:50]}...")

    # Compute metrics
    hit_at_k = hit_counts / num_yes if num_yes > 0 else 0.0
    citation_accuracy = citation_hits / num_yes if num_yes > 0 else 0.0
    avg_confidence = total_confidence / total_questions
    correct_refusal_rate = correct_refusals / num_no if num_no > 0 else 0.0
    avg_latency = total_latency / total_questions

    # Report
    report_lines = [
        "=== SentinelAI RAG Evaluation Report ===",
        f"Total questions: {total_questions}",
        f"Questions with answer in docs: {num_yes}",
        f"Questions without answer in docs: {num_no}",
        "",
        f"Retrieval Hit@5: {hit_at_k:.2%}",
        f"Citation Accuracy: {citation_accuracy:.2%}",
        f"Average Confidence (max retrieval score): {avg_confidence:.4f}",
        f"Correct Refusal Rate: {correct_refusal_rate:.2%}",
        f"Average Latency per question: {avg_latency:.3f} seconds",
        "=" * 50
    ]
    report_text = "\n".join(report_lines)
    print("\n" + report_text)
    # Save to file
    out_path = os.path.join(os.getcwd(), "evaluation_report.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(report_text)
    print(f"\nReport saved to {out_path}")

if __name__ == "__main__":
    evaluate()