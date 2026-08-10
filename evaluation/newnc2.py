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