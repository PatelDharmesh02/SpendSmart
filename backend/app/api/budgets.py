from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.budgets import Budget
from app.models.user import User
from app.schemas.budget import BudgetCompare, BudgetCreate, BudgetOut
from app.schemas.common import MessageResponse
from app.services.events import publish_month
from app.services.finance import build_month_snapshot, money

router = APIRouter()


@router.post("", response_model=BudgetOut, status_code=201)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = budget.category.lower()
    existing = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id, Budget.category == category, Budget.month == budget.month)
        .first()
    )
    if existing:
        existing.amount = money(budget.amount)
        db.commit()
        db.refresh(existing)
        publish_month(db, current_user.id, budget.month)
        return existing
    new_budget = Budget(
        category=category,
        amount=money(budget.amount),
        month=budget.month,
        user_id=current_user.id,
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    publish_month(db, current_user.id, budget.month)
    return new_budget


@router.get("", response_model=list[BudgetOut])
def get_budgets(
    month: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Budget).filter(Budget.user_id == current_user.id)
    if month:
        query = query.filter(Budget.month == month)
    return query.order_by(Budget.category.asc()).all()


@router.get("/by-month", response_model=list[BudgetOut])
def get_budgets_by_month(
    month: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id, Budget.month == month)
        .order_by(Budget.category.asc())
        .all()
    )


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: UUID,
    update_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget.category = update_data.category.lower()
    budget.amount = money(update_data.amount)
    budget.month = update_data.month
    db.commit()
    db.refresh(budget)
    publish_month(db, current_user.id, budget.month)
    return budget


@router.delete("/{budget_id}", response_model=MessageResponse)
def delete_budget(
    budget_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    month = budget.month
    db.delete(budget)
    db.commit()
    publish_month(db, current_user.id, month)
    return {"message": "Budget deleted successfully!"}


@router.get("/compare", response_model=list[BudgetCompare])
def compare_budgets(
    month: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        snapshot = build_month_snapshot(db, current_user.id, month)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")
    return snapshot["budget_vs_actual"]
