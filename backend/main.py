from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models

# Create all tables
Base.metadata.create_all(bind=engine)

from routers import auth, users, projects, community

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


@app.get("/")
def root():
    return {"message": "Welcome to CodeHub API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
