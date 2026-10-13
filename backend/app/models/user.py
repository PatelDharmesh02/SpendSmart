import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String
from sqlalchemy import Uuid

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)
    auth_provider = Column(String, nullable=False, default="password", server_default="password")
    provider_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
