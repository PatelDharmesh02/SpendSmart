import csv
import io
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.transactions import Transaction
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.transaction import (
    CsvImport,
    TransactionCreate,
    TransactionOut,
    TransactionPage,
    TransactionSummaryOut,
    TransactionUpdate,
)
from app.services.events import publish_month
from app.services.finance import build_month_snapshot, money
from app.services.periods import month_bounds
from app.tasks import enqueue_categorize

router = APIRouter()


def _apply_category(tx: Transaction, category: str) -> None:
    normalized = (category or "auto").strip().lower()
    if normalized == "auto":
        tx.category = "pending"
        tx.category_source = "ai"
        tx.status = "pending"
        tx.ai_confidence = None
        return
    tx.category = normalized
    tx.category_source = "user"
    tx.status = "ready"
    if normalized == "salary":
        tx.tx_type = "income"


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(
    tx: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx_type = tx.tx_type if tx.tx_type in ("income", "expense") else "expense"
    new_tx = Transaction(
        user_id=current_user.id,
        desc=tx.desc,
        merchant=tx.merchant,
        amount=money(tx.amount),
        date=tx.date or date.today(),
        category="pending",
        tx_type=tx_type,
        category_source="user",
        status="ready",
    )
    _apply_category(new_tx, tx.category)
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    publish_month(db, current_user.id, new_tx.date.strftime("%Y-%m"), new_tx)
    if new_tx.status == "pending":
        enqueue_categorize(str(new_tx.id))
        db.expire(new_tx)
        db.refresh(new_tx)
    return new_tx


@router.post("/import", response_model=MessageResponse)
def import_transactions(
    body: CsvImport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reader = csv.DictReader(io.StringIO(body.csv_text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV needs a header row")
    fields = {name.strip().lower() for name in reader.fieldnames}
    if not {"date", "amount", "description"} <= fields:
        raise HTTPException(status_code=400, detail="CSV columns required: date, amount, description")
    created = 0
    months = set()
    for row in reader:
        normalized = {key.strip().lower(): (value or "").strip() for key, value in row.items() if key}
        if not normalized.get("date") or not normalized.get("amount"):
            continue
        try:
            tx_date = date.fromisoformat(normalized["date"])
            amount = money(normalized["amount"])
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid row: {normalized}")
        tx_type = normalized.get("type") or "expense"
        if tx_type not in ("income", "expense"):
            tx_type = "expense"
        category = normalized.get("category") or "auto"
        new_tx = Transaction(
            user_id=current_user.id,
            desc=normalized.get("description"),
            amount=amount,
            date=tx_date,
            category="pending",
            tx_type=tx_type,
        )
        _apply_category(new_tx, category)
        db.add(new_tx)
        db.flush()
        months.add((tx_date.strftime("%Y-%m"), new_tx.id if new_tx.status == "pending" else None))
        created += 1
    db.commit()
    published = set()
    for month, pending_id in months:
        if pending_id:
            enqueue_categorize(str(pending_id))
        if month not in published:
            publish_month(db, current_user.id, month)
            published.add(month)
    return {"message": f"Imported {created} transactions"}


@router.get("", response_model=TransactionPage)
def get_transactions(
    month: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    tx_type: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if month:
        start, end = month_bounds(month)
        query = query.filter(Transaction.date >= start, Transaction.date < end)
    if tx_type in ("income", "expense"):
        query = query.filter(Transaction.tx_type == tx_type)
    if category:
        query = query.filter(Transaction.category == category.lower())
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            (Transaction.desc.ilike(like)) | (Transaction.merchant.ilike(like)) | (Transaction.category.ilike(like))
        )
    total = query.count()
    items = (
        query.order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/by-month", response_model=list[TransactionOut])
def get_transactions_by_month(
    month: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start, end = month_bounds(month)
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id, Transaction.date >= start, Transaction.date < end)
        .order_by(Transaction.date.desc())
        .all()
    )


@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(
    tx_id: UUID,
    body: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    data = body.model_dump(exclude_unset=True)
    if "amount" in data and data["amount"] is not None:
        tx.amount = money(data["amount"])
    if "date" in data and data["date"] is not None:
        tx.date = data["date"]
    if "desc" in data:
        tx.desc = data["desc"]
    if "merchant" in data:
        tx.merchant = data["merchant"]
    if "tx_type" in data and data["tx_type"] in ("income", "expense"):
        tx.tx_type = data["tx_type"]
    if "category" in data and data["category"]:
        _apply_category(tx, data["category"])
    db.commit()
    db.refresh(tx)
    publish_month(db, current_user.id, tx.date.strftime("%Y-%m"), tx)
    if tx.status == "pending":
        enqueue_categorize(str(tx.id))
        db.expire(tx)
        db.refresh(tx)
    return tx


@router.delete("/{tx_id}", response_model=MessageResponse)
def delete_transaction(
    tx_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    month = tx.date.strftime("%Y-%m")
    db.delete(tx)
    db.commit()
    publish_month(db, current_user.id, month)
    return {"message": "Transaction deleted successfully!"}


@router.get("/summary", response_model=TransactionSummaryOut)
def get_monthly_summary(
    month: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        snapshot = build_month_snapshot(db, current_user.id, month)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")
    return TransactionSummaryOut(
        month=month,
        total_spent=snapshot["expenses"],
        category_breakdown=snapshot["category_breakdown"],
    )
