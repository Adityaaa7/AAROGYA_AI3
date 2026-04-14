from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app, origins="*")  # Allow requests from your frontend

# Configure the Gemini API
genai.configure(api_key="AIzaSyCW-gngMQHK3r2x8ANOKOVP2eEysBMlVik")
model = genai.GenerativeModel("gemini-2.0-flash")

# Function to clean markdown from the Gemini response
def clean_markdown(text):
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Bold
    text = re.sub(r'\*(.*?)\*', r'\1', text)      # Italic
    text = re.sub(r'`(.*?)`', r'\1', text)        # Inline code
    text = re.sub(r'^\s*[-*]\s+', '', text, flags=re.MULTILINE)  # Bullet points
    return text.strip()

# Initialize chat session with instruction prompt
chat_session = model.start_chat(history=[
    {
        "role": "user",
        "parts": ["""
You are a friendly and concise AI health assistant.
Your goal is to respond conversationally in a human tone.
- Keep answers short and helpful (3 to 6 sentences max).
- Avoid formal or textbook-style explanations.
- Be empathetic and user-focused.
- Use simple language.
- Offer tips or follow-ups if relevant.
Do not include medical disclaimers unless the user asks for critical advice.
"""]
    }
])

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get("message", "")

    if not user_input:
        return jsonify({"error": "Message is required."}), 400

    try:
        response = chat_session.send_message(user_input)
        cleaned_text = clean_markdown(response.text)
        return jsonify({"response": cleaned_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return "🧠 Gemini Chat API is running on port 8000."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
