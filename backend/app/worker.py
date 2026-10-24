from app.core.celery_app import celery_app

# Import tasks so the worker process registers them.
import app.tasks  # noqa: F401, E402

__all__ = ["celery_app"]
