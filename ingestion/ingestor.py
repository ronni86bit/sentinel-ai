"""
Document ingestor for the SentinelAI RAG system.
"""

import logging
from pathlib import Path
from typing import List, Dict, Type

from .document import Document
from .base_loader import BaseLoader
from .csv_loader import CSVLoader
from .excel_loader import ExcelLoader
from .markdown_loader import MarkdownLoader
from .pdf_loader import PDFLoader

logger = logging.getLogger(__name__)


# Mapping of file extensions to loader classes
LOADER_MAPPING: Dict[str, Type[BaseLoader]] = {
    ".csv": CSVLoader,
    ".xls": ExcelLoader,
    ".xlsx": ExcelLoader,
    ".md": MarkdownLoader,
    ".pdf": PDFLoader,
}


def ingest_documents(directory: str) -> List[Document]:
    """Ingest all supported documents from a directory.

    Args:
        directory: Path to the directory containing documents to ingest.

    Returns:
        List of Document objects, one for each successfully ingested file.
    """
    dir_path = Path(directory)
    if not dir_path.is_dir():
        raise NotADirectoryError(f"Directory not found: {directory}")

    documents: List[Document] = []
    supported_extensions = set(LOADER_MAPPING.keys())

    for file_path in dir_path.rglob("*"):
        if file_path.is_file():
            suffix = file_path.suffix.lower()
            if suffix in supported_extensions:
                loader_class = LOADER_MAPPING[suffix]
                try:
                    loader = loader_class()
                    doc = loader.load(str(file_path))
                    documents.append(doc)
                    logger.debug(f"Ingested: {file_path}")
                except Exception as e:
                    logger.warning(f"Failed to load {file_path}: {e}")
            else:
                logger.debug(f"Skipping unsupported file: {file_path}")

    logger.info(f"Ingested {len(documents)} documents from {directory}")
    return documents