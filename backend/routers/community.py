from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas
from auth_utils import get_current_user

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/posts", response_model=List[schemas.HelpPostOut])
def list_posts(
    language: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.HelpPost)
    if language:
        q = q.filter(models.HelpPost.language == language)
    if status:
        q = q.filter(models.HelpPost.status == status)
    if search:
        q = q.filter(models.HelpPost.title.ilike(f"%{search}%"))
    return q.order_by(models.HelpPost.created_at.desc()).all()


@router.post("/posts", response_model=schemas.HelpPostOut)
def create_post(
    payload: schemas.HelpPostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    post = models.HelpPost(
        author_id=current_user.id,
        title=payload.title,
        description=payload.description,
        code_snippet=payload.code_snippet,
        language=payload.language,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/posts/{post_id}", response_model=schemas.HelpPostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.HelpPost).filter(models.HelpPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/posts/{post_id}/replies", response_model=schemas.ReplyOut)
def add_reply(
    post_id: int,
    payload: schemas.ReplyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    post = db.query(models.HelpPost).filter(models.HelpPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    reply = models.Reply(
        post_id=post_id,
        author_id=current_user.id,
        content=payload.content,
        code_snippet=payload.code_snippet,
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply


@router.post("/replies/{reply_id}/upvote")
def upvote_reply(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reply = db.query(models.Reply).filter(models.Reply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    reply.upvotes += 1
    db.commit()
    return {"upvotes": reply.upvotes}


@router.put("/replies/{reply_id}/accept")
def accept_reply(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reply = db.query(models.Reply).filter(models.Reply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    post = db.query(models.HelpPost).filter(models.HelpPost.id == reply.post_id).first()
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only post author can accept replies")
    reply.is_accepted = True
    post.status = "solved"
    db.commit()
    return {"detail": "Reply accepted, post marked as solved"}


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    post = db.query(models.HelpPost).filter(
        models.HelpPost.id == post_id,
        models.HelpPost.author_id == current_user.id,
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"detail": "Post deleted"}
