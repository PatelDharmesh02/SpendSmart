from app.db.session import Base, engine
from app.models import budgets, goal, insight, job, refresh_token, transactions, user  # noqa: F401


def init_db():
    Base.metadata.create_all(bind=engine)
