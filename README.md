# SentinelAI

### Grounded Disaster Response Intelligence System

SentinelAI is an end-to-end **Retrieval-Augmented Generation (RAG)** system designed to answer disaster-response questions using a controlled knowledge base of emergency-management documents.

The system combines **dense retrieval, sparse retrieval, hybrid ranking, cross-encoder reranking, evidence verification, and grounded LLM generation** to reduce hallucinations and provide source-backed answers.

When the required information is not present in the knowledge base, SentinelAI follows a **fail-closed** approach and returns:

> `Not found in the provided documents.`

---

## Features

- Hybrid retrieval using **FAISS + BM25**
- Weighted **Reciprocal Rank Fusion (RRF)**
- **BGE cross-encoder reranking**
- Evidence verification before generation
- Section-level citations such as `FLOOD-3`
- Grounded LLM responses through **Groq**
- Hallucination-resistant fail-closed behavior
- FastAPI backend with REST API
- React + Vite frontend
- Live retrieval and pipeline telemetry
- Docker support
- Evaluation suite for retrieval and groundedness

---

## Architecture

```text
                    ┌──────────────────────┐
                    │   React + Vite UI    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     FastAPI API      │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Query Understanding │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       ┌────────────────┐            ┌────────────────┐
       │ Dense Retrieval│            │ Sparse Retrieval│
       │     FAISS      │            │      BM25      │
       └───────┬────────┘            └───────┬────────┘
               │                             │
               └──────────────┬──────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Weighted RRF     │
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │ Cross-Encoder     │
                    │    Reranking      │
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │ Evidence         │
                    │ Verification     │
                    └────────┬─────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
              Evidence                No Evidence
                 │                       │
                 ▼                       ▼
        ┌─────────────────┐      ┌─────────────────────┐
        │ Groq LLM        │      │ Fail-Closed Refusal │
        │ Grounded Answer │      │                     │
        └────────┬────────┘      └─────────────────────┘
                 │
                 ▼
        Answer + Citations
RAG Pipeline
1. Document Ingestion

Documents from the docs/ directory are loaded and prepared for retrieval.

Current knowledge-base documents include disaster-management material covering areas such as:

Flood response
Cyclone preparedness
Heatwave response
Incident response
Relief and shelter management
Risk communication
2. Chunking

Documents are divided into meaningful sections while preserving metadata such as document identity and section IDs.

Example:

FLOOD-2
FLOOD-3
CYC-1

This allows generated answers to reference specific sections instead of only citing an entire document.

3. Dense Retrieval

Semantic retrieval is performed using FAISS and transformer-based embeddings.

This allows the system to retrieve passages based on meaning rather than exact keyword matches.

4. Sparse Retrieval

BM25 is used as a complementary lexical retrieval method.

This helps retrieve passages containing important disaster-specific terms, phrases, and operational terminology.

5. Hybrid Retrieval

Dense and sparse results are combined using Weighted Reciprocal Rank Fusion (RRF).

The hybrid approach improves retrieval robustness by combining semantic similarity with keyword relevance.

6. Reranking

Retrieved candidates are refined using a BGE cross-encoder reranker.

The reranker scores the relevance of each query-document pair and determines the final ordering used for answer generation.

7. Evidence Verification

Before generation, retrieved evidence is checked against verification criteria.

If sufficient supporting evidence is not available, SentinelAI refuses to generate an unsupported answer.

8. Grounded Generation

Only verified retrieved evidence is passed to the LLM.

The final response includes section-level citations where applicable.

Tech Stack
Backend
Python
FastAPI
FAISS
BM25
Sentence Transformers
PyTorch
Groq
Pydantic
Frontend
React
TypeScript
Vite
Tailwind CSS
React Markdown
Lucide React
DevOps
Docker
Docker Compose
Git / GitHub
Project Structure
sentinel-ai/
│
├── docs/                   # Disaster-management knowledge base
├── data/                   # Metadata and evaluation data
├── vectorstore/            # FAISS / BM25 indexes
│
├── ingestion.py            # Document ingestion
├── chunking.py             # Document chunking
├── embedding.py            # Embedding generation
├── retrieval.py            # FAISS + BM25 retrieval and RRF
├── verification.py         # Evidence verification
├── main.py                 # FastAPI application
│
├── evaluation/             # Evaluation scripts and test cases
├── frontend/               # React + Vite frontend
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
Running Locally
Prerequisites

Install:

Python 3.11+
Node.js 18+
Git

A Groq API key is required for LLM generation.

1. Clone the repository
git clone https://github.com/ronni86bit/sentinel-ai.git
cd sentinel-ai
2. Set up the backend

Create a virtual environment:

Windows
python -m venv .venv
.\.venv\Scripts\Activate.ps1
macOS / Linux
python3 -m venv .venv
source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt
pip install fastapi uvicorn

Create a .env file in the project root:

GROQ_API_KEY=your_groq_api_key

Do not commit your .env file.

3. Start the backend

From the project root:

python main.py

The API will be available at:

http://localhost:8000

Health check:

http://localhost:8000/health

Interactive API documentation:

http://localhost:8000/docs
4. Start the frontend

Open a second terminal:

cd frontend
npm install
npm run dev

The frontend will be available at:

http://localhost:3000

The Vite development server proxies /api requests to the FastAPI backend.

Example Queries

Try asking SentinelAI:

What are the recommended evacuation procedures during a flood?
What should authorities do when a flood emergency is declared?

For information outside the knowledge base:

What should people do during an earthquake?

The expected behavior is:

Not found in the provided documents.

This prevents the system from fabricating unsupported disaster-response guidance.

Running with Docker

The repository also includes Docker support.

Make sure your .env file contains:

GROQ_API_KEY=your_groq_api_key

Then run:

docker compose up --build

The backend will be available at:

http://localhost:8000

Health check:

http://localhost:8000/health

Stop the containers with:

docker compose down
API Usage
Health Check
GET /health
Query the Knowledge Base
POST /query
Content-Type: application/json

Example:

{
  "question": "What are the recommended evacuation procedures during a flood?"
}

The response contains the generated answer along with information such as:

Retrieved evidence
Citations
Confidence
Groundedness
Processing time
Retrieval metadata
Reranking information
Evaluation

SentinelAI includes an evaluation suite for measuring RAG performance.

The evaluation workflow is designed to assess areas such as:

Retrieval Hit@K
Context quality
Answer relevance
Groundedness
Citation coverage
Refusal behavior
Response latency

The evaluation data and supporting scripts are available under:

evaluation/
Design Principles
Groundedness over creativity

The model should answer from retrieved evidence rather than relying on general knowledge.

Fail closed

When sufficient evidence is unavailable, the system refuses instead of guessing.

Hybrid retrieval

Semantic and lexical retrieval complement one another, especially for operational and domain-specific terminology.

Rerank before generation

The most relevant evidence should reach the LLM before answer synthesis.

Traceability

Responses expose supporting sections and retrieval information so that users can inspect where an answer came from.

Why SentinelAI?

Traditional LLM applications can produce convincing answers even when the underlying information is unavailable.

SentinelAI is designed around a different principle:

Retrieve → Rank → Verify → Generate

The goal is not simply to make an LLM answer questions, but to build a traceable and grounded retrieval system where unsupported information can be rejected.

Future Improvements
Production cloud deployment
Streaming responses
Retrieval caching
Improved evaluation coverage
Larger disaster-response knowledge bases
More advanced agentic workflows
Author

Cherukuri Rohith

B.Tech CSE (Data Science)

GitHub: https://github.com/ronni86bit
