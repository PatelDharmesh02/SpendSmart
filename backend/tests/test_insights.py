from app.services.insights import generate_monthly_insight


def _auth(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Ava", "email": "ava@example.com", "password": "secret12"},
    )


def test_cached_insight_does_not_call_openai(client, monkeypatch):
    _auth(client)
    user_id = client.get("/api/v1/auth/me").json()["id"]
    client.post(
        "/api/v1/transactions",
        json={
            "amount": 40,
            "category": "food",
            "date": "2026-10-03",
            "desc": "Cafe",
            "tx_type": "expense",
        },
    )
    calls = {"n": 0}

    def fake_summary(*args, **kwargs):
        calls["n"] += 1
        return "You spent carefully."

    monkeypatch.setattr("app.services.insights.generate_summary_with_ai", fake_summary)
    generate_monthly_insight(user_id, "2026-10", force=True)
    generate_monthly_insight(user_id, "2026-10", force=False)
    assert calls["n"] == 1

    cached = client.get("/api/v1/ai/summary", params={"month": "2026-10"})
    assert cached.status_code == 200
    assert cached.json()["cached"] is True
    assert calls["n"] == 1
