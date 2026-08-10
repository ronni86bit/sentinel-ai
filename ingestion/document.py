"""
Document object definition for the ingestion module.
"""

from dataclasses import dataclass
from typing import Any


@dataclass
class Document:
    """Unified document representation.

    Attributes:
        name: The filename (e.g., 'flood_sop.md').
        title: The document title extracted from content (for markdown) or filename.
        source_path: The absolute path to the source file.
        content: The full text content of the document.
    """
    name: str
    title: str
    source_path: str
    content: str