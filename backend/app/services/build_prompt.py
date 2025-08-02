from datetime import datetime


def build_prompt(month, tx_summary, budget_data, username):
    month_name = datetime.strptime(month, "%Y-%m").strftime("%B")

    prompt = f"""You are a financial assistant. Give a friendly, helpful summary of user's spending for {month_name}.
User name: {username}
Total spending: ₹{tx_summary['total']}
Breakdown by category:
""" + "\n".join([f"- {cat}: ₹{amt}" for cat, amt in tx_summary['by_category']]) + "\n\n"

    if budget_data:
        prompt += "Monthly Budgets:\n"
        prompt += "\n".join([f"- {b['category']}: ₹{b['budgeted']}" for b in budget_data])
        prompt += "\n\n"

    prompt += "Compare budgets vs spending, suggest improvements, warn about overspending by keeping remaining days in month in mind, and comment positively. Make it short and friendly."

    return prompt
