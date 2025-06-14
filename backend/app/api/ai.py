from fastapi import APIRouter, Depends, HTTPException, Query
import openai
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.budgets import Budget
from app.models.transactions import Transaction
from app.models.user import User
from datetime import datetime
from app.services import build_prompt
from app.services.summarizer import summarize_budgets, summarize_transactions

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

    # 3. Prepare data for GPT
    tx_summary = summarize_transactions(transactions)
    budget_data = summarize_budgets(budgets)

    # 4. Generate prompt
    prompt = build_prompt(month, tx_summary, budget_data)

    # 5. Call GPT
    gpt_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{ "role": "user", "content": prompt }],
        temperature=0.5,
        max_tokens=300,
    )

    return { "summary": gpt_response.choices[0].message.content.strip() }
