from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.session import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    month = Column(String, nullable=False)  # format: YYYY-MM
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="budgets")
