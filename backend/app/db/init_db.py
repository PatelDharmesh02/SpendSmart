from app.db.session import engine
from app.models.user import User
from app.models.budgets import Budget
from app.models.transactions import Transaction
from app.db.session import Base

def init_db():
    Base.metadata.create_all(bind=engine)
