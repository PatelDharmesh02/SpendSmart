from app.core.celery_app import celery_app
from app.services.categorizer import categorize_transaction_record
from app.services.insights import generate_monthly_insight


@celery_app.task(name="categorize_transaction")
def categorize_transaction(tx_id: str) -> None:
    categorize_transaction_record(tx_id)


@celery_app.task(name="generate_monthly_insight")
def generate_monthly_insight_task(user_id: str, month: str, job_id: str | None = None, force: bool = True) -> None:
    generate_monthly_insight(user_id, month, job_id=job_id, force=force)


def enqueue_categorize(tx_id: str) -> None:
    categorize_transaction.delay(str(tx_id))


def enqueue_insight(user_id: str, month: str, job_id: str) -> None:
    generate_monthly_insight_task.delay(str(user_id), month, str(job_id), True)
