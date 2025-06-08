from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.transactions import Transaction
from app.schemas.transaction import TransactionCreate, TransactionOut
from app.schemas.common import MessageResponse
from app.models.user import User
from typing import List
from uuid import UUID

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
