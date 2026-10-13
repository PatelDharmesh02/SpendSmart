from app.models.budgets import Budget
from app.models.transactions import Transaction


def transaction_dict(tx: Transaction) -> dict:
    return {
        "id": str(tx.id),
        "amount": float(tx.amount),
        "category": tx.category,
        "date": tx.date.isoformat(),
        "desc": tx.desc,
        "merchant": tx.merchant,
        "tx_type": tx.tx_type,
        "category_source": tx.category_source,
        "ai_confidence": tx.ai_confidence,
        "status": tx.status,
        "created_at": tx.created_at.isoformat() if tx.created_at else None,
    }


def budget_dict(budget: Budget) -> dict:
    return {
        "id": str(budget.id),
        "category": budget.category,
        "amount": float(budget.amount),
        "month": budget.month,
        "created_at": budget.created_at.isoformat() if budget.created_at else None,
    }
