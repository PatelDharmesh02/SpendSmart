from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.budgets import Budget
from app.models.transactions import Transaction
from app.services.periods import month_bounds


def _f(value) -> float:
    if value is None:
        return 0.0
    return float(value)


def build_month_snapshot(db: Session, user_id, month: str) -> dict:
    start, end = month_bounds(month)
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.date >= start,
            Transaction.date < end,
        )
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .all()
    )
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.month == month)
        .order_by(Budget.category.asc())
        .all()
    )

    income = 0.0
    expenses = 0.0
    spent_by_category: dict[str, float] = {}
    for tx in transactions:
        amount = _f(tx.amount)
        if tx.tx_type == "income" or tx.category == "salary":
            income += amount
            continue
        expenses += amount
        spent_by_category[tx.category] = round(spent_by_category.get(tx.category, 0) + amount, 2)

    budgeted_by_category: dict[str, float] = {}
    for budget in budgets:
        budgeted_by_category[budget.category] = round(
            budgeted_by_category.get(budget.category, 0) + _f(budget.amount), 2
        )

    compare = []
    for category, budgeted in budgeted_by_category.items():
        spent = spent_by_category.get(category, 0.0)
        compare.append(
            {
                "category": category,
                "budgeted": round(budgeted, 2),
                "spent": round(spent, 2),
                "remaining": round(budgeted - spent, 2),
            }
        )

    if budgeted_by_category:
        healthy = sum(1 for row in compare if row["spent"] <= row["budgeted"])
        budget_health = round((healthy / len(compare)) * 100, 1)
    else:
        budget_health = 100.0

    net = round(income - expenses, 2)
    savings_rate = round((net / income) * 100, 1) if income else 0.0

    return {
        "month": month,
        "income": round(income, 2),
        "expenses": round(expenses, 2),
        "net": net,
        "savings_rate": savings_rate,
        "budget_health": budget_health,
        "category_breakdown": spent_by_category,
        "budget_vs_actual": compare,
        "transactions": transactions,
        "budgets": budgets,
    }


def money(value) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"))
