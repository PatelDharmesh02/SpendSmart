from collections import defaultdict

def summarize_transactions(transactions):
    total = 0
    by_category = defaultdict(float)

    for tx in transactions:
        by_category[tx.category] += tx.amount
        total += tx.amount

    sorted_cats = sorted(by_category.items(), key=lambda x: -x[1])

    return {
        "total": round(total, 2),
        "by_category": sorted_cats  # e.g., [("rent", 5000), ("groceries", 2500), ...]
    }


def summarize_budgets(budgets):
    return [
        {
            "category": b.category,
            "budgeted": float(b.amount)
        } for b in budgets
    ]
