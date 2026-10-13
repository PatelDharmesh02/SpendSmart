import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Numeric, String, Index
from sqlalchemy import Uuid
from sqlalchemy.orm import relationship

from app.db.session import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    desc = Column(String, nullable=True)
    merchant = Column(String, nullable=True)
    tx_type = Column(String, nullable=False, default="expense", server_default="expense")
    category_source = Column(String, nullable=False, default="user", server_default="user")
    ai_confidence = Column(Float, nullable=True)
    status = Column(String, nullable=False, default="ready", server_default="ready")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="transactions")

    __table_args__ = (Index("ix_transactions_user_date", "user_id", "date"),)
