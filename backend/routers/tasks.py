from collections import defaultdict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth_utils import get_current_user
from database import get_db

router = APIRouter(tags=["tasks"])
VALID_CATEGORIES = {"Work", "Study", "Personal"}
VALID_STATUS = {"pending", "done"}


def _normalize_category(category: str) -> str:
    value = (category or "Personal").strip().capitalize()
    if value not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Category must be Work, Study, or Personal")
    return value


def _normalize_status(status: str) -> str:
    value = (status or "pending").strip().lower()
    if value not in VALID_STATUS:
        raise HTTPException(status_code=400, detail="Status must be pending or done")
    return value


@router.post("/tasks", response_model=schemas.TaskOut)
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = models.Task(
        user_id=current_user.id,
        title=payload.title.strip(),
        category=_normalize_category(payload.category),
        deadline=payload.deadline,
        status=_normalize_status(payload.status),
    )
    if not task.title:
        raise HTTPException(status_code=400, detail="Title is required")
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks", response_model=list[schemas.TaskOut])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Task)
        .filter(models.Task.user_id == current_user.id)
        .order_by(models.Task.created_at.desc())
        .all()
    )


@router.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.title is not None:
        title = payload.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Title cannot be empty")
        task.title = title
    if payload.category is not None:
        task.category = _normalize_category(payload.category)
    if payload.deadline is not None:
        task.deadline = payload.deadline
    if payload.status is not None:
        task.status = _normalize_status(payload.status)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}


@router.get("/analytics", response_model=schemas.AnalyticsOut)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    total = len(tasks)
    done_tasks = [task for task in tasks if task.status == "done"]
    completed_count = len(done_tasks)

    now = datetime.now(timezone.utc)
    late_tasks = [
        task for task in tasks if task.deadline and task.deadline < now and task.status != "done"
    ]
    late_count = len(late_tasks)

    productivity_score = round((completed_count / total) * 100, 2) if total else 0.0
    discipline_score = round(max(0.0, 100.0 - ((late_count / total) * 100)), 2) if total else 100.0

    category_stats = defaultdict(lambda: {"total": 0, "completed": 0, "late": 0})
    for task in tasks:
        category_stats[task.category]["total"] += 1
        if task.status == "done":
            category_stats[task.category]["completed"] += 1
        if task.deadline and task.deadline < now and task.status != "done":
            category_stats[task.category]["late"] += 1

    breakdown = []
    for category, values in category_stats.items():
        completion_rate = (values["completed"] / values["total"] * 100) if values["total"] else 0
        breakdown.append(
            {
                "category": category,
                "total": values["total"],
                "completed": values["completed"],
                "completion_rate": round(completion_rate, 2),
                "late_count": values["late"],
            }
        )

    breakdown.sort(key=lambda item: item["completion_rate"], reverse=True)
    best_category = breakdown[0]["category"] if breakdown else None
    weakest_category = breakdown[-1]["category"] if len(breakdown) > 1 else best_category

    hourly_buckets = {"Morning": 0, "Afternoon": 0, "Evening": 0, "Night": 0}
    for task in done_tasks:
        hour = task.updated_at.hour if task.updated_at else task.created_at.hour
        if 5 <= hour < 12:
            hourly_buckets["Morning"] += 1
        elif 12 <= hour < 17:
            hourly_buckets["Afternoon"] += 1
        elif 17 <= hour < 22:
            hourly_buckets["Evening"] += 1
        else:
            hourly_buckets["Night"] += 1
    peak_time = max(hourly_buckets, key=hourly_buckets.get) if done_tasks else "No data yet"

    suggestions = []
    if productivity_score < 60:
        suggestions.append("Complete smaller tasks first to increase your daily win rate.")
    if late_count > 0:
        suggestions.append("Set earlier deadlines for Work tasks to reduce late submissions.")
    if weakest_category:
        suggestions.append(f"Focus more on {weakest_category} tasks this week to balance output.")
    if not suggestions:
        suggestions.append("Great momentum. Keep your streak by completing one key task daily.")

    return {
        "total_tasks": total,
        "completed_tasks": completed_count,
        "late_tasks": late_count,
        "productivity_score": productivity_score,
        "discipline_score": discipline_score,
        "best_category": best_category,
        "weakest_category": weakest_category,
        "peak_productive_time": peak_time,
        "category_breakdown": breakdown,
        "suggestions": suggestions,
    }
