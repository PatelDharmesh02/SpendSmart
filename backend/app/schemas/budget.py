from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class BudgetCreate(BaseModel):
    category: str
    amount: float
    month: str


class BudgetOut(BaseModel):
    id: UUID
    category: str
    amount: float
    month: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BudgetCompare(BaseModel):
    category: str
    budgeted: float
    spent: float
    remaining: float
