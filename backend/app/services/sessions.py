import hashlib
import secrets
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.jwt import create_access_token
from app.models.refresh_token import RefreshToken
from app.models.user import User


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    secure = settings.cookie_secure
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        samesite="lax",
        secure=secure,
        max_age=settings.access_token_minutes * 60,
        path="/",
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        samesite="lax",
        secure=secure,
        max_age=settings.refresh_token_days * 24 * 3600,
        path="/api/v1/auth",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/v1/auth")


def issue_session(response: Response, db: Session, user: User) -> str:
    access = create_access_token({"sub": str(user.id), "type": "access"})
    raw_refresh = secrets.token_urlsafe(48)
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw_refresh),
            expires_at=datetime.utcnow() + timedelta(days=settings.refresh_token_days),
        )
    )
    db.commit()
    set_auth_cookies(response, access, raw_refresh)
    return access


def rotate_refresh(db: Session, raw: str) -> User | None:
    row = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == hash_token(raw), RefreshToken.revoked.is_(False))
        .first()
    )
    if not row or row.expires_at < datetime.utcnow():
        return None
    row.revoked = True
    user = db.query(User).filter(User.id == row.user_id).first()
    db.commit()
    return user


def revoke_refresh(db: Session, raw: str | None) -> None:
    if not raw:
        return
    row = db.query(RefreshToken).filter(RefreshToken.token_hash == hash_token(raw)).first()
    if row:
        row.revoked = True
        db.commit()


def parse_user_id(value: str) -> UUID:
    return UUID(str(value))
