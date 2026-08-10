"""
Base loader for document ingestion.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from .document import Document


class BaseLoader(ABC):
    """Abstract base class for document loaders."""

    @abstractmethod
    def load(self, file_path: str) -> Document:
        """Load a single document from a file path.

        Args:
            file_path: Path to the file to load.

        Returns:
            A Document object containing the file's content and metadata.
        """
        pass

    def _get_file_metadata(self, file_path: str) -> tuple[str, str]:
        """Extract filename and title from file path.

        Args:
            file_path: Path to the file.

        Returns:
            Tuple of (filename, title_candidate) where title_candidate is
            the filename without extension (to be overridden by subclasses
            if a better title can be extracted from content).
        """
        path = Path(file_path)
        filename = path.name
        title_candidate = path.stem  # filename without extension
        return filename, title_candidate