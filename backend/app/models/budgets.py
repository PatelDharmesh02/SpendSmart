import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, UniqueConstraint, Index
from sqlalchemy import Uuid
from sqlalchemy.orm import relationship

from app.db.session import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    month = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="budgets")

    __table_args__ = (
        UniqueConstraint("user_id", "category", "month", name="uq_budget_user_cat_month"),
        Index("ix_budgets_user_month", "user_id", "month"),
    )
