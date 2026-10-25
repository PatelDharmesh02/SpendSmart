from app.core.celery_app import celery_app
from app.core.config import settings
from app.services.categorizer import categorize_transaction_record
from app.services.insights import generate_monthly_insight


@celery_app.task(name="categorize_transaction")
def categorize_transaction(tx_id: str) -> None:
    categorize_transaction_record(tx_id)


@celery_app.task(name="generate_monthly_insight")
def generate_monthly_insight_task(user_id: str, month: str, job_id: str | None = None, force: bool = True) -> None:
    generate_monthly_insight(user_id, month, job_id=job_id, force=force)


def enqueue_categorize(tx_id: str) -> None:
    if _workers_online():
        categorize_transaction.delay(str(tx_id))
        return
    # No worker is consuming the queue, so the row would stay pending.
    categorize_transaction_record(str(tx_id))


def _workers_online() -> bool:
    if not settings.redis_url:
        return False
    try:
        inspector = celery_app.control.inspect(timeout=0.5)
        if inspector is None:
            return False
        return bool(inspector.ping())
    except Exception:
        return False


def enqueue_insight(user_id: str, month: str, job_id: str) -> None:
    if _workers_online():
        generate_monthly_insight_task.delay(str(user_id), month, str(job_id), True)
        return
    # No worker is consuming the queue, so a queued job would stay queued
    # and the insights page would poll forever.
    generate_monthly_insight(str(user_id), month, job_id=str(job_id), force=True)
