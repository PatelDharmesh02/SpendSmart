def _auth(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Ava", "email": "ava@example.com", "password": "secret12"},
    )


def test_budget_versus_actual_math(client):
    _auth(client)
    client.post(
        "/api/v1/transactions/",
        json={
            "amount": 80000,
            "category": "salary",
            "date": "2026-10-01",
            "desc": "Payroll",
            "tx_type": "income",
        },
    )
    client.post(
        "/api/v1/transactions/",
        json={
            "amount": 1200,
            "category": "groceries",
            "date": "2026-10-02",
            "desc": "Market",
            "tx_type": "expense",
        },
    )
    client.post(
        "/api/v1/budgets/",
        json={"category": "groceries", "amount": 2000, "month": "2026-10"},
    )
    dashboard = client.get("/api/v1/dashboard", params={"month": "2026-10"})
    assert dashboard.status_code == 200
    body = dashboard.json()
    assert body["income"] == 80000
    assert body["expenses"] == 1200
    assert body["net"] == 78800
    assert body["budget_vs_actual"] == [
        {"category": "groceries", "budgeted": 2000, "spent": 1200, "remaining": 800}
    ]
    assert body["budget_health"] == 100


def test_dashboard_is_one_payload(client):
    _auth(client)
    response = client.get("/api/v1/dashboard", params={"month": "2026-10"})
    assert response.status_code == 200
    body = response.json()
    assert "transactions" in body and "budgets" in body and "category_breakdown" in body
