from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional

class TransactionCreate(BaseModel):
    amount: float
    category: str
    date: date
    note: Optional[str] = None

class TransactionOut(BaseModel):
    id: UUID
    amount: float
    category: str
    date: date
    note: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
