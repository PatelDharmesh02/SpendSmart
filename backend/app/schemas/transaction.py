from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TransactionCreate(BaseModel):
    amount: float
    category: str = "auto"
    date: date
    desc: Optional[str] = None
    merchant: Optional[str] = None
    tx_type: str = "expense"


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None
    desc: Optional[str] = None
    merchant: Optional[str] = None
    tx_type: Optional[str] = None


class TransactionOut(BaseModel):
    id: UUID
    amount: float
    category: str
    date: date
    desc: Optional[str] = None
    merchant: Optional[str] = None
    tx_type: str = "expense"
    category_source: str = "user"
    ai_confidence: Optional[float] = None
    status: str = "ready"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionPage(BaseModel):
    items: list[TransactionOut]
    total: int
    page: int
    page_size: int


class TransactionSummaryOut(BaseModel):
    month: str
    total_spent: float
    category_breakdown: dict

    model_config = ConfigDict(from_attributes=True)


class CsvImport(BaseModel):
    csv_text: str = Field(min_length=1)
