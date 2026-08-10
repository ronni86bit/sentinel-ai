"""
Chunk object definition for the chunking module.
"""

from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class Chunk:
    """Represents a chunk of a document, aware of its section.

    Attributes:
        section_id: The identifier of the section (e.g., 'FLOOD-1').
        title: The title of the section (text after the section ID).
        body: The content of the section.
        source_document: The name of the source file (e.g., 'flood_sop.md').
        metadata: Dictionary of metadata merged from source_metadata.csv and any extra.
    """
    section_id: str
    title: str
    body: str
    source_document: str
    metadata: Dict[str, Any]