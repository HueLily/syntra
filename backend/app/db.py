import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy import text

DATABASE_URL = os.getenv("DATABASE_URL")

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=True,  # set True for debugging SQL
    future =True
)

async def fetch_all(sql: str, params: dict | None = None):
    """
    Execute a read-only query and return rows as dicts.
    Use only SELECT statements.
    """
    if not sql.strip().upper().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed.")
    async with engine.connect() as conn:
        result = await conn.execute(text(sql), params or {})
        rows = result.mappings().all()  # returns list of dict-like rows
        return [dict(row) for row in rows]
