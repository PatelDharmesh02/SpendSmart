from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "spendsmart",
    broker=settings.redis_url or "redis://localhost:6379/0",
    backend=settings.redis_url or None,
)
celery_app.conf.update(
    task_always_eager=not bool(settings.redis_url),
    task_eager_propagates=True,
    task_ignore_result=True,
    broker_connection_retry_on_startup=True,
)
