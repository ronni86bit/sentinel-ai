# Project 5: RAG Assistant for Disaster Management Guidelines

## Candidate Task
Build a small Retrieval-Augmented Generation assistant that answers questions using only the documents in the `docs/` folder.

## Required Behaviour
- Cite document and section IDs, such as `FLOOD-3`.
- If the answer is not present, say: "Not found in the provided documents."
- Do not hallucinate phone numbers, compensation amounts, vendors, or laws.

## Suggested Output
- Working notebook or simple app
- 10 to 20 sample answers
- Retrieval method explanation
- Hallucination-control strategy
- Error analysis

## Data Files
- `docs/*.md`: synthetic disaster management guidelines
- `data/source_metadata.csv`: metadata
- `data/test_questions.csv`: test questions
