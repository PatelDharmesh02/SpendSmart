import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["RUN_MIGRATIONS"] = "0"
os.environ["REDIS_URL"] = ""
os.environ["FRONTEND_ORIGIN"] = "http://localhost:3000"
os.environ["OAUTH_REDIRECT_BASE"] = "http://localhost:3000"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.db.session import Base, engine
from app.main import app
from app.models import budgets, goal, insight, job, monthly_income, refresh_token, transactions, user  # noqa: F401


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def db_session():
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
