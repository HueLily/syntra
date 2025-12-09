import pytest
from app.guard import apply_guardrails, GuardrailError

def test_safe_query_passes():
    sql = "SELECT customer_name, SUM(amount) AS total_revenue FROM orders GROUP BY customer_name"
    safe = apply_guardrails(sql, role="analyst", region="All")
    assert "LIMIT" in safe
    assert "users.role" in safe

def test_malicious_query_blocked():
    sql = "DROP TABLE orders;"
    with pytest.raises(GuardrailError):
        apply_guardrails(sql, role="analyst", region="All")

def test_region_filter_injected():
    sql = "SELECT customer_name FROM orders"
    safe = apply_guardrails(sql, role="analyst", region="Midwest")
    assert "users.region = :region" in safe

def test_limit_enforced():
    sql = "SELECT customer_name FROM orders"
    safe = apply_guardrails(sql, role="analyst", region="All")
    assert "LIMIT" in safe
