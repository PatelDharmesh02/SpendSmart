from fastapi import APIRouter
from app.api import auth, budgets, transactions, ai

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
