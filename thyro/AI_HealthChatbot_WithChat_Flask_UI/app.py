from flask import Flask, render_template, request, jsonify
import pdfplumber, re, joblib
import numpy as np
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)


with open("thyro\AI_HealthChatbot_WithChat_Flask_UI\data\doctor_db.json") as f:
    doctor_data = json.load(f)


# Load model, scaler, label encoder
model = joblib.load("thyro\AI_HealthChatbot_WithChat_Flask_UI\model\multilabel_random_forest_model_thyrocare.pkl")
scaler = joblib.load("thyro\AI_HealthChatbot_WithChat_Flask_UI\model\scaler.pkl")
mlb = joblib.load("thyro\AI_HealthChatbot_WithChat_Flask_UI\model\label_encoder_mlb_thyrocare.pkl")

# ✅ Features list
FEATURES = ['HEMOGLOBIN','TESTOSTERONE','IRON','HDL CHOLESTEROL','TRIGLYCERIDES',
            'TRANSFERRIN SATURATION','UIBC','TSH','VITAMIN D','VITAMIN B12',
            'LDL','CREATININE','SGOT','SGPT','HbA1c','UREA']

# ✅ Gender-aware reference ranges
ref_ranges = {
    "HEMOGLOBIN": {"male": (13,17.5), "female": (12,15)},
    "TESTOSTERONE": {"male": (300,1000), "female": (15,70)},
    "IRON": (50,170), "TSH": (0.4, 4.0),
    "VITAMIN D": (30, 100), "VITAMIN B12": (200, 900), "HDL CHOLESTEROL":(40,60)
}

# ✅ Suggestions
suggestions = {
    "Anemia": "Eat iron-rich foods (spinach, red meat), consider supplements if prescribed.",
    "Vitamin D Deficiency": "Get sunlight 15–20 min daily, take Vitamin D3 if required.",
    "Diabetes": "Avoid sugar and refined carbs, walk daily, monitor HbA1c.",
    "Liver Stress": "Avoid alcohol, processed foods, take liver-friendly diet.",
    "Kidney Dysfunction": "Drink plenty of water, limit salt and red meat."
}

latest_summary = {}

def classify_severity(test, val, gender="male"):
    ref = ref_ranges.get(test)
    if not ref: return "Normal"
    low, high = ref[gender] if isinstance(ref, dict) else ref
    if val < low: return "Low"
    if val > high: return "High"
    return "Normal"

def extract_values(pdf_path):
    extracted = {}
    gender = "male"
    with pdfplumber.open(pdf_path) as pdf:
        text = "\n".join([p.extract_text() or "" for p in pdf.pages])
        for test in FEATURES:
            match = re.search(rf"{test}.*?(\d+\.\d+|\d+)", text, re.IGNORECASE)
            if match:
                try:
                    val = float(match.group(1))
                    # Fix abnormal TSH cases
                    if test == "TSH" and val > 1000:
                        continue  # Skip unrealistic TSH values
                    extracted[test] = val
                except:
                    pass
        # Detect gender from (##Y/M) format
        gmatch = re.search(r"\((\d+)Y/(M|F)\)", text)
        if gmatch:
            gender = "male" if gmatch.group(2).upper() == "M" else "female"
    return extracted, gender

@app.route("/")
def home():
    return render_template("chatbot.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    global latest_summary
    file = request.files["pdf"]
    values, gender = extract_values(file)

    gender_encoded = 0 if gender == "male" else 1
    x = [values.get(test, 0) for test in FEATURES] + [gender_encoded]
    x_scaled = scaler.transform([x])

    pred = model.predict(x_scaled)
    labels = mlb.inverse_transform(pred)[0]

    severity = {k: classify_severity(k, values.get(k, 0), gender) for k in values}
    severity["Gender"] = gender.capitalize()

    latest_summary = {
        "values": values,
        "gender": gender,
        "severity": severity,
        "conditions": labels
    }

    print("✅ Latest Summary Sent to Frontend:", latest_summary)
    return jsonify({"summary": latest_summary})

@app.route("/chat", methods=["POST"])
def chat():
    q = request.json.get("message", "").lower()
    response = "🤖 I couldn't understand that. Try asking about a test or condition."

    # 🔎 Search tests
    for test in FEATURES:
        if test.lower() in q and test in latest_summary.get("values", {}):
            val = latest_summary["values"][test]
            sev = latest_summary["severity"].get(test, "Normal")
            response = f"🧪 {test} is {val}, which is considered **{sev}**."
            break

    # 🔎 Search predicted conditions
    for cond in latest_summary.get("conditions", []):
        if cond.lower() in q:
            response = f"💡 {cond}: {suggestions.get(cond, 'No advice available.')}"
            break

    # 🍽️ Handle generic questions like "what should I eat for iron"
    if "iron" in q and any(word in q for word in ["eat", "food", "increase", "boost"]):
        response = "🍽️ To increase iron: eat spinach, red meat, legumes, lentils, dried fruits, and add vitamin C-rich foods to help absorption."

    return jsonify({"reply": response})

@app.route("/search", methods=["POST"])
def search():
    data = request.get_json()
    city = data.get("city", "").strip().lower()
    spec = data.get("specialization", "").strip().lower()

    # Search for matching city and specialization
    for entry in doctor_data:
        if entry["city"].lower() == city and entry["specialization"].lower() == spec:
            return jsonify({"results": entry["doctors"]})

    return jsonify({"results": []}) 

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000, debug=True)
