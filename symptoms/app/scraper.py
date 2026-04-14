import requests
from bs4 import BeautifulSoup
import json
import os

BASE_URL = "https://www.merckmanuals.com"
SYMPTOM_LINKS = [
    "/home/digestive-disorders/gastrointestinal-emergencies/acute-abdominal-pain"
    
]

def scrape_nhs_page(relative_url):
    url = BASE_URL + relative_url
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        # Extract the title
        title_tag = soup.find("h1")
        title = title_tag.get_text(strip=True) if title_tag else "No Title"

        # Extract all main content paragraphs under div with class 'nhsuk-width-container'
        content_container = soup.find("div", class_="nhsuk-width-container")
        paragraphs = content_container.find_all("p") if content_container else []
        content = "\n\n".join(p.get_text(strip=True) for p in paragraphs)

        return {
            "title": title,
            "content": content.strip(),
            "url": url
        }

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {
            "title": "Error",
            "content": "",
            "url": url
        }

def scrape_and_save():
    os.makedirs("symptoms/data", exist_ok=True)
    articles = [scrape_nhs_page(link) for link in SYMPTOM_LINKS]

    with open("symptoms/data/nhs_articles.json", "w", encoding="utf-8") as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)

    print(f"✅ Done! Saved {len(articles)} articles to symptoms/data/nhs_articles.json")

if __name__ == "__main__":
    scrape_and_save()
