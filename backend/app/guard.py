import re

class GuardrailError(Exception):
    pass

def apply_guardrails(sql: str, role: str, region: str, max_rows: int = 100) -> str:
    # 1. Block DDL/DML keywords
    forbidden = ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE"]
    for kw in forbidden:
        if re.search(rf"\b{kw}\b", sql, re.IGNORECASE):
            raise GuardrailError("DDL/DML operations are not allowed")

    # 2. Inject filters (role + region) if not already present
    if "users.role" not in sql:
        sql = sql.rstrip(";") + f"\nWHERE users.role = :role"
        if region.lower() != "all":
            sql += " AND users.region = :region"

    # 3. Enforce LIMIT
    if not re.search(r"\bLIMIT\b", sql, re.IGNORECASE):
        sql = sql.rstrip(";") + f"\nLIMIT {max_rows};"

    return sql
