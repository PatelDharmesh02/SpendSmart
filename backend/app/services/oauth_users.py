from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User


def upsert_oauth_user(db: Session, *, email: str, name: str, provider: str, provider_id: str) -> User:
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    if user:
        user.provider_id = provider_id
        if user.password is None and user.auth_provider == "password":
            user.auth_provider = provider
        if name and not user.name:
            user.name = name
        db.commit()
        db.refresh(user)
        return user
    user = User(
        name=name or email.split("@")[0],
        email=email.lower(),
        password=None,
        auth_provider=provider,
        provider_id=provider_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
