from uuid import UUID

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.jwt import decode_access_token
from app.db.deps import get_db
from app.models.user import User
from app.services.sessions import parse_user_id


def _cookie_values(request: Request, name: str) -> list[str]:
    raw = request.headers.get("cookie") or ""
    values = []
    for part in raw.split(";"):
        if "=" not in part:
            continue
        key, value = part.split("=", 1)
        if key.strip() == name and value.strip():
            values.append(value.strip())
    return values


def get_token(request: Request) -> str:
    candidates: list[str] = []
    header = request.headers.get("Authorization")
    if header and header.lower().startswith("bearer "):
        bearer = header.split(" ", 1)[1].strip()
        if bearer and bearer.lower() != "undefined":
            candidates.append(bearer)
    candidates.extend(_cookie_values(request, "access_token"))
    for token in candidates:
        payload = decode_access_token(token)
        if payload and payload.get("type") in (None, "access"):
            return token
    if candidates:
        raise HTTPException(status_code=401, detail="Invalid token")
    raise HTTPException(status_code=401, detail="Not authenticated")


def get_current_user(token: str = Depends(get_token), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload or payload.get("type") not in (None, "access"):
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") == "ws":
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    try:
        parsed: UUID = parse_user_id(user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == parsed).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
