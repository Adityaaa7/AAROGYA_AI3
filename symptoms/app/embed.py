import json
import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.docstore.document import Document

def embed_documents():
    json_path = "symptoms/data/raw_articles.json"
    vector_db_path = "symptoms/vector_db"

    # Check if the JSON file exists
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"File not found: {json_path}")

    # Load data from raw_articles.json
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            articles = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Error parsing JSON: {e}")

    if not articles:
        raise ValueError("No articles found in raw_articles.json")

    print(f"✅ Loaded {len(articles)} articles.")

    # Prepare LangChain Documents
    docs = []
    for item in articles:
        title = item.get("title", "Unknown Disease")
        content = item.get("content", "").strip()
        if not content:
            continue  # Skip empty content

        doc = Document(
            page_content=content,
            metadata={"source": title}
        )
        docs.append(doc)

    if not docs:
        raise ValueError("No valid documents with content to embed.")

    print(f"📄 Prepared {len(docs)} documents for embedding.")

    # Initialize HuggingFace embeddings
    print("🔍 Initializing embedding model: all-MiniLM-L6-v2")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # Create FAISS vector DB
    print("📦 Creating FAISS vector store...")
    db = FAISS.from_documents(docs, embeddings)

    # Ensure output directory exists
    os.makedirs(vector_db_path, exist_ok=True)

    # Save the FAISS vector DB locally
    db.save_local(vector_db_path)

    print(f"✅ Vector DB saved to {vector_db_path}")

if __name__ == "__main__":
    embed_documents()


