from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class BudgetCreate(BaseModel):
    category: str
    amount: float
    month: str  # "2025-06"

class BudgetOut(BaseModel):
    id: UUID
    category: str
    amount: float
    month: str
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetCompare(BaseModel):
    category: str  # "2025-06"
    budgeted: float
    spent: float
    remaining: float

    class Config:
        from_attributes = True