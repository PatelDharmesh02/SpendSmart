from datetime import datetime, timedelta
from typing import Union

from jose import JWTError, jwt

from app.core.config import settings

ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_minutes))
    to_encode.update({"exp": expire, "type": to_encode.get("type", "access")})
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)


def create_ws_ticket(user_id: str) -> str:
    return create_access_token(
        {"sub": user_id, "type": "ws"},
        expires_delta=timedelta(seconds=60),
    )


def decode_access_token(token: str):
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError:
        return None
