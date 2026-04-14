symptom_severity_map = {
    "fever": 4, "cough": 3, "chest pain": 10, "fatigue": 2,
    "shortness of breath": 9, "muscle pain": 3
}

def get_severity(symptom_text):
    words = symptom_text.lower().split()
    score = sum(symptom_severity_map.get(word, 1) for word in words)
    if score < 10:
        return "Low"
    elif score < 20:
        return "Medium"
    else:
        return "High"
