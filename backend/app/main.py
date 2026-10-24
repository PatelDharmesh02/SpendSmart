import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path
import truststore

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api import router as api_router
from app.api.ws import router as ws_router
from app.core.config import settings
from app.services.realtime import hub, listen_redis

truststore.inject_into_ssl()

def run_migrations() -> None:
    if os.getenv("RUN_MIGRATIONS", "1") != "1":
        return
    if not settings.database_url.startswith("postgres"):
        return
    from alembic import command
    from alembic.config import Config

    cfg = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    # ConfigParser treats "%" as interpolation, which breaks a URL-encoded password.
    cfg.set_main_option("sqlalchemy.url", settings.database_url.replace("%", "%%"))
    command.upgrade(cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    hub.loop = asyncio.get_running_loop()
    stop = asyncio.Event()
    listener = asyncio.create_task(listen_redis(stop))
    yield
    stop.set()
    listener.cancel()


app = FastAPI(title="SpendSmart API", version="1.0", lifespan=lifespan)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.secret_key,
    same_site="lax",
    https_only=settings.cookie_secure,
    session_cookie="oauth_session",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/ws/v1")


@app.get("/ping")
async def ping():
    return {"message": "pong"}
