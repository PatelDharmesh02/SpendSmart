from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str


class UserPublic(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    auth_provider: str = "password"
    provider_id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    user: UserPublic
    access_token: str


class WsTicket(BaseModel):
    ticket: str
