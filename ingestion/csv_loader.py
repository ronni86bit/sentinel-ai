"""
CSV document loader.
"""

from pathlib import Path
from typing import Any

from .base_loader import BaseLoader
from .document import Document


class CSVLoader(BaseLoader):
    """Loader for CSV (.csv) files."""

    def load(self, file_path: str) -> Document:
        """Load a CSV file.

        Args:
            file_path: Path to the CSV file.

        Returns:
            Document object with the CSV content as text.
        """
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")

        # Read the file content as text
        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            # Fallback to latin-1 if UTF-8 fails
            content = path.read_text(encoding="latin-1")

        # Extract filename and title candidate
        filename, title_candidate = self._get_file_metadata(str(path))

        # For CSV, we don't have a title in the content, so use the filename without extension
        title = title_candidate

        return Document(
            name=filename,
            title=title,
            source_path=str(path.absolute()),
            content=content,
        )