from app.services.oauth_users import upsert_oauth_user


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
