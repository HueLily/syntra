from fastapi import APIRouter

router = APIRouter()

@router.post("/query")
def mock_query(request: dict):
    # Later this will call your LLM — for now, return fake data
    return {
        "sql": "SELECT * FROM employees LIMIT 5;",
        "data": [
            {"name": "Alice", "department": "Finance"},
            {"name": "Bob", "department": "IT"},
        ],
        "explanation": "Mock response for Checkpoint 2"
    }
