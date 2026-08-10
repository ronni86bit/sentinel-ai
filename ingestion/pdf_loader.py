"""
PDF document loader.
"""

import logging
from pathlib import Path
from typing import Any

from .base_loader import BaseLoader
from .document import Document


class PDFLoader(BaseLoader):
    """Loader for PDF (.pdf) files."""

    def load(self, file_path: str) -> Document:
        """Load a PDF file.

        Args:
            file_path: Path to the PDF file.

        Returns:
            Document object with text content extracted from the PDF.

        Raises:
            ImportError: If PyPDF2 is not installed.
            FileNotFoundError: If the file does not exist.
            Exception: If there is an error reading the PDF file.
        """
        try:
            # Import PyPDF2 inside the method to avoid import-time errors
            from PyPDF2 import PdfReader
        except ImportError as e:
            raise ImportError(
                "PyPDF2 is required to load PDF files. "
                "Install it with: pip install PyPDF2"
            ) from e

        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            reader = PdfReader(path)
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            content = "\n\n".join(text_parts)
        except Exception as e:
            raise Exception(f"Error reading PDF file {file_path}: {e}") from e

        # Extract filename and title candidate
        filename, title_candidate = self._get_file_metadata(str(path))

        # For PDF, we don't have a title in the content, so use the filename without extension
        title = title_candidate

        return Document(
            name=filename,
            title=title,
            source_path=str(path.absolute()),
            content=content,
        )