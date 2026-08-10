"""
Ingestion package for SentinelAI RAG system.
"""

# This file makes the directory a Python package.
# It can be left empty or used to export public interfaces.
from .ingestor import ingest_documents

__all__ = ["ingest_documents"]