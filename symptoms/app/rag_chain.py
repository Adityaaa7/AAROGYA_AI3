from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from transformers import pipeline

def get_rag_chain():
    # Local embedding model
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # Load FAISS vector DB
    db = FAISS.load_local("vector_db", embeddings, allow_dangerous_deserialization=True)

    # Retriever
    retriever = db.as_retriever(search_kwargs={"k": 5})

    # Local LLM pipeline (no API key needed)
    pipe = pipeline("text2text-generation", model="google/flan-t5-small", max_length=512)
    llm = HuggingFacePipeline(pipeline=pipe)

    # Optional custom prompt
    prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template="You are a medical assistant. Use the following information to answer.\n\nContext:\n{context}\n\nQuestion:\n{question}\n\nAnswer:"
    )

    # QA Chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt_template}
    )

    return qa_chain

