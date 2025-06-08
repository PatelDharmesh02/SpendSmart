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
        orm_mode = True
