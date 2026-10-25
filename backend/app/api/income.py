from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.monthly_income import MonthlyIncome
from app.models.user import User
from app.services.events import publish_month
from app.services.finance import money
from app.services.periods import month_bounds

router = APIRouter()


class IncomeWrite(BaseModel):
    month: str
    amount: float
    description: str | None = None


class IncomeRead(BaseModel):
    month: str
    amount: float
    description: str | None = None


@router.put("", response_model=IncomeRead)
def set_monthly_income(
    body: IncomeWrite,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        month_bounds(body.month)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")
    if body.amount < 0:
        raise HTTPException(status_code=400, detail="Amount cannot be negative.")

    row = (
        db.query(MonthlyIncome)
        .filter(MonthlyIncome.user_id == current_user.id, MonthlyIncome.month == body.month)
        .first()
    )
    description = (body.description or "").strip() or None
    if row:
        row.amount = money(body.amount)
        row.description = description
    else:
        row = MonthlyIncome(
            user_id=current_user.id,
            month=body.month,
            amount=money(body.amount),
            description=description,
        )
        db.add(row)
    db.commit()
    db.refresh(row)
    publish_month(db, current_user.id, body.month)
    return {"month": row.month, "amount": float(row.amount), "description": row.description}
