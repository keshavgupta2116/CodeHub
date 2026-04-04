from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    bio: str
    avatar_url: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Projects ────────────────────────────────────────────────────────────────
class FileItem(BaseModel):
    name: str
    content: str

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    language: Optional[str] = "python"
    files: Optional[List[FileItem]] = []
    is_public: Optional[bool] = True

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    files: Optional[List[FileItem]] = None
    is_public: Optional[bool] = None

class ProjectOut(BaseModel):
    id: int
    owner_id: int
    name: str
    description: str
    language: str
    files: List[Any]
    is_public: bool
    created_at: datetime
    updated_at: datetime
    owner: UserOut

    class Config:
        from_attributes = True


# ─── Community ───────────────────────────────────────────────────────────────
class HelpPostCreate(BaseModel):
    title: str
    description: str
    code_snippet: Optional[str] = ""
    language: Optional[str] = "python"

class HelpPostOut(BaseModel):
    id: int
    author_id: int
    title: str
    description: str
    code_snippet: str
    language: str
    status: str
    created_at: datetime
    author: UserOut
    replies: List[Any] = []

    class Config:
        from_attributes = True

class ReplyCreate(BaseModel):
    content: str
    code_snippet: Optional[str] = ""

class ReplyOut(BaseModel):
    id: int
    post_id: int
    author_id: int
    content: str
    code_snippet: str
    upvotes: int
    is_accepted: bool
    created_at: datetime
    author: UserOut

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
