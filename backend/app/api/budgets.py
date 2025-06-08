from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.budgets import Budget
from app.schemas.budget import BudgetCreate, BudgetOut
from app.schemas.common import MessageResponse
from app.models.user import User
from typing import List
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=BudgetOut, status_code=201)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_budget = Budget(**budget.dict(), user_id=current_user.id)
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget


@router.get("/", response_model=List[BudgetOut])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Budget).filter(Budget.user_id == current_user.id).all()


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: UUID,
    update_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    for field, value in update_data.dict().items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)
    return budget

@router.delete("/{budget_id}", status_code=200, response_model=MessageResponse)
def delete_budget(
    budget_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully!"}