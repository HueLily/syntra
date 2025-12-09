
import json
from datetime import datetime

def audit_log(user_role: str, user_region: str, prompt: str, sql: str, row_count: int, policies: dict, logfile: str = "audit.log"):
    record = {
        "ts": datetime.utcnow().isoformat(),
        "role": user_role,
        "region": user_region,
        "prompt": prompt,
        "sql": sql,
        "row_count": row_count,
        "policies": policies
    }
    with open(logfile, "a") as f:
        f.write(json.dumps(record) + "\n")
