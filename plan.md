# Disaster RAG Assistant - Implementation Plan

## Context
This project aims to build a Retrieval-Augmented Generation (RAG) assistant that answers questions using only the disaster management guideline documents in the `docs/` folder. The system must cite document and section IDs, avoid hallucination, and provide verifiable answers.

## Requirements
- Answer questions using ONLY provided documents
- Cite document and section IDs (e.g., FLOOD-3)
- Return "Not found in the provided documents." when answer not in documents
- Avoid hallucinating phone numbers, compensation amounts, vendors, or laws
- Provide working notebook or simple app
- Include 10-20 sample answers
- Explain retrieval method and hallucination-control strategy
- Perform error analysis

## Exploration Findings
- No existing code - only data and documentation files
- 6 markdown documents in `docs/` folder, each with:
  - Title and Document ID on first 2 lines
  - Sections marked with `## SECTION-ID` format
  - Content following each section header
- 20 test questions in `data/test_questions.csv` (some answerable, some not)
- Document structure is consistent and predictable

## Implementation Approach
I will create a Python-based RAG system with the following components:

### 1. Document Parser (`document_parser.py`)
- Parse markdown documents to extract:
  - Document ID (from line 2: "Document ID: XXX")
  - Title (from line 1: "# Title")
  - Sections: each `## SECTION-ID` header with corresponding content
- Return structured data: `{doc_id: {title: str, sections: {section_id: content}}}`

### 2. Indexer (`indexer.py`)
- Create searchable index of all sections
- Use TF-IDF vectorization (from scikit-learn) for efficient retrieval
- Store section metadata (doc_id, section_id, content) alongside vectors

### 3. Retriever (`retriever.py`)
- Given a query, transform to TF-IDF vector
- Compute cosine similarity with all section vectors
- Return top-k most similar sections with their metadata

### 4. Answer Generator (`answer_generator.py`)
- Combine content from retrieved sections
- Generate answer using extractive approach (combine relevant sentences)
- Add citations in format: `[DOC-ID:SECTION-ID]`
- Ensure answer only contains information from retrieved sections

### 5. Hallucination Checker (`hallucination_checker.py`)
- Check for prohibited content patterns:
  - Phone numbers (regex: `\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}` or similar)
  - Compensation amounts (currency patterns: `$\d+`, `₹\d+`, etc.)
  - Vendor names (proper nouns that aren't in source text)
  - Legal references (acts, sections, regulations not in source)
- Verify all claims in answer are supported by source text
- Return filtered/safe answer or "Not found in the provided documents."

### 6. Main RAG Pipeline (`rag_assistant.py`)
- Orchestrates the full flow:
  1. Load and index documents
  2. For each query:
     - Retrieve relevant sections
     - Generate candidate answer
     - Check for hallucinations/prohibited content
     - Return final answer or "Not found" message

### 7. Interface Options (choose one):
**Option A: Jupyter Notebook** (`disaster_rag.ipynb`)
- Interactive interface for asking questions
- Displays answers with citations
- Includes sample questions from test set
- Shows retrieval process and sources

**Option B: Simple CLI/Script** (`disaster_rag.py`)
- Command-line interface
- Batch processing of test questions
- Simple question-answer loop

## Files to Create
1. `document_parser.py` - Parse markdown documents
2. `indexer.py` - Build searchable index
3. `retriever.py` - Retrieve relevant sections
4. `answer_generator.py` - Generate cited answers
5. `hallucination_checker.py` - Prevent hallucination
6. `rag_assistant.py` - Main pipeline (OR)
7. `disaster_rag.ipynb` - Jupyter notebook interface
8. `README.md` - Documentation (expanded from existing)
9. `requirements.txt` - Dependencies

## Dependencies
- scikit-learn (for TF-IDF)
- pandas (for handling CSV test questions)
- numpy (for numerical operations)
- optionally: sentence-transformers (if upgrading to semantic search)

## Implementation Plan
1. First, implement document parser to verify we can extract all sections correctly
2. Build indexer and test retrieval with sample queries
3. Implement answer generator with citation logic
4. Add hallucination checking for prohibited content
5. Create main pipeline and test with known questions from test set
6. Build interface (Jupyter notebook preferred for visibility)
7. Run evaluation on all 20 test questions
8. Document failure cases and potential improvements

## Verification Strategy
- Test with questions from `test_questions.csv` that have known answers
- Verify citations point to correct document and section
- Confirm unanswerable questions return "Not found in the provided documents."
- Check that no hallucinated phone numbers, compensation, vendors, or laws appear
- Manual inspection of answers for completeness and accuracy

## Notes on Simplicity
Given the small corpus size (6 documents), TF-IDF should be sufficient for retrieval. This keeps the system simple, transparent, and easy to maintain. If performance proves inadequate, we can upgrade to semantic search later.