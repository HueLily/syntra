from fastapi import FastAPI
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key)

app = FastAPI()

class QueryRequest(BaseModel):
    prompt: str
    role: str
    region: str

@app.post("/query")
async def generate_sql_query(data: QueryRequest): 
    prompt = data.prompt
    system_message = f"""You are a secure SQL query generator. Here is the database schema:

    Table: employees
    Columns:
    - id (integer)
    - name (text)
    - department (text)
    - region (text)
    - email (text)
    - phone (text)
    - salary (numeric)

    Follow these rules strictly:
    1. Generate only SELECT queries
    2. No DROP, DELETE, UPDATE, or INSERT statements
    3. No schema modifications
    4. Always include a FROM employees clause
    5. Always include WHERE region = :region in your queries
    6. Always include a LIMIT clause (default to LIMIT 100 if not specified)
    7. Focus on data retrieval only
    8. Format your response exactly as shown below:

    SQL: SELECT [columns] FROM employees WHERE region = :region [additional conditions] LIMIT [number]
    Explanation: [brief explanation of what the query does]
    """

    # Use the actual request data
    user_prompt = f"{data.prompt} Role: {data.role}. Region: {data.region}."

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1
        )

        content = response.choices[0].message.content
        return {"response": content}
    except Exception as e:
        return {"error": str(e)}