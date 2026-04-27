from fastapi import FastAPI
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

# Create all tables
Base.metadata.create_all(bind=engine)

from routers import auth, users, projects, community, tasks

app = FastAPI(
    title="CodeHub API",
    description="Backend API for the CodeHub collaborative coding platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(community.router)
app.include_router(tasks.router)


@app.get("/")
def root():
    return {"message": "Welcome to CodeHub API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/register", response_model=schemas.UserOut, tags=["auth"])
def register_alias(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    return auth.register(payload, db)


@app.post("/login", response_model=schemas.Token, tags=["auth"])
def login_alias(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    return auth.login(payload, db)
