import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy import Uuid
from sqlalchemy.orm import relationship

from app.db.session import Base


class Insight(Base):
    __tablename__ = "insights"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    month = Column(String, nullable=False)
    prompt_hash = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="insights")

    __table_args__ = (UniqueConstraint("user_id", "month", name="uq_insight_user_month"),)
