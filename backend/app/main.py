# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router
from app.db.init_db import init_db

app = FastAPI(title="SpendSmart API", version="1.0")

# Allow frontend calls (React dev server or Vercel)
origins = [
    "http://localhost:3000",
    "https://spend-smart-frontend-six.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Initialize the database
    init_db()


app.include_router(api_router, prefix="/api/v1")

@app.get("/ping")
async def ping():
    return {"message": "pong"}
