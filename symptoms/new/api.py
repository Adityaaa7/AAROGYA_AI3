from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model and encoder
with open("symptoms/new/model/model (2).pkl", "rb") as f:
    model = pickle.load(f)

with open("symptoms/new/model/mlb (2).pkl", "rb") as f:
    mlb = pickle.load(f)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Disease Predictor API is running."})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    
    if not data or "symptoms" not in data:
        return jsonify({"error": "Please provide a 'symptoms' field with a list of symptoms."}), 400

    input_symptoms = [symptom.strip().lower() for symptom in data["symptoms"]]

    try:
        # Vectorize input symptoms
        input_vec = mlb.transform([input_symptoms])
        probabilities = model.predict_proba(input_vec)[0]

        # Get top 3 predictions
        top_indices = np.argsort(probabilities)[::-1][:2]
        top_diseases = [
            {
                "disease": model.classes_[i],
                "confidence": round(float(probabilities[i]) * 100, 2)
            }
            for i in top_indices
        ]

        return jsonify({
            "input_symptoms": input_symptoms,
            "top_predictions": top_diseases
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7000, debug=True)
