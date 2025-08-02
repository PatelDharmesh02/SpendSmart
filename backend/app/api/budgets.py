from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import Query
from sqlalchemy import func
from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.budgets import Budget
from app.models.transactions import Transaction
from app.schemas.budget import BudgetCreate, BudgetOut, BudgetCompare
from app.schemas.common import MessageResponse
from app.models.user import User
from typing import List
from uuid import UUID
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=BudgetOut, status_code=201)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget_data = budget.model_dump()
    budget_data['category'] = budget.category.lower()
    new_budget = Budget(**budget_data, user_id=current_user.id)
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


@router.get("/by-month", response_model=List[BudgetOut])
def get_budgets_by_month(
    month: str = Query(..., description="Month in YYYY-MM format", example="2025-06"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
): 
    return db.query(Budget).filter(
        Budget.user_id == current_user.id, 
        Budget.month == month
    ).all()


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

@router.get("/compare", response_model=List[BudgetCompare])
def compare_budgets(
    month: str = Query(..., description="Month in YYYY-MM format", example="2025-06"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        start_date = datetime.strptime(month, "%Y-%m").date()
        end_date = datetime(start_date.year, start_date.month + 1, 1).date() \
            if(start_date.month != 12) else datetime(start_date.year + 1, 1, 1).date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")
    
    # Fetch budgets for the specified month
    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == month
        )
        .all()
    )
    
    # Fetch spend per category for that month
    tx_summary = (
        db.query(Transaction.category, func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.date >= start_date,
            Transaction.date < end_date
        )
        .group_by(Transaction.category)
        .all()
    )
    
    # Map category -> spend
    spent_by_category = {cat: amount for cat, amount in tx_summary}
    
    
    merged_budgets = {}
    for b in budgets:
        cat = b.category
        if cat in merged_budgets:
            merged_budgets[cat] += b.amount
        else:
            merged_budgets[cat] = b.amount
            
    
    result = []
    for cat, budgeted in merged_budgets.items():
        spent = spent_by_category.get(cat, 0)
        result.append(
            BudgetCompare(
                category=cat,
                budgeted=budgeted,
                spent=spent,
                remaining=budgeted - spent
            )
        )

    return result