from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional

class TransactionCreate(BaseModel):
    amount: float
    category: str
    date: date
    desc: Optional[str] = None

class TransactionOut(BaseModel):
    id: UUID
    amount: float
    category: str
    date: date
    desc: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
        
class TransactionSummaryOut(BaseModel):
    month: str
    total_spent: float
    category_breakdown: dict

    class Config:
        from_attributes = True
