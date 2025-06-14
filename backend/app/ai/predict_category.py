import re
import openai
import os
from app.utils.constants import CATEGORIES, CATEGORY_RULES

openai.api_key = os.getenv("OPENAI_API_KEY")

def predict_category_by_openai(description: str, amount: float) -> str:
    prompt = f"""
        You are a smart financial assistant. Categorize this transaction.
        Choose one of: {", ".join(CATEGORIES)}.

        Transaction:
        Description: "{description}"
        Amount: ₹{amount}

        Category:"""

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{ "role": "user", "content": prompt }],
        temperature=0.2,
        max_tokens=20,
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