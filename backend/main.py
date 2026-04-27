from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import schemas
from routers import auth, users, projects, community, tasks


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CodeHub API",
    description="Backend API for the CodeHub collaborative coding platform",
    version="1.0.0",
)

# 🌐 CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://code-hub-five-alpha.vercel.app",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📌 Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(community.router)
app.include_router(tasks.router)

# 🏠 Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to CodeHub API", "docs": "/docs"}

# ❤️ Health check
@app.get("/health")
def health():
    return {"status": "ok"}

# 🔐 Auth aliases (optional convenience endpoints)
@app.post("/register", response_model=schemas.UserOut, tags=["auth"])
def register_alias(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    return auth.register(payload, db)

@app.post("/login", response_model=schemas.Token, tags=["auth"])
def login_alias(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    return auth.login(payload, db)