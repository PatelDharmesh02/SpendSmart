def test_transaction_pushes_budget_snapshot(client):
    registered = client.post(
        "/api/v1/auth/register",
        json={"name": "Ava", "email": "ava@example.com", "password": "secret12"},
    )
    ticket = client.get("/api/v1/auth/ws-ticket").json()["ticket"]
    assert registered.status_code == 201
    with client.websocket_connect(f"/ws/v1/budget?ticket={ticket}") as socket:
        created = client.post(
            "/api/v1/transactions/",
            json={
                "amount": 25,
                "category": "food",
                "date": "2026-10-04",
                "desc": "Lunch",
                "tx_type": "expense",
            },
        )
        assert created.status_code == 201
        message = socket.receive_json()
        assert message["type"] == "budget_vs_actual"
        assert message["month"] == "2026-10"
        assert message["expenses"] == 25
        assert message["transaction"]["category"] == "food"
