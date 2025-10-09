from fastapi import FastAPI
from app.routes import router

app = FastAPI(title="VaultQuery Backend")

# include routes
app.include_router(router)

@app.get("/")
def root():
    return {"message": "VaultQuery backend is running successfully!"}
