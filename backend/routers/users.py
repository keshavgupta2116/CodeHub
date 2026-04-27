from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth_utils import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/{username}", response_model=schemas.UserOut)
def get_user(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/me", response_model=schemas.UserOut)
def update_profile(
    payload: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.bio is not None:
        current_user.bio = payload.bio
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/stats", response_model=schemas.UserStatsOut)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    projects_count = db.query(models.Project).filter(models.Project.owner_id == current_user.id).count()
    posts_count = db.query(models.HelpPost).filter(models.HelpPost.author_id == current_user.id).count()
    replies_count = db.query(models.Reply).filter(models.Reply.author_id == current_user.id).count()
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    completed_tasks = sum(1 for task in tasks if task.status == "done")
    pending_tasks = sum(1 for task in tasks if task.status != "done")
    now = datetime.now(timezone.utc)
    late_tasks = sum(
        1
        for task in tasks
        if task.deadline and task.deadline < now and task.status != "done"
    )
    return {
        "projects": projects_count,
        "help_posts": posts_count,
        "replies_given": replies_count,
        "reputation": replies_count * 10,
        "total_tasks": len(tasks),
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "late_tasks": late_tasks,
    }
