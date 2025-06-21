from datetime import datetime
from openai import OpenAI
import os
from app.services.build_prompt import build_prompt
from app.utils.constants import CATEGORIES, CATEGORY_RULES

def generate_summary(month: str, tx_summary: dict, budget_data: list) -> str:
    """Generate financial summary using rule-based analysis"""
    month_name = datetime.strptime(month, "%Y-%m").strftime("%B")
    total_spent = tx_summary['total']
    
    # Convert budget data to dictionary
    budgets = {b['category']: b['budgeted'] for b in budget_data}
    
    # 1. Calculate budget performance
    budget_status = {}
    for category, spent in tx_summary['by_category']:
        if category in budgets:
            budgeted = budgets[category]
            percentage = (spent / budgeted) * 100
            status = "over" if spent > budgeted else "under"
            budget_status[category] = {
                "status": status,
                "diff": abs(spent - budgeted),
                "percentage": min(percentage, 150)  # Cap at 150% for readability
            }
    
    # 2. Identify key insights
    top_category = tx_summary['by_category'][0][0] if tx_summary['by_category'] else None
    top_spend = tx_summary['by_category'][0][1] if tx_summary['by_category'] else 0
    
    # 3. Build summary sections
    # -- Opening summary
    summary = f"In {month_name}, you spent ₹{total_spent:,.2f} total. "
    
    # -- Top spending category
    if top_category:
        summary += f"Your largest expense was {top_category} (₹{top_spend:,.2f}). "
    
    # -- Budget performance
    if budget_status:
        over_budget = [cat for cat, data in budget_status.items() if data['status'] == "over"]
        under_budget = [cat for cat, data in budget_status.items() if data['status'] == "under"]
        
        if under_budget:
            summary += f"You stayed within budget for {', '.join(under_budget[:-1])}{' and ' + under_budget[-1] if under_budget else ''} - great job! "
        
        if over_budget:
            worst = max(over_budget, key=lambda x: budget_status[x]['percentage'])
            amount_over = budget_status[worst]['diff']
            summary += f"Watch out for {worst} where you exceeded budget by ₹{amount_over:,.2f}. "
    
    # -- Savings opportunity
    if top_category in ['food', 'entertainment', 'shopping'] and top_spend > total_spent * 0.3:
        summary += f"Consider reducing {top_category} spending next month to save more. "
    elif not budget_status:
        summary += "Try setting budgets to better track your expenses! "
    
    # -- Closing positive note
    savings_rate = (1 - (total_spent / (total_spent + 10000))) * 100  # Simplified calculation
    if savings_rate > 20:
        summary += "Excellent savings habits - keep it up!"
    elif savings_rate > 10:
        summary += "You're making good progress on your savings goals."
    else:
        summary += "Small daily savings can make a big difference over time!"
    
    return summary


def generate_summary_with_ai(month: str, tx_summary: dict, budget_data: list) -> str:
    
    prompt = build_prompt(month, tx_summary, budget_data);
    
    endpoint = "https://models.github.ai/inference"
    model = "openai/gpt-4o"

    client = OpenAI(
        base_url=endpoint,
        api_key=os.environ["OPENAI_API_KEY"],
    )

    response = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=model,
        temperature=1,
        max_tokens=300,
        top_p=1
    )

    return response.choices[0].message.content.strip()