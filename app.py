"""
Main Streamlit application for SentinelAI RAG system.
Entry point for the disaster management guidelines assistant.
"""

import streamlit as st
from config import PAGE_TITLE, PAGE_ICON, LAYOUT

# Page configuration
st.set_page_config(
    page_title=PAGE_TITLE,
    page_icon=PAGE_ICON,
    layout=LAYOUT,
    initial_sidebar_state="expanded"
)

def main():
    """Main application entry point."""
    # Application header
    st.title(PAGE_TITLE)
    st.markdown("### Retrieval-Augmented Generation for Disaster Management Guidelines")

    # Sidebar
    with st.sidebar:
        st.header("About")
        st.info(
            """
            SentinelAI is a RAG system designed to answer questions
            using only the provided disaster management guidelines.

            Features:
            - Document retrieval using FAISS vector search
            - Answer generation with citation tracking
            - Hallucination prevention mechanisms
            """
        )

        st.header("Documentation")
        st.markdown("""
        - [Data Dictionary](data/data_dictionary.md)
        - [Test Questions](data/test_questions.csv)
        """)

    # Main interface tabs
    tab1, tab2, tab3 = st.tasks(["Ask Question", "Documentation", "Evaluation"])

    with tab1:
        st.header("Ask a Question")
        question = st.text_input(
            "Enter your question about disaster management guidelines:",
            placeholder="e.g., What should be done before monsoon to reduce flood risk?"
        )

        if st.button("Get Answer", type="primary"):
            if question.strip():
                # TODO: Implement question processing pipeline
                with st.spinner("Searching for answer..."):
                    # Placeholder response
                    st.info("Answer generation functionality will be implemented here.")
                    st.write("**Question:**", question)
                    st.write("**Answer:** Not implemented yet.")
                    st.write("**Sources:** Not implemented yet.")
            else:
                st.warning("Please enter a question.")

    with tab2:
        st.header("Documentation")
        st.subheader("Available Documents")

        # List available documents
        import os
        docs_path = "docs"
        if os.path.exists(docs_path):
            doc_files = [f for f in os.listdir(docs_path) if f.endswith('.md')]
            for doc_file in sorted(doc_files):
                doc_name = doc_file.replace('.md', '').replace('_', ' ').title()
                st.write(f"- {doc_name}")
        else:
            st.write("Documents directory not found.")

    with tab3:
        st.header("Evaluation")
        st.info("Evaluation metrics and test results will be displayed here.")

        # Placeholder for evaluation results
        if st.button("Run Evaluation"):
            st.warning("Evaluation functionality not yet implemented.")

if __name__ == "__main__":
    main()