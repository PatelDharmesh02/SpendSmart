def _auth(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Ava", "email": "ava@example.com", "password": "secret12"},
    )


def test_auto_category_uses_rules_when_no_worker(client, monkeypatch):
    _auth(client)

    def fail_ai(*args, **kwargs):
        raise RuntimeError("model unavailable")

    monkeypatch.setattr("app.services.categorizer.predict_category_with_ai", fail_ai)
    created = client.post(
        "/api/v1/transactions",
        json={
            "amount": 40,
            "category": "auto",
            "date": "2026-10-03",
            "desc": "Cafe lunch",
            "tx_type": "expense",
        },
    )
    assert created.status_code == 201
    body = created.json()
    assert body["category"] == "food"
    assert body["status"] == "ready"
    assert body["category_source"] == "rules"
