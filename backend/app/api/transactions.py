from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.transactions import Transaction
from app.schemas.transaction import TransactionCreate, TransactionOut, TransactionSummaryOut
from app.schemas.common import MessageResponse
from app.models.user import User
from typing import List
from uuid import UUID
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    tx: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_tx = Transaction(**tx.dict(), user_id=current_user.id)
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx


@router.get("/", response_model=List[TransactionOut])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.date.desc()).all()


@router.delete("/{tx_id}", status_code=200, response_model=MessageResponse)
def delete_transaction(
    tx_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully!"}

@router.get("/summary", response_model=TransactionSummaryOut)
def get_monthly_summary(
    month: str = Query(..., description="Month in YYYY-MM format", example="2023-10"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):
    try:
        start_date = datetime.strptime(month, "%Y-%m").date()
        end_date = datetime(start_date.year, start_date.month + 1, 1).date() \
            if start_date.month != 12 else datetime(start_date.year + 1, 1, 1).date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")
    
    # Query the database for transactions in the specified month
    results = (
        db.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total_spent")
        ).filter(
            Transaction.user_id == current_user.id,
            Transaction.date >= start_date,
            Transaction.date < end_date
        ).group_by(
            Transaction.category
        ).all()
    )
    
    category_breakdown = {r.category: round(r.total_spent, 2) for r in results}
    total_spent = sum(category_breakdown.values())
    
    return TransactionSummaryOut(
        month=month,
        total_spent=round(total_spent, 2),
        category_breakdown=category_breakdown
    )