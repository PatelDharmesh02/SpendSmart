from app.services.finance import build_month_snapshot
from app.services.realtime import notify_user
from app.services.serialize import transaction_dict


def publish_month(db, user_id, month: str, transaction=None) -> dict:
    snapshot = build_month_snapshot(db, user_id, month)
    message = {
        "type": "budget_vs_actual",
        "month": snapshot["month"],
        "income": snapshot["income"],
        "expenses": snapshot["expenses"],
        "net": snapshot["net"],
        "savings_rate": snapshot["savings_rate"],
        "budget_health": snapshot["budget_health"],
        "category_breakdown": snapshot["category_breakdown"],
        "budget_vs_actual": snapshot["budget_vs_actual"],
    }
    if transaction is not None:
        message["transaction"] = transaction_dict(transaction)
    notify_user(user_id, message)
    return message
