import re
import os
from openai import OpenAI 
from app.utils.constants import CATEGORIES, CATEGORY_RULES

def predict_category_with_ai(description: str, amount: float) -> str:
    endpoint = "https://models.github.ai/inference"
    model = "openai/gpt-4o"

    client = OpenAI(
        base_url=endpoint,
        api_key=os.environ["OPENAI_API_KEY"],
    )

    prompt = f"""
            You are a smart financial assistant. Categorize this transaction.
            Choose one of: {", ".join(CATEGORIES)}.

            Transaction:
            Description: "{description}"
            Amount: ₹{amount}

            Category:"""

    response = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=1,
        top_p=1,
        max_tokens=30,
        model=model
    )

    category = response.choices[0].message.content.strip().lower()

    return category


def predict_category(description: str, amount: float) -> str:
    """Categorize transactions using rule-based matching with priority ordering"""
    # Normalize description
    clean_desc = re.sub(r'[^\w\s]', ' ', description.lower())
    clean_desc = re.sub(r'\s+', ' ', clean_desc).strip()
    
    # Special cases based on amount
    if amount <= 0:
        return "salary" if "salary" in clean_desc else "miscellaneous"
    
    # Check rules in priority order
    for rule in CATEGORY_RULES:
        category = rule["category"]
        keywords = rule["keywords"]
        
        # Amount-based filtering
        if "amount_min" in rule and amount < rule["amount_min"]:
            continue
        if "amount_max" in rule and amount > rule["amount_max"]:
            continue
            
        # Multi-word keyword matching
        for keyword in keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', clean_desc):
                return category
    
    # Amount-based fallbacks
    if amount > 20000 and ("house" in clean_desc or "apartment" in clean_desc):
        return "rent"
    if amount > 5000 and ("medical" in clean_desc or "hospital" in clean_desc):
        return "health"
    
    # Final keyword scan without amount restrictions
    for rule in CATEGORY_RULES:
        for keyword in rule["keywords"]:
            if re.search(r'\b' + re.escape(keyword) + r'\b', clean_desc):
                return rule["category"]
    
    return "miscellaneous"