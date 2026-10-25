from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.budget import BudgetCompare, BudgetOut
from app.schemas.transaction import TransactionOut


class GoalWrite(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0
    deadline: date | None = None


class GoalPatch(BaseModel):
    name: str | None = None
    target_amount: float | None = None
    current_amount: float | None = None
    deadline: date | None = None


class GoalRead(BaseModel):
    id: UUID
    name: str
    target_amount: float
    current_amount: float
    deadline: date | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardOut(BaseModel):
    month: str
    income: float
    monthly_income: float | None = None
    income_description: str | None = None
    expenses: float
    net: float
    savings_rate: float
    budget_health: float
    category_breakdown: dict[str, float]
    budget_vs_actual: list[BudgetCompare]
    transactions: list[TransactionOut]
    budgets: list[BudgetOut]


class InsightOut(BaseModel):
    month: str
    summary: str | None = None
    generated_at: datetime | None = None
    cached: bool = False


class JobOut(BaseModel):
    id: UUID
    type: str
    status: str
    error: str | None = None

    model_config = ConfigDict(from_attributes=True)
