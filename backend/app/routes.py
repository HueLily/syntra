from fastapi import APIRouter, HTTPException
<<<<<<< HEAD
from pydantic import BaseModel
from .security import SecurityContext
from .openai_helper import generate_sql_query
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

router = APIRouter()

class QueryRequest(BaseModel):
    prompt: str
    role: str = "analyst"
    region: str = "Midwest"

@router.post("/query")
async def execute_query(request: QueryRequest):
    try:
        # Create security context
        security = SecurityContext(request.role, request.region)
        
        # Generate SQL using OpenAI
        response = await generate_sql_query(request.prompt)
        if not response:
            raise HTTPException(status_code=500, detail="Failed to generate SQL query")

        # Parse the response to extract SQL and explanation
        lines = response.split('\n')
        sql = None
        explanation = None
        
        for line in lines:
            if line.startswith('SQL:'):
                sql = line[4:].strip()
            elif line.startswith('Explanation:'):
                explanation = line[12:].strip()

        if not sql:
            raise HTTPException(status_code=500, detail="No SQL query generated")
        
        # Execute with security controls
        result = await security.execute_query(
            sql,
            os.getenv('DATABASE_URL')
        )
        
        return {
            "sql": sql,
            "explanation": explanation,
            "data": result["rows"],
            "columns": result["columns"],
            "row_count": result["row_count"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
=======
from .openai_helper import QueryRequest, generate_sql_query
from dotenv import load_dotenv

load_dotenv() 

router = APIRouter()

@router.post("/query")
async def execute_query(request: QueryRequest):
    try:
        # Generate SQL using OpenAI
        response = await generate_sql_query(request)
        print("OpenAI response:", response)
        if not response:
            raise HTTPException(status_code=500, detail="Failed to generate SQL query")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

        
>>>>>>> eedd1ad (add open ai helper, utils for sql, sql schema)
