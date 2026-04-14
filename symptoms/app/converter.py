import pandas as pd
import json

# Load the CSV
df = pd.read_csv("synthetic_symptom_disease_dataset.csv")

# Adjust these column names based on your actual CSV headers
# Example assumes you have 'symptoms' and 'disease' columns
articles = []

for _, row in df.iterrows():
    article_text = f"If a person is experiencing symptoms like {row['symptoms']}, they might be suffering from {row['disease']}."
    articles.append({
        "text": article_text,
        "source": "synthetic_dataset"
    })

# Save to raw_articles.json
with open("symptoms/data/raw_articles.json", "w") as f:
    json.dump(articles, f, indent=2)

print("raw_articles.json created successfully.")
