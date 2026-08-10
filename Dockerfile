# Base image with Python
FROM python:3.11-slim AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY main.py .
COPY ingestion.py .
COPY chunking.py .
COPY embedding.py .
COPY retrieval.py .
COPY verification.py .
COPY generation.py .

# Create data and docs directories (they will be mounted as volumes in compose)
RUN mkdir -p data docs vectorstore

# Expose port
EXPOSE 8000

# Environment variables (can be overridden at runtime)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]