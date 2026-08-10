import streamlit as st
import os
import sys
import time
import pickle
import faiss
from pathlib import Path

# Add the project root to sys.path to allow imports from our packages
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Import our modules (unchanged backend)
from ingestion import ingest_documents
from chunking import chunk_documents
from embedding import EmbeddingPipeline
from retrieval import Retriever, BM25Retriever, reciprocal_rank_fusion
from verification import verify_evidence
from generation import GeminiGenerator

# Constants (unchanged)
VECTORSTORE_DIR = "vectorstore"
INDEX_PREFIX = os.path.join(VECTORSTORE_DIR, "sentinel_index")
BM25_PREFIX = os.path.join(VECTORSTORE_DIR, "sentinel_bm25")
DOCS_DIR = "docs"

# Ensure directories exist
os.makedirs(VECTORSTORE_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

# --- Theme and Custom CSS/JS ---
def load_theme_and_styles():
    """Inject Tailwind CSS, custom CSS, and JavaScript for theme handling"""
    # First, inject Tailwind CSS from CDN
    st.markdown(
        '<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">',
        unsafe_allow_html=True
    )

    # Custom CSS for our design system and theme handling
    st.markdown(
        """
        <style>
            /* CSS Variables for Light and Dark Themes */
            :root {
                --background: #ffffff;
                --foreground: #111827;
                --primary: #2563eb;
                --primary-foreground: #ffffff;
                --secondary: #e2e8f0;
                --secondary-foreground: #111827;
                --muted: #f8fafc;
                --muted-foreground: #64748b;
                --accent: #3b82f6;
                --accent-foreground: #ffffff;
                --destructive: #ef4444;
                --destructive-foreground: #ffffff;
                --border: #e2e8f0;
                --input: #e2e8f0;
                --ring: #2563eb;
                --radius: 0.5rem;
            }

            [data-theme="dark"] {
                --background: #0f172a;
                --foreground: #f8fafc;
                --primary: #3b82f6;
                --primary-foreground: #ffffff;
                --secondary: #334155;
                --secondary-foreground: #f8fafc;
                --muted: #1e293b;
                --muted-foreground: #94a3b8;
                --accent: #60a5fa;
                --accent-foreground: #0f172a;
                --destructive: #f87171;
                --destructive-foreground: #0f172a;
                --border: #334155;
                --input: #334155;
                --ring: #60a5fa;
                --radius: 0.5rem;
            }

            /* Base styles */
            .stApp {
                background-color: var(--background);
                color: var(--foreground);
                transition: background-color 0.3s, color 0.3s;
            }

            /* Hide Streamlit branding and menu */
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}

            /* Custom container styling */
            .block-container {
                padding-top: 2rem;
                padding-bottom: 2rem;
                max-width: 1920px;
            }

            /* Custom button styling */
            .stButton > button {
                background-color: var(--primary);
                color: var(--primary-foreground);
                border: none;
                padding: 0.5rem 1rem;
                font-weight: 600;
                border-radius: var(--radius);
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .stButton > button:hover {
                background-color: var(--accent);
                transform: translateY(-1px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .stButton > button:active {
                transform: translateY(0);
            }

            .stButton > button[kind="secondary"] {
                background-color: var(--secondary);
                color: var(--secondary-foreground);
                border: 1px solid var(--border);
            }

            .stButton > button[kind="secondary"]:hover {
                background-color: var(--muted);
            }

            /* File uploader */
            .stFileUploader > div {
                border: 2px dashed var(--border);
                border-radius: var(--radius);
                padding: 2rem;
                text-align: center;
                background-color: var(--muted);
                transition: all 0.2s ease;
            }

            .stFileUploader > div:hover {
                border-color: var(--accent);
                background-color: var(--secondary);
            }

            /* Text input */
            .stTextInput > div > div > input {
                background-color: var(--background);
                color: var(--foreground);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 0.5rem 0.75rem;
                font-size: 0.875rem;
                transition: all 0.2s ease;
            }

            .stTextInput > div > div > input:focus {
                border-color: var(--ring);
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
            }

            /* Selectbox */
            .stSelectbox > div > div {
                background-color: var(--background);
                border: 1px solid var(--border);
                border-radius: var(--radius);
            }

            /* Expander */
            .streamlit-expanderHeader {
                background-color: var(--muted);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                font-weight: 600;
                color: var(--foreground);
            }

            .streamlit-expanderContent {
                border: 1px solid var(--border);
                border-top: none;
                border-radius: 0 0 var(--radius) var(--radius);
                background-color: var(--background);
            }

            /* Metrics and alerts - we'll avoid using Streamlit's alerts */
            .stAlert {
                border-radius: var(--radius);
            }

            /* Success message */
            .stSuccess {
                background-color: #d1fae5;
                border-color: #10b981;
                color: #065f46;
            }

            /* Error message */
            .stError {
                background-color: #fee2e2;
                border-color: #ef4444;
                color: #991b1b;
            }

            /* Warning message */
            .stWarning {
                background-color: #fef3c7;
                border-color: #f59e0b;
                color: #92400e;
            }

            /* Info message */
            .stInfo {
                background-color: #dbeafe;
                border-color: #3b82f6;
                color: #1e40af;
            }

            /* Custom scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
            }
            ::-webkit-scrollbar-track {
                background: var(--muted);
            }
            ::-webkit-scrollbar-thumb {
                background-color: var(--secondary);
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background-color: var(--muted-foreground);
            }

            /* Tablet and mobile responsiveness */
            @media (max-width: 768px) {
                .block-container {
                    padding-left: 1rem;
                    padding-right: 1rem;
                }
            }
        </style>
        """,
        unsafe_allow_html=True
    )

    # JavaScript for theme detection and persistence
    st.markdown(
        """
        <script>
            // Function to set theme
            function setTheme(theme) {
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
            }

            // Function to get saved theme or system preference
            function getPreferredTheme() {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme) {
                    return savedTheme;
                }

                // Check system preference
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                }
                return 'light';
            }

            // Initialize theme on load
            document.addEventListener('DOMContentLoaded', (event) => {
                const theme = getPreferredTheme();
                setTheme(theme);
            });

            // Listen for changes in system preference
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    setTheme(e.matches ? 'dark' : 'light');
                }
            });
        </script>
        """,
        unsafe_allow_html=True
    )

# --- Helper functions (unchanged backend logic) ---
def save_uploaded_files(uploaded_files):
    """Save uploaded files to the docs directory."""
    for uploaded_file in uploaded_files:
        file_path = os.path.join(DOCS_DIR, uploaded_file.name)
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
    return len(uploaded_files)

def build_index():
    """Build the FAISS index and BM25 from documents in DOCS_DIR."""
    with st.spinner("Ingesting documents..."):
        docs = ingest_documents(DOCS_DIR)
    with st.spinner("Chunking documents..."):
        chunks = chunk_documents(docs)
    with st.spinner("Building embeddings and FAISS index..."):
        pipeline = EmbeddingPipeline()
        embeddings = pipeline.encode_chunks(chunks)
        index = pipeline.build_index(embeddings)
    with st.spinner("Saving index and metadata..."):
        pipeline.save(INDEX_PREFIX)
    with st.spinner("Building and saving BM25 index..."):
        bm25 = BM25Retriever(chunks)
        bm25.save(BM25_PREFIX)
    st.success("Index rebuilt successfully!")

def load_index():
    """Load the FAISS index and BM25 from disk."""
    index_path = INDEX_PREFIX + ".index"
    meta_path = INDEX_PREFIX + ".meta.pkl"
    bm25_path = BM25_PREFIX + ".pkl"

    if not (os.path.exists(index_path) and os.path.exists(meta_path) and os.path.exists(bm25_path)):
        st.error("Index not found. Please build the index first.")
        return None, None

    # Load FAISS index and metadata
    try:
        index = faiss.read_index(index_path)
        with open(meta_path, "rb") as f:
            chunks = pickle.load(f)
        retriever = Retriever(INDEX_PREFIX, INDEX_PREFIX)
    except Exception as e:
        st.error(f"Error loading FAISS index: {e}")
        return None, None

    # Load BM25
    try:
        bm25 = BM25Retriever.load(BM25_PREFIX)
    except Exception as e:
        st.error(f"Error loading BM25 index: {e}")
        return None, None

    return retriever, bm25

# --- Main Application ---
def main():
    # Load theme and styles
    load_theme_and_styles()

    # Initialize session state
    if 'index_built' not in st.session_state:
        st.session_state.index_built = os.path.exists(INDEX_PREFIX + ".index") and \
                                       os.path.exists(INDEX_PREFIX + ".meta.pkl") and \
                                       os.path.exists(BM25_PREFIX + ".pkl")

    if 'doc_count' not in st.session_state:
        # Count files in docs directory
        try:
            files = [f for f in os.listdir(DOCS_DIR) if os.path.isfile(os.path.join(DOCS_DIR, f))]
            st.session_state.doc_count = len(files)
        except:
            st.session_state.doc_count = 0

    if 'theme' not in st.session_state:
        # Will be set by JavaScript, but we initialize to match system
        st.session_state.theme = "system"

    # Top Navigation
    st.markdown(
        """
        <div class="border-b border-solid border-[var(--border)] pb-4 mb-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-[var(--foreground)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
                            SentinelAI
                        </h1>
                        <p class="text-sm text-[var(--muted-foreground)]">Disaster Management RAG System</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4 mt-4 sm:mt-0">
                    <div class="flex items-center space-x-2 text-sm text-[var(--muted-foreground)]">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>System: <span class="font-medium">Online</span></span>
                    </div>
                    <div class="relative">
                        <button id="theme-toggle" class="p-2 rounded-lg hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 transition-colors">
                            <svg id="theme-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646M12.034 9.034a9 9 0 0012.752 12.752M5.636 5.636a9 9 0 0012.752 12.752M12.034 17.034a9 9 0 0112.752-12.752"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # Main layout: Left Navigation | Main Workspace | Right Panel
    col_left, col_main, col_right = st.columns([1, 2, 1])

    with col_left:
        # Left Navigation
        st.markdown(
            """
            <div class="space-y-4">
                <h2 class="text-lg font-semibold text-[var(--foreground)] mb-4">Navigation</h2>
            </div>
            """,
            unsafe_allow_html=True
        )

        nav_items = [
            {"name": "Dashboard", "icon": "home", "active": True},
            {"name": "Documents", "icon": "folder", "active": False},
            {"name": "Search", "icon": "magnifying-glass", "active": False},
            {"name": "Evaluation", "icon": "chart-bar", "active": False},
            {"name": "Settings", "icon": "cog", "active": False}
        ]

        for item in nav_items:
            active_class = "bg-[var(--primary)]/10 text-[var(--primary)]" if item["active"] else "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
            st.markdown(
                f"""
                <div class="flex items-center space-x-3 p-3 rounded-lg {active_class} hover:bg-[var(--muted)]/50 transition-colors">
                    <div class="flex items-center justify-center w-8 h-8">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11a1 1 0 011 1v3a1 1 0 01-1 1h-3m-3 0a1 1 0 001-1v-3a1 1 0 011-1h3m3 4a1 1 0 01-1 1H1a1 1 0 01-1-1v-2a1 1 0 011-1h2"/>
                        </svg>
                    </div>
                    <span class="font-medium">{item["name"]}</span>
                </div>
                """,
                unsafe_allow_html=True
            )

        st.markdown('<div class="mt-6"></div>', unsafe_allow_html=True)

        # Document management section in left nav
        st.markdown(
            """
            <div class="border-t border-solid border-[var(--border)] pt-4">
                <h2 class="text-lg font-semibold text-[var(--foreground)] mb-4">Document Management</h2>
            </div>
            """,
            unsafe_allow_html=True
        )

        # File uploader
        uploaded_files = st.file_uploader(
            "Upload documents",
            accept_multiple_files=True,
            type=["md", "pdf", "csv", "xlsx", "xls"],
            label_visibility="collapsed"
        )

        if uploaded_files:
            num_saved = save_uploaded_files(uploaded_files)
            st.success(f"Saved {num_saved} file(s)")
            # Update doc count and rerun
            st.session_state.doc_count = len([f for f in os.listdir(DOCS_DIR) if os.path.isfile(os.path.join(DOCS_DIR, f))])
            st.experimental_rerun()

        # Rebuild index button
        if st.button("Rebuild Index", use_container_width=True, type="primary"):
            with st.spinner("Building index..."):
                build_index()
            st.session_state.index_built = True
            st.experimental_rerun()

        # Document count
        st.markdown(
            f"""
            <div class="mt-4 text-sm text-[var(--muted-foreground)]">
                Documents: <span class="font-medium">{st.session_state.doc_count}</span>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col_main:
        # Main Workspace
        st.markdown(
            """
            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-[var(--foreground)]">Ask SentinelAI</h2>
                <p class="text-sm text-[var(--muted-foreground)]">Get accurate, cited answers from disaster management guidelines</p>
            </div>
            """,
            unsafe_allow_html=True
        )

        # Search bar
        question = st.text_input(
            "Enter your question",
            label_visibility="collapsed",
            placeholder="e.g., What are the evacuation procedures for hurricanes?",
            key="main_question"
        )

        # Process question
        if question and question.strip():
            # Show loading state
            with st.spinner("Searching for answers..."):
                try:
                    # Load index and retrievers
                    retriever, bm25 = load_index()
                    if retriever is None or bm25 is None:
                        st.error("Index not found. Please build the index first.")
                        return

                    # Retrieve
                    k_fetch = 10
                    dense_res = retriever.retrieve(question, k=k_fetch)
                    bm25_res = bm25.retrieve(question, k=k_fetch)
                    fused = reciprocal_rank_fusion([dense_res, bm25_res], k=60)
                    top_k = fused[:5]

                    if not top_k:
                        st.warning("No relevant information found.")
                        return

                    # Compute confidence as max score
                    max_score = max([score for _, score in top_k]) if top_k else 0.0

                    # Verify evidence
                    if not verify_evidence([(chunk, score) for chunk, score in top_k], question):
                        st.error("Insufficient evidence to answer the question.")
                        return

                    # Generate answer
                    generator = GeminiGenerator()
                    result = generator.generate(question, [(chunk, score) for chunk, score in top_k])
                    answer = result["answer"]
                    citations = result["citations"]

                    # Display answer card
                    st.markdown(
                        f"""
                        <div class="bg-[var(--background)] rounded-xl border border-[var(--border)] p-6 mb-6 shadow-sm">
                            <div class="flex items-start space-x-4">
                                <div class="flex-shrink-0">
                                    <div class="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-[var(--foreground)] mb-2">Answer</h3>
                                    <p class="text-[var(--foreground)]/90 leading-relaxed">{answer}</p>
                                </div>
                            </div>
                            <div class="mt-4 pt-3 border-t border-[var(--border)]/50">
                                <div class="flex items-center space-x-4 text-sm">
                                    <div class="flex items-center space-x-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"/>
                                        </svg>
                                        <span>Confidence:</span>
                                    </div>
                                    <div class="flex items-center space-x-2 w-32">
                                        <div class="w-full h-2.5 bg-[var(--muted)]/50 rounded-full">
                                            <div class="h-2.5 bg-[var(--primary)] rounded-full" style="width: {max_score*100}%"></div>
                                        </div>
                                        <span class="font-medium text-[var(--foreground)]">{max_score:.0%}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        """,
                        unsafe_allow_html=True
                    )

                    # Store results in session state for right panel and bottom section
                    st.session_state.last_results = {
                        'top_k': top_k,
                        'answer': answer,
                        'citations': citations,
                        'confidence': max_score,
                        'latency': 0.5  # Placeholder - in reality we'd measure this
                    }

                except Exception as e:
                    st.error(f"An error occurred: {str(e)}")
        else:
            # Empty state
            st.markdown(
                """
                <div class="text-center py-12">
                    <div class="mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-[var(--muted)]/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <h2 class="text-xl font-bold text-[var(--foreground)] mb-2">Ready to help</h2>
                    <p class="text-lg text-[var(--muted-foreground)]">Ask a question about disaster management guidelines to get started</p>
                    <div class="mt-6 flex justify-center space-x-3">
                        <button class="px-4 py-2 bg-[var(--muted)]/50 text-[var(--muted-foreground)] rounded hover:bg-[var(--muted)]/100 transition">Example: What are flood preparedness measures?</button>
                        <button class="px-4 py-2 bg-[var(--muted)]/50 text-[var(--muted-foreground)] rounded hover:bg-[var(--muted)]/100 transition">Example: How to create an emergency kit?</button>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

    with col_right:
        # Right Panel - Supporting Evidence
        st.markdown(
            """
            <div class="space-y-6">
                <h2 class="text-xl font-bold text-[var(--foreground)]">Supporting Evidence</h2>
            </div>
            """,
            unsafe_allow_html=True
        )

        if 'last_results' in st.session_state and st.session_state.last_results:
            top_k = st.session_state.last_results['top_k']
            for i, (chunk, score) in enumerate(top_k):
                meta = getattr(chunk, "metadata", {})
                section_id = meta.get("section_id", "N/A")
                source_path = meta.get("source_path", "N/A")
                text = getattr(chunk, "text", "")

                filename = os.path.basename(source_path) if source_path != "N/A" else "Unknown"

                st.markdown(
                    f"""
                    <div class="bg-[var(--background)] rounded-xl border border-[var(--border)] p-4 mb-4 shadow-sm">
                        <div class="flex items-start space-x-3">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                                    <div class="text-[var(--primary)] text-xs font-bold">{i+1}</div>
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start mb-2">
                                    <h3 class="text-sm font-medium text-[var(--foreground)]">Result {i+1}</h3>
                                    <span class="text-xs bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded">{score:.3f}</span>
                                </div>
                                <div class="text-sm text-[var(--muted-foreground)] mb-2">
                                    <span class="font-medium">Section ID:</span> <span>{section_id}</span>
                                </div>
                                <div class="text-sm text-[var(--muted-foreground)] mb-2">
                                    <span class="font-medium">Source:</span> <span>{filename}</span>
                                </div>
                                <p class="text-[var(--foreground)]/90 text-sm leading-relaxed">{text[:200]}{'...' if len(text) > 200 else ''}</p>
                            </div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

            # Citations
            if st.session_state.last_results['citations']:
                st.markdown(
                    """
                    <div class="mt-4">
                        <h3 class="text-lg font-semibold text-[var(--foreground)] mb-2">Section Citations</h3>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

                for cit in st.session_state.last_results['citations']:
                    st.markdown(
                        f"""
                        <div class="flex items-center space-x-2 text-sm text-[var(--foreground)]/90">
                            <div class="flex items-center justify-center w-5 h-5 bg-[var(--primary)]/10 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"/>
                                </svg>
                            </div>
                            <span>[{cit}]</span>
                        </div>
                        """,
                        unsafe_allow_html=True
                    )
        else:
            # Empty evidence state
            st.markdown(
                """
                <div class="text-center py-12">
                    <div class="mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-[var(--muted)]/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <p class="text-[var(--muted-foreground)]">No evidence retrieved yet. Ask a question to see supporting evidence here.</p>
                </div>
                """,
                unsafe_allow_html=True
            )

    # Bottom Section - Retrieval Timeline
    st.markdown(
        """
        <div class="mt-12 border-t border-solid border-[var(--border)] pt-6">
            <div class="space-y-4">
                <h2 class="text-xl font-bold text-[var(--foreground)]">Retrieval Timeline</h2>
            </div>
            """,
        unsafe_allow_html=True
    )

    if 'last_results' in st.session_state and st.session_state.last_results:
        latency = st.session_state.last_results.get('latency', 0.5)
        confidence = st.session_state.last_results.get('confidence', 0)
        doc_count = st.session_state.doc_count

        st.markdown(
            f"""
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-[var(--background)] rounded-xl border border-[var(--border)] p-4">
                    <div class="text-sm text-[var(--muted-foreground)] font-medium">Latency</div>
                    <div class="text-lg font-semibold text-[var(--foreground)]">{latency:.2f}s</div>
                </div>
                <div class="bg-[var(--background)] rounded-xl border border-[var(--border)] p-4">
                    <div class="text-sm text-[var(--muted-foreground)] font-medium">Confidence</div>
                    <div class="text-lg font-semibold text-[var(--foreground)]">{confidence:.0%}</div>
                </div>
                <div class="bg-[var(--background)] rounded-xl border border-[var(--border)] p-4">
                    <div class="text-sm text-[var(--muted-foreground)] font-medium">Indexed Documents</div>
                    <div class="text-lg font-semibold text-[var(--foreground)]">{doc_count}</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
    else:
        st.markdown(
            """
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-[var(--background)] rounded-xl border border-[var(--border)] p-4 text-center">
                    <div class="text-sm text-[var(--muted-foreground)] font-medium">Latency</div>
                    <div class="text-lg font-semibold text-[var(--muted-foreground)]">-</div>
                </div>
                <div class="bg-[var(--background)] rounded-xl border border-[var(--border)] p-4 text-center">
                    <div class="text-sm text-[var(--muted-foreground)] font-medium">Confidence</div>
                    <div class="text-lg font-semibold text-[var(--muted-foreground)]">-</div>
                </div>
                <div class="bg-[var(--background)] rounded-xl border border-[var(--border)] p-4 text-center">
                    <div class="text-sm text-[var(--muted-foreground)] font-medium">Indexed Documents</div>
                    <div class="text-lg font-semibold text-[var(--foreground)]">""" + str(st.session_state.doc_count) + """</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    st.markdown("</div>", unsafe_allow_html=True)

# Add JavaScript for theme toggle button
st.markdown(
    """
    <script>
        document.addEventListener('DOMContentLoaded', (event) => {
            const themeToggleBtn = document.getElementById('theme-toggle');
            const themeIcon = document.getElementById('theme-icon');

            if (themeToggleBtn) {
                themeToggleBtn.addEventListener('click', () => {
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    localStorage.setItem('theme', newTheme);

                    // Update icon
                    if (newTheme === 'dark') {
                        themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646M12.034 9.034a9 9 0 0012.752 12.752M5.636 5.636a9 9 0 0012.752 12.752M12.034 17.034a9 9 0 0112.752-12.752"/>';
                    } else {
                        themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646M12.034 9.034a9 9 0 0012.752 12.752M5.636 5.636a9 9 0 0012.752 12.752M12.034 17.034a9 9 0 0112.752-12.752"/>';
                    }
                });
            }
        });
    </script>
    """,
    unsafe_allow_html=True
)

if __name__ == "__main__":
    main()