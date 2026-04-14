from flask import Flask, request, jsonify
from rag_chain import get_rag_chain
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load RAG chain once
qa_chain = get_rag_chain()

@app.route('/ask', methods=['POST'])
def ask():
    try:
        data = request.json
        symptoms_input = data.get("symptoms")

        if not symptoms_input:
            return jsonify({"error": "Symptoms are required"}), 400

        # Convert symptom list to query string
        if isinstance(symptoms_input, list):
            symptoms_text = ", ".join(symptoms_input)
        elif isinstance(symptoms_input, str):
            symptoms_text = symptoms_input
        else:
            return jsonify({"error": "Invalid symptoms format"}), 400

        query = f"I am experiencing the following symptoms: {symptoms_text}. What disease might this indicate?"

        result = qa_chain({"query": query})

        answer = result["result"]
        sources = [doc.metadata.get("source", "N/A") for doc in result.get("source_documents", [])]

        return jsonify({
            "answer": answer.strip() or "No prediction returned",
            "sources": sources
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=6000, debug=True)

