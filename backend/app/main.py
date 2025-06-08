# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router

app = FastAPI(title="SpendSmart API", version="1.0")

# Allow frontend calls (React dev server or Vercel)
origins = [
    "http://localhost:3000",
    "https://spendsmart.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/ping")
async def ping():
    return {"message": "pong"}
