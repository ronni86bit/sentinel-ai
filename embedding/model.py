"""
Wrapper for the BAAI/bge-small-en-v1.5 sentence transformer model.
"""

from typing import List, Union
import numpy as np
import logging

from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class BGESmallEmbedder:
    """
    Wrapper around SentenceTransformer for the BGE-small-en-v1.5 model.
    Provides a simple encode method that returns L2-normalized embeddings.
    """

    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        """
        Initialize the embedding model.

        Args:
            model_name: HuggingFace model identifier. Defaults to "BAAI/bge-small-en-v1.5".
        """
        self.model_name = model_name
        try:
            self.model = SentenceTransformer(model_name)
            logger.info(f"Loaded embedding model: {model_name}")
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            raise

    def encode(
        self,
        sentences: Union[str, List[str]],
        batch_size: int = 32,
        show_progress_bar: bool = False,
        normalize_embeddings: bool = True,
    ) -> np.ndarray:
        """
        Encode a list of sentences into embeddings.

        Args:
            sentences: A single string or list of strings to encode.
            batch_size: Batch size for encoding.
            show_progress_bar: Whether to display a tqdm progress bar.
            normalize_embeddings: If True, L2-normalizes the embeddings (default True).
                                  This makes inner product equivalent to cosine similarity.

        Returns:
            A numpy array of shape (len(sentences), embedding_dim) with dtype float32.
        """
        # Ensure input is a list
        if isinstance(sentences, str):
            sentences = [sentences]

        embeddings = self.model.encode(
            sentences,
            batch_size=batch_size,
            show_progress_bar=show_progress_bar,
            convert_to_numpy=True,
            normalize_embeddings=normalize_embeddings,
        )
        # Ensure float32
        if embeddings.dtype != np.float32:
            embeddings = embeddings.astype(np.float32)
        return embeddings

    @property
    def embedding_dimension(self) -> int:
        """Return the dimensionality of the embeddings."""
        return self.model.get_sentence_embedding_dimension()