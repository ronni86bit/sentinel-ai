"""
Markdown document loader.
"""

import re
from pathlib import Path
from typing import Any

from .base_loader import BaseLoader
from .document import Document


class MarkdownLoader(BaseLoader):
    """Loader for Markdown (.md) files."""

    def load(self, file_path: str) -> Document:
        """Load a Markdown file.

        Args:
            file_path: Path to the Markdown file.

        Returns:
            Document object with title extracted from first heading if available.
        """
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")

        # Read the file content
        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            # Fallback to default encoding if UTF-8 fails
            content = path.read_text(encoding="latin-1")

        # Extract filename and title candidate
        filename, title_candidate = self._get_file_metadata(str(path))

        # Try to extract title from first heading (e.g., "# Title")
        title = title_candidate  # Default to filename without extension
        match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
        if match:
            title = match.group(1).strip()

        return Document(
            name=filename,
            title=title,
            source_path=str(path.absolute()),
            content=content,
        )