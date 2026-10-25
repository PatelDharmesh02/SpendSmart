import json

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.insight import Insight
from app.models.job import Job
from app.models.user import User
from app.schemas.dashboard import InsightOut, JobOut
from app.tasks import enqueue_insight

router = APIRouter()


@router.get("/summary", response_model=InsightOut)
def get_monthly_summary(
    month: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = db.query(Insight).filter(Insight.user_id == current_user.id, Insight.month == month).first()
    if not row:
        return InsightOut(month=month, summary=None, cached=False)
    return InsightOut(month=month, summary=row.summary, generated_at=row.generated_at, cached=True)


@router.post("/summary", response_model=JobOut, status_code=202)
def regenerate_summary(
    month: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = Job(
        user_id=current_user.id,
        type="insight",
        status="queued",
        payload=json.dumps({"month": month}),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    try:
        enqueue_insight(str(current_user.id), month, str(job.id))
    except Exception:
        pass
    db.expire(job)
    db.refresh(job)
    return job


@router.get("/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == UUID(str(job_id)), Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
