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

class MessageOut(BaseModel):
    detail: str

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


class UserStatsOut(BaseModel):
    projects: int
    help_posts: int
    replies_given: int
    reputation: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    late_tasks: int


# ─── Tasks and Analytics ──────────────────────────────────────────────────────
class TaskCreate(BaseModel):
    title: str
    category: str = "Personal"
    deadline: Optional[datetime] = None
    status: str = "pending"


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None


class TaskOut(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    deadline: Optional[datetime]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryInsight(BaseModel):
    category: str
    total: int
    completed: int
    completion_rate: float
    late_count: int


class AnalyticsOut(BaseModel):
    total_tasks: int
    completed_tasks: int
    late_tasks: int
    productivity_score: float
    discipline_score: float
    best_category: Optional[str]
    weakest_category: Optional[str]
    peak_productive_time: str
    category_breakdown: List[CategoryInsight]
    suggestions: List[str]
