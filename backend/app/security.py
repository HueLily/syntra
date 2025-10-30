from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import sqlglot

def validate_query(query: str) -> bool:
    """Validate that a query is SELECT-only and safe"""
    try:
        # Parse the query
        parsed = sqlglot.parse_one(query)
        
        # Check if it's a SELECT statement
        if not isinstance(parsed, sqlglot.exp.Select):
            return False
        
        # Check for dangerous operations
        dangerous_keywords = ['DELETE', 'DROP', 'UPDATE', 'INSERT', 'TRUNCATE', 'ALTER']
        query_upper = query.upper()
        if any(keyword in query_upper for keyword in dangerous_keywords):
            return False
            
        return True
    except Exception:
        return False

def apply_row_limit(query: str, limit: int = 1000) -> str:
    """Add a row limit to the query if none exists"""
    try:
        parsed = sqlglot.parse_one(query)
        if not parsed.limit:
            query = f"{query} LIMIT {limit}"
        return query
    except Exception:
        return f"{query} LIMIT {limit}"

class SecurityContext:
    def __init__(self, role: str, region: str):
        self.role = role
        self.region = region
        
    async def execute_query(self, query: str, db_url: str) -> dict:
        """Execute a query with security controls"""
        if not validate_query(query):
            raise ValueError("Invalid or unsafe query")
            
        # Apply row limit
        query = apply_row_limit(query)
        
        # Create database connection
        engine = create_engine(db_url)
        
        try:
            with engine.connect() as conn:
                # Set security context using parameterized queries
                conn.execute(
                    text("SELECT app.set_config('current_role', :role)"),
                    {"role": self.role}
                )
                conn.execute(
                    text("SELECT app.set_config('current_region', :region)"),
                    {"region": self.region}
                )
                
                # Execute query with region parameter
                result = conn.execute(text(query), {"region": self.region})
                return {
                    "columns": result.keys(),
                    "rows": [list(row) for row in result],
                    "row_count": result.rowcount
                }
        except SQLAlchemyError as e:
            raise ValueError(f"Database error: {str(e)}")