from fastapi import APIRouter

from app.api import ai, auth, budgets, dashboard, goals, transactions

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
router.include_router(goals.router, prefix="/goals", tags=["goals"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
