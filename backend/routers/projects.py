from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas
from auth_utils import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[schemas.ProjectOut])
def list_projects(
    language: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Project).filter(models.Project.owner_id == current_user.id)
    if language:
        q = q.filter(models.Project.language == language)
    return q.order_by(models.Project.updated_at.desc()).all()


@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    payload: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    files = [f.model_dump() for f in payload.files] if payload.files else [{"name": "main.py", "content": ""}]
    project = models.Project(
        owner_id=current_user.id,
        name=payload.name,
        description=payload.description,
        language=payload.language,
        files=files,
        is_public=payload.is_public,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/public", response_model=List[schemas.ProjectOut])
def list_public_projects(language: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Project).filter(models.Project.is_public == True)
    if language:
        q = q.filter(models.Project.language == language)
    return q.order_by(models.Project.updated_at.desc()).limit(50).all()


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id and not project.is_public:
        raise HTTPException(status_code=403, detail="Access denied")
    return project


@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    payload: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if payload.name is not None:
        project.name = payload.name
    if payload.description is not None:
        project.description = payload.description
    if payload.language is not None:
        project.language = payload.language
    if payload.files is not None:
        project.files = [f.model_dump() for f in payload.files]
    if payload.is_public is not None:
        project.is_public = payload.is_public
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"detail": "Project deleted"}
