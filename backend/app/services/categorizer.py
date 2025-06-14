from app.db.session import SessionLocal
from app.models.transactions import Transaction
from app.ai.predict_category import predict_category, predict_category_by_openai


def auto_categorize_transaction(tx_id: int):
    db = SessionLocal()
    try:
        tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
        if tx:
            predicted = predict_category(tx.desc, tx.amount)
            tx.category = predicted
            db.commit()
    finally:
        db.close()
