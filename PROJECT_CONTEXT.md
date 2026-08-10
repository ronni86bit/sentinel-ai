# PROJECT_CONTEXT.md

# SentinelAI

## Project Overview

SentinelAI is an enterprise AI-powered Disaster Management Knowledge Platform built as part of an AI/ML internship project.

The objective is to build a production-quality Retrieval-Augmented Generation (RAG) system that answers disaster management questions using official disaster response documents and Standard Operating Procedures (SOPs).

This project is intended to demonstrate practical AI Engineering skills rather than simply building a chatbot.

---

# Project Goal

Build a trustworthy AI assistant that:

- Answers disaster management questions.
- Uses Retrieval-Augmented Generation (RAG).
- Grounds every answer in retrieved documents.
- Shows supporting evidence and citations.
- Explains how the answer was generated.
- Evaluates retrieval quality and response quality.

The application should feel like a real enterprise AI product.

---

# Current Status

## Completed

### Frontend

- Modern enterprise dashboard
- Next.js + Tailwind CSS
- Search-first interface
- Supporting Evidence panel
- Retrieval pipeline visualization
- Documents page
- Evaluation dashboard
- Settings page
- Dark/Light mode
- Responsive UI

### Backend Architecture

Project structure has already been designed.

Modules already exist for:

- Document ingestion
- Chunking
- Embeddings
- Retrieval
- Reranking
- Query understanding
- Verification
- Generation
- Evaluation

---

# Not Yet Completed

The backend implementation is still incomplete.

The following still need to be fully implemented:

- End-to-end RAG pipeline
- Hybrid retrieval (FAISS + BM25)
- FAISS indexing
- Embedding generation
- Groq Llama 3.3 integration
- API endpoints
- Frontend ↔ Backend integration
- Real evaluation metrics
- Export functionality
- Production-ready error handling

---

# Planned RAG Pipeline

User Question

↓

Query Understanding

↓

Hybrid Retrieval
(BM25 + FAISS)

↓

Reciprocal Rank Fusion

↓

Cross-Encoder Reranking

↓

Top Retrieved Chunks

↓

Groq Llama 3.3 70B

↓

Structured JSON Response

↓

Frontend

---

# LLM

Use:

- Groq API
- Llama 3.3 70B Instruct

The LLM should answer ONLY using retrieved context.

If enough evidence is unavailable, it should refuse to answer rather than hallucinate.

---

# Frontend Requirements

Do NOT redesign the frontend.

Preserve the current UI.

Improve it only when necessary.

The interface should remain an enterprise knowledge platform, not a ChatGPT clone.

The answer page should display:

1. AI Response
2. Executive Summary
3. Recommended Actions
4. Supporting Guidelines
5. Referenced Documents
6. Supporting Evidence
7. Retrieval Metrics

---

# Coding Guidelines

- Keep the architecture modular.
- Do not rewrite working code.
- Build on the existing modules.
- Prefer clean, production-quality code.
- Keep components reusable.
- Follow good engineering practices.

---

# Primary Objective

Complete the existing project rather than rebuilding it.

Reuse as much of the existing architecture as possible while implementing the missing backend logic and integrating the frontend with the RAG pipeline.