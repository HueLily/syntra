from typing import Any, List, Literal, Optional
from fastapi import FastAPI
from pydantic import BaseModel
import time

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SynTra Mock API", version="0.1.0")

# CORS: allow your Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

class QueryRequest(BaseModel):
    prompt: str
    user_id: Optional[str] = None
    role: Optional[str] = None

class Explanation(BaseModel):
    filters_applied: List[str] = []
    masked_columns: List[str] = []
    limit: Optional[int] = None
    notes: Optional[str] = None

class QueryResponse(BaseModel):
    status: Literal["mock"] = "mock"
    is_mock: bool = True
    sql: str
    explanation: Explanation
    columns: List[str]
    rows: List[List[Any]]
    row_count: int
    latency_ms: int

@app.get("/")
def root():
    return {"is mock data": True, "service": "syntra-mock"}

def mock_llm_sql(prompt: str, limit: Optional[int] = 10) -> str:
    # Pretend to transform NL→SQL safely (no DB yet)
    # Keep it clearly mocked and SELECT-only
    limit_clause = f"LIMIT {limit}" if limit else ""
    return (
        f"-- MOCK SQL generated for prompt: {prompt}\n"
        "SELECT state, AVG(order_total) AS avg_order "
        "FROM orders "
        "WHERE order_date >= '2025-04-01' AND order_date < '2025-07-01' "
        "GROUP BY state "
        f"{limit_clause};"
    )  

@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest) -> QueryResponse:
    t0 = time.monotonic()
    sql = mock_llm_sql(req.prompt)

    # Fabricate deterministic mock rows
    columns = ["state", "avg_order"]
    rows = [["IN", 52.14], ["IL", 48.91], ["OH", 45.07]]
    latency_ms = int((time.monotonic() - t0) * 1000)

    return QueryResponse(
        sql=sql,
        explanation=Explanation(
            filters_applied=["(mock) demo filter would go here based on role"],
            masked_columns=[],
            limit=10,
            notes="This is MOCK data for CP2."
        ),
        columns=columns,
        rows=rows,
        row_count=len(rows),
        latency_ms=latency_ms
    )
@app.post("/query/all", response_model=QueryResponse)
def query_all(req: QueryRequest) -> QueryResponse:
    """Larger mock dataset for Export All CSV"""
    t0 = time.monotonic()
    sql = mock_llm_sql(req.prompt, limit=None)

    columns = ["state", "avg_order"]
    rows = [
        ["IN", 52.14], ["IL", 48.91], ["OH", 45.07], ["MI", 44.20],
        ["WI", 43.50], ["MN", 46.10], ["IA", 41.32], ["MO", 40.85],
        ["KS", 39.44], ["NE", 38.92],
    ]
    latency_ms = int((time.monotonic() - t0) * 1000)

    return QueryResponse(
        sql=sql,
        explanation=Explanation(
            filters_applied=["mock full dataset (no LIMIT)"],
            limit=None,
            notes="Mock large dataset for full export."
        ),
        columns=columns,
        rows=rows,
        row_count=len(rows),
        latency_ms=latency_ms
    )
