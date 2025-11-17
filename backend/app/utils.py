import re

def extract_sql(response: str) -> str:
    """
    Extracts the SQL query from the model's response.
    - Handles multi-line SQL blocks
    - Stops at 'Explanation:' if present
    - Falls back to scanning for the first SELECT line
    """
    # If there's an Explanation section, cut it off
    if "Explanation:" in response:
        response = response.split("Explanation:")[0]

    # Use regex to find the first SELECT ... up to the last semicolon (if any)
    match = re.search(r"(SELECT[\s\S]+?)(;|$)", response, re.IGNORECASE)
    if match:
        return match.group(1).strip()

    # Fallback: scan line by line for SELECT
    for line in response.splitlines():
        if line.strip().upper().startswith("SELECT"):
            return line.strip()

    raise ValueError("No SQL query found in response")

def sanitize_sql(sql: str) -> str:
    forbidden = [" e.ssn", " e.email", " e.phone", " e.salary", "SELECT *", "SELECT e.*"]
    for col in forbidden:
        if col.lower() in sql.lower():
            raise ValueError(f"Unsafe SQL detected: {col.strip()}")
    return sql


