from app.db.session import SessionLocal
from app.models.transactions import Transaction
from app.ai.predict_category import predict_category, predict_category_with_ai

def auto_categorize_transaction(tx_id: int):
    db = SessionLocal()
    try:
        tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
        if not tx:
            return
        
        # Try AI prediction exactly once
        try:
            predicted = predict_category_with_ai(tx.desc, tx.amount)
        except Exception as ai_error:
            # Immediate fallback to rule-based if AI fails
            print(f"AI prediction failed (single attempt), using fallback: {str(ai_error)}")
            predicted = predict_category(tx.desc, tx.amount)
        
        # Update transaction
        tx.category = predicted
        db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"Error categorizing transaction {tx_id}: {str(e)}")
        raise
    finally:
        db.close()