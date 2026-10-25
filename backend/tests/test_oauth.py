from app.models.user import User
from app.services.oauth_users import upsert_oauth_user
from app.services.sessions import issue_oauth_handoff


def test_oauth_links_existing_email(db_session):
    created = upsert_oauth_user(
        db_session,
        email="ada@example.com",
        name="Ada",
        provider="google",
        provider_id="google-1",
    )
    linked = upsert_oauth_user(
        db_session,
        email="Ada@example.com",
        name="Ada Lovelace",
        provider="github",
        provider_id="github-9",
    )
    assert created.id == linked.id
    assert linked.provider_id == "github-9"
    assert linked.auth_provider == "google"


def test_oauth_handoff_sets_frontend_cookies_once(client, db_session):
    user = User(name="Ada", email="ada-oauth@example.com", auth_provider="google", provider_id="g1")
    db_session.add(user)
    db_session.commit()
    code = issue_oauth_handoff(db_session, user)

    first = client.post("/api/v1/auth/oauth/complete", json={"code": code})
    assert first.status_code == 200
    cookies = first.headers.get_list("set-cookie")
    assert any(item.startswith("access_token=") for item in cookies)
    assert any(item.startswith("refresh_token=") for item in cookies)

    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "ada-oauth@example.com"

    second = client.post("/api/v1/auth/oauth/complete", json={"code": code})
    assert second.status_code == 401
