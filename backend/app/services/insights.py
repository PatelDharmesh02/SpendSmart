import hashlib
import json

from uuid import UUID

from app.ai.ai_summary import generate_summary, generate_summary_with_ai
from app.db.session import SessionLocal
from app.models.budgets import Budget
from app.models.insight import Insight
from app.models.job import Job
from app.models.transactions import Transaction
from app.models.user import User
from app.services.periods import month_bounds
from app.services.summarizer import summarize_budgets, summarize_transactions


def prompt_hash(tx_summary: dict, budget_data: list) -> str:
    payload = json.dumps({"tx": tx_summary, "budgets": budget_data}, default=str, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def month_inputs(db, user_id, month: str):
    start, end = month_bounds(month)
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.date >= start,
            Transaction.date < end,
            Transaction.tx_type != "income",
        )
        .all()
    )
    budgets = db.query(Budget).filter(Budget.user_id == user_id, Budget.month == month).all()
    tx_summary = summarize_transactions(transactions)
    budget_data = summarize_budgets(budgets)
    return transactions, tx_summary, budget_data


def _uuid(value) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


def generate_monthly_insight(user_id: str, month: str, job_id: str | None = None, force: bool = False) -> str | None:
    db = SessionLocal()
    user_uuid = _uuid(user_id)
    job = db.query(Job).filter(Job.id == _uuid(job_id)).first() if job_id else None
    try:
        if job:
            job.status = "running"
            db.commit()
        existing = (
            db.query(Insight).filter(Insight.user_id == user_uuid, Insight.month == month).first()
        )
        user = db.query(User).filter(User.id == user_uuid).first()
        if not user:
            return None
        transactions, tx_summary, budget_data = month_inputs(db, user_uuid, month)
        digest = prompt_hash(tx_summary, budget_data)
        if existing and not force and existing.prompt_hash == digest:
            if job:
                job.status = "done"
                db.commit()
            return existing.summary
        if not transactions:
            summary = "No transactions found for this month."
        else:
            try:
                summary = generate_summary_with_ai(month, tx_summary, budget_data, user.name)
            except Exception as ai_error:
                print(f"AI summary failed, using rules: {ai_error}")
                summary = generate_summary(month, tx_summary, budget_data, user.name)
        if existing:
            existing.summary = summary
            existing.prompt_hash = digest
        else:
            db.add(
                Insight(
                    user_id=user.id,
                    month=month,
                    prompt_hash=digest,
                    summary=summary,
                )
            )
        if job:
            job.status = "done"
        db.commit()
        return summary
    except Exception as exc:
        db.rollback()
        if job:
            job.status = "failed"
            job.error = str(exc)
            db.commit()
        raise
    finally:
        db.close()
