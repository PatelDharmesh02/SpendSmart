from uuid import UUID

from app.ai.predict_category import predict_category, predict_category_with_ai
from app.db.session import SessionLocal
from app.models.transactions import Transaction
from app.services.categories import normalize_category
from app.services.events import publish_month


def categorize_transaction_record(tx_id: str) -> None:
    db = SessionLocal()
    try:
        tx = db.query(Transaction).filter(Transaction.id == UUID(str(tx_id))).first()
        if not tx or tx.status != "pending":
            return
        description = tx.desc or tx.merchant or ""
        try:
            raw = predict_category_with_ai(description, float(tx.amount))
            category, confidence = normalize_category(raw)
            source = "ai"
        except Exception as ai_error:
            print(f"AI categorization failed, using rules: {ai_error}")
            category = predict_category(description, float(tx.amount))
            category, confidence = normalize_category(category)
            confidence = min(confidence, 0.55)
            source = "rules"
        tx.category = category
        tx.category_source = source
        tx.ai_confidence = confidence
        tx.status = "ready"
        if category == "salary":
            tx.tx_type = "income"
        db.commit()
        db.refresh(tx)
        publish_month(db, tx.user_id, tx.date.strftime("%Y-%m"), tx)
    except Exception as exc:
        db.rollback()
        print(f"Error categorizing transaction {tx_id}: {exc}")
        raise
    finally:
        db.close()
