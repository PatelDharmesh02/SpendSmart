import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _origin() -> str:
    return os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").rstrip("/")


@dataclass(frozen=True)
class Settings:
    database_url: str
    secret_key: str
    frontend_origin: str
    oauth_redirect_base: str
    redis_url: str
    google_client_id: str
    google_client_secret: str
    github_client_id: str
    github_client_secret: str
    access_token_minutes: int = 15
    refresh_token_days: int = 7

    @property
    def cookie_secure(self) -> bool:
        return self.frontend_origin.startswith("https")


def load_settings() -> Settings:
    origin = _origin()
    return Settings(
        database_url=os.getenv("DATABASE_URL", "sqlite://"),
        secret_key=os.getenv("SECRET_KEY", "spendsmart_secret_key"),
        frontend_origin=origin,
        oauth_redirect_base=os.getenv("OAUTH_REDIRECT_BASE", origin).rstrip("/"),
        redis_url=os.getenv("REDIS_URL", ""),
        google_client_id=os.getenv("GOOGLE_CLIENT_ID", ""),
        google_client_secret=os.getenv("GOOGLE_CLIENT_SECRET", ""),
        github_client_id=os.getenv("GITHUB_CLIENT_ID", ""),
        github_client_secret=os.getenv("GITHUB_CLIENT_SECRET", ""),
    )


settings = load_settings()
