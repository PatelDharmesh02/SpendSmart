from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.budgets import Budget
from app.models.transactions import Transaction
from app.models.user import User
from datetime import datetime
from app.services.summarizer import summarize_budgets, summarize_transactions
from app.ai.ai_summary import generate_summary, generate_summary_with_ai

router = APIRouter()

@router.get("/summary")
def get_monthly_summary(
    month: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        start_date = datetime.strptime(month, "%Y-%m").date()
        end_date = datetime(start_date.year, start_date.month + 1, 1).date() \
            if start_date.month != 12 else datetime(start_date.year + 1, 1, 1).date()
    except:
        raise HTTPException(400, "Invalid month format")

    # 1. Fetch transactions
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= start_date,
        Transaction.date < end_date
    ).all()

    # 2. Fetch budgets
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == month
    ).all()

    if not transactions:
        return { "summary": "No transactions found for this month." }
    
    tx_summary = summarize_transactions(transactions)
    budget_data = summarize_budgets(budgets)
    
    try:
        # Use AI to generate summary
        summary = generate_summary_with_ai(month, tx_summary, budget_data)
    except Exception as ai_error:
        # Fallback to rule-based summary if AI fails
        print(f"AI summary generation failed: {str(ai_error)}. Using fallback.")
        summary = generate_summary(month, tx_summary, budget_data)
    
    return { "summary": summary }
