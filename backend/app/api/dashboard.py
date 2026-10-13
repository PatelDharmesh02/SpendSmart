from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardOut
from app.services.finance import build_month_snapshot

router = APIRouter()


@router.get("", response_model=DashboardOut)
def get_dashboard(
    month: str = Query(..., description="Month in YYYY-MM format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return build_month_snapshot(db, current_user.id, month)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")
