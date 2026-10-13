from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.jwt import create_ws_ticket
from app.core.oauth import oauth
from app.core.security import hash_password, verify_password
from app.db.deps import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, UserLogin, UserPublic, UserRegister, WsTicket
from app.services.oauth_users import upsert_oauth_user
from app.services.sessions import clear_auth_cookies, issue_session, revoke_refresh, rotate_refresh

router = APIRouter()


def _auth_response(db: Session, user: User, status_code: int = 200) -> JSONResponse:
    response = JSONResponse({}, status_code=status_code)
    access_token = issue_session(response, db, user)
    payload = AuthResponse(
        user=UserPublic.model_validate(user),
        access_token=access_token,
    ).model_dump(mode="json")
    response.body = JSONResponse(payload).body
    response.headers["content-length"] = str(len(response.body))
    return response


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(func.lower(User.email) == user.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        name=user.name,
        email=user.email.lower(),
        password=hash_password(user.password),
        auth_provider="password",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return _auth_response(db, new_user, status_code=status.HTTP_201_CREATED)


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(func.lower(User.email) == user.email.lower()).first()
    if not db_user or not db_user.password or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return _auth_response(db, db_user)


@router.post("/refresh")
def refresh(request: Request, db: Session = Depends(get_db)):
    raw = request.cookies.get("refresh_token")
    if not raw:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    user = rotate_refresh(db, raw)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return _auth_response(db, user)


@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    revoke_refresh(db, request.cookies.get("refresh_token"))
    response = JSONResponse({"message": "Logged out"})
    clear_auth_cookies(response)
    return response


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/ws-ticket", response_model=WsTicket)
def ws_ticket(current_user: User = Depends(get_current_user)):
    return {"ticket": create_ws_ticket(str(current_user.id))}


async def _profile(provider: str, client, token: dict) -> tuple[str, str, str]:
    if provider == "google":
        info = token.get("userinfo") or {}
        if not info:
            resp = await client.get("https://openidconnect.googleapis.com/v1/userinfo", token=token)
            info = resp.json()
        return info.get("email", ""), info.get("name") or "", str(info.get("sub") or "")
    resp = await client.get("user", token=token)
    profile = resp.json()
    email = profile.get("email")
    if not email:
        emails = (await client.get("user/emails", token=token)).json()
        primary = next((item for item in emails if item.get("primary") and item.get("verified")), None)
        email = (primary or (emails[0] if emails else {})).get("email")
    name = profile.get("name") or profile.get("login") or ""
    return email or "", name, str(profile.get("id") or "")


@router.get("/oauth/{provider}")
async def oauth_start(provider: str, request: Request):
    if provider not in ("google", "github"):
        raise HTTPException(status_code=404, detail="Unknown provider")
    client = oauth.create_client(provider)
    if client is None:
        raise HTTPException(status_code=503, detail=f"{provider} OAuth is not configured")
    redirect_uri = f"{settings.oauth_redirect_base}/api/v1/auth/oauth/{provider}/callback"
    return await client.authorize_redirect(request, redirect_uri)


@router.get("/oauth/{provider}/callback")
async def oauth_callback(provider: str, request: Request, db: Session = Depends(get_db)):
    if provider not in ("google", "github"):
        raise HTTPException(status_code=404, detail="Unknown provider")
    client = oauth.create_client(provider)
    if client is None:
        raise HTTPException(status_code=503, detail=f"{provider} OAuth is not configured")
    try:
        token = await client.authorize_access_token(request)
        email, name, provider_id = await _profile(provider, client, token)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"OAuth sign-in failed: {exc}") from exc
    if not email or not provider_id:
        raise HTTPException(status_code=400, detail="Provider did not return an email address")
    user = upsert_oauth_user(db, email=email, name=name, provider=provider, provider_id=provider_id)
    response = RedirectResponse(f"{settings.frontend_origin}/dashboard")
    issue_session(response, db, user)
    return response
