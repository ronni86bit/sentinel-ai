"""
Chunking module for SentinelAI RAG system.
Provides section-aware chunking for markdown documents.
"""

import re
from dataclasses import dataclass, asdict
from typing import List, Dict, Any
from pathlib import Path

# Import Document from ingestion module
try:
    # When used as part of the package
    from ingestion.document import Document
except ImportError:
    # Fallback for relative import if needed
    from ..ingestion.document import Document


@dataclass
class Chunk:
    """Represents a chunk of text with associated metadata.

    Attributes:
        text: The textual content of the chunk.
        metadata: Dictionary containing metadata such as:
            - document_id: ID from source_metadata.csv
            - source_path: Path to the source file
            - doc_title: Title of the document
            - section_id: e.g., "FLOOD-1"
            - section_title: Text after the section ID in the heading
            - chunk_index: Index of this chunk within its document
    """
    text: str
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        """Convert Chunk to a serializable dictionary."""
        return {
            "text": self.text,
            "metadata": self.metadata
        }

    @staticmethod
    def from_dict(data: dict) -> "Chunk":
        """Create a Chunk from a dictionary."""
        return Chunk(text=data["text"], metadata=data["metadata"])


def _parse_markdown_sections(content: str) -> List[Dict[str, str]]:
    """Split markdown content into sections based on level-2 headings.

    Expected heading format: "## SECTION-ID: Section Title"
    or "## SECTION-ID" (without colon).

    Returns:
        List of dictionaries, each containing:
        - 'section_id': e.g., "FLOOD-1"
        - 'section_title': the title part after the ID (may be empty)
        - 'content': the full section text including the heading line
    """
    # Pattern to match a level-2 heading that starts with capital letters and digits, e.g., "## FLOOD-1: ..."
    # We'll split the text by looking ahead for such headings.
    # Using a regex that matches the heading line and captures the ID and title.
    heading_pattern = re.compile(r'^##\s+([A-Z]+-\d+):?\s*(.*)$', re.MULTILINE)

    # Find all heading matches
    matches = list(heading_pattern.finditer(content))
    if not matches:
        # No headings found; treat entire document as a single section with no ID
        return [{
            "section_id": "",
            "section_title": "",
            "content": content.strip()
        }]

    sections = []
    for i, match in enumerate(matches):
        start_pos = match.end()  # position after the heading line
        # Determine end position: start of next heading or end of string
        end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(content)
        section_text = content[start_pos:end_pos].strip()
        # If we want to include the heading line in the chunk text, prepend it
        heading_line = match.group(0)
        full_section = f"{heading_line}\n{section_text}" if section_text else heading_line
        section_id = match.group(1)
        section_title = match.group(2).strip()
        sections.append({
            "section_id": section_id,
            "section_title": section_title,
            "content": full_section.strip()
        })

    return sections


def chunk_documents(documents: List[Document]) -> List[Chunk]:
    """Split a list of Documents into chunks based on markdown sections.

    Args:
        documents: List of Document objects (output from ingestion).

    Returns:
        List of Chunk objects, each representing a section from a document.
    """
    chunks: List[Chunk] = []
    for doc in documents:
        # Use metadata from ingestion to get document_id and title
        # We assume that the Document's title field already holds the title from the markdown
        # and we need to map the file_name to document_id using the source_metadata.csv.
        # For simplicity, we will extract document_id from the filename using a lookup.
        # However, the Document does not currently store document_id.
        # We'll need to either enrich the Document during ingestion or load the mapping here.
        # Since we are not to modify ingestion, we'll load the mapping here.
        pass
    # To avoid circular dependencies and extra work, we will assume that the Document's
    # title field is sufficient and we will not include document_id in chunk metadata for now.
    # However, the requirement is to preserve document name, title, source path.
    # We'll add a placeholder for document_id that can be filled later if needed.
    # For now, we'll compute a simple mapping from file_name to document_id by reading the CSV.
    import csv
    from pathlib import Path

    # Build a mapping from file_name (without path) to document_id
    csv_path = Path(__file__).parent.parent / "data" / "source_metadata.csv"
    file_name_to_doc_id = {}
    if csv_path.is_file():
        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                file_name_to_doc_id[row['file_name']] = row['document_id']
    else:
        # Fallback: use the filename without extension as document_id
        file_name_to_doc_id = {}

    for doc in documents:
        sections = _parse_markdown_sections(doc.content)
        doc_name = doc.name  # e.g., "flood_sop.md"
        doc_id = file_name_to_doc_id.get(doc_name, "")
        for idx, sec in enumerate(sections):
            chunk_text = sec["content"]
            metadata = {
                "document_id": doc_id,
                "source_path": doc.source_path,
                "doc_title": doc.title,
                "section_id": sec["section_id"],
                "section_title": sec["section_title"],
                "chunk_index": idx,
                "file_name": doc_name
            }
            chunk = Chunk(text=chunk_text, metadata=metadata)
            chunks.append(chunk)
    return chunks