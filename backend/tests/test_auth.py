def test_register_login_and_me(client):
    registered = client.post(
        "/api/v1/auth/register",
        json={"name": "Ava", "email": "ava@example.com", "password": "secret12"},
    )
    assert registered.status_code == 201
    assert registered.json()["user"]["email"] == "ava@example.com"
    assert registered.json()["access_token"]
    assert "access_token" in registered.cookies

    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json()["name"] == "Ava"

    client.post("/api/v1/auth/logout")
    assert client.get("/api/v1/auth/me").status_code == 401

    logged_in = client.post(
        "/api/v1/auth/login",
        json={"email": "ava@example.com", "password": "secret12"},
    )
    assert logged_in.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 200


def test_refresh_rotates_session(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Ava", "email": "ava@example.com", "password": "secret12"},
    )
    client.cookies.delete("access_token")
    refreshed = client.post("/api/v1/auth/refresh")
    assert refreshed.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 200
