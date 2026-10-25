from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.deps import get_db
from app.models.goal import Goal
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.dashboard import GoalPatch, GoalRead, GoalWrite
from app.services.finance import money

router = APIRouter()


@router.get("", response_model=list[GoalRead])
def list_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).all()


@router.post("", response_model=GoalRead, status_code=201)
def create_goal(body: GoalWrite, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = Goal(
        user_id=current_user.id,
        name=body.name,
        target_amount=money(body.target_amount),
        current_amount=money(body.current_amount),
        deadline=body.deadline,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/{goal_id}", response_model=GoalRead)
def update_goal(
    goal_id: UUID,
    body: GoalPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    data = body.model_dump(exclude_unset=True)
    if "name" in data:
        goal.name = data["name"]
    if "target_amount" in data and data["target_amount"] is not None:
        goal.target_amount = money(data["target_amount"])
    if "current_amount" in data and data["current_amount"] is not None:
        goal.current_amount = money(data["current_amount"])
    if "deadline" in data:
        goal.deadline = data["deadline"]
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", response_model=MessageResponse)
def delete_goal(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}
