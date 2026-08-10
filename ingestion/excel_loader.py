"""
Excel document loader.
"""

import logging
from pathlib import Path
from typing import Any

from .base_loader import BaseLoader
from .document import Document


class ExcelLoader(BaseLoader):
    """Loader for Excel (.xls, .xlsx) files."""

    def load(self, file_path: str) -> Document:
        """Load an Excel file.

        Args:
            file_path: Path to the Excel file.

        Returns:
            Document object with the Excel content as a string representation.

        Raises:
            ImportError: If pandas is not installed.
            Exception: If there is an error reading the Excel file.
        """
        try:
            # Import pandas inside the method to avoid import-time errors
            import pandas as pd
        except ImportError as e:
            raise ImportError(
                "Pandas is required to load Excel files. "
                "Install it with: pip install pandas"
            ) from e

        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            # Read the first sheet
            df = pd.read_excel(path)
            # Convert the DataFrame to a string representation
            content = df.to_string(index=False)
        except Exception as e:
            raise Exception(f"Error reading Excel file {file_path}: {e}") from e

        # Extract filename and title candidate
        filename, title_candidate = self._get_file_metadata(str(path))

        # For Excel, we don't have a title in the content, so use the filename without extension
        title = title_candidate

        return Document(
            name=filename,
            title=title,
            source_path=str(path.absolute()),
            content=content,
        )