from pydantic import BaseModel, EmailStr, constr
from datetime import datetime
from uuid import UUID


class UserRegister(BaseModel):
    email: EmailStr
    password: constr(min_length=6)
    name: str

class UserPublic(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    created_at: datetime

    class Config:   
        from_attributes = True
        

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
