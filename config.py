"""
Configuration module for SentinelAI RAG system.
Contains configuration settings for the application.
"""

import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
DOCS_DIR = BASE_DIR / "docs"
VECTORSTORE_DIR = BASE_DIR / "vectorstore"

# Data files
SOURCE_METADATA_CSV = DATA_DIR / "source_metadata.csv"
TEST_QUESTIONS_CSV = DATA_DIR / "test_questions.csv"

# Model settings
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "google/flan-t5-base"  # Using a smaller model for demonstration
MAX_NEW_TOKENS = 256
TEMPERATURE = 0.1
TOP_P = 0.95

# Retrieval settings
TOP_K_RETRIEVE = 5
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

# FAISS index parameters
FAISS_INDEX_TYPE = "IndexFlatIP"  # Inner product for cosine similarity
FAISS_NPROBE = 10  # For IVF indices

# Streamlit settings
PAGE_TITLE = "SentinelAI - Disaster Management RAG Assistant"
PAGE_ICON = "🚨"
LAYOUT = "centered"

# Ensure directories exist
VECTORSTORE_DIR.mkdir(exist_ok=True)