# CodeHub

A full-stack collaborative coding platform built with:
- **Frontend:** React + Vite (Node.js)
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL

## 🚀 Getting Started

### 1. Set up the Database

Create a PostgreSQL database named `codehub`:
```sql
CREATE DATABASE codehub;
```

### 2. Configure Backend

```bash
cd backend
```

Edit `.env` with your PostgreSQL credentials:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/codehub
SECRET_KEY=your-super-secret-key
```

Install dependencies and start:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs available at: http://localhost:8000/docs

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

## 📁 Project Structure

```
Codehub/
├── backend/          FastAPI app
│   ├── main.py
│   ├── models.py     Database models
│   ├── schemas.py    Pydantic schemas
│   ├── auth_utils.py JWT auth
│   └── routers/      auth, users, projects, community
└── frontend/         React + Vite
    └── src/
        ├── pages/    Landing, Dashboard, Editor, Projects, Community, Profile
        ├── components/AppShell (sidebar)
        ├── api/      Axios client
        └── context/  Auth context
```

## ✨ Features

- 🔐 JWT Authentication (register/login)
- 💻 Monaco Editor (VS Code engine) with 15+ languages
- 🗂️ Project storage and management
- 🆘 Community help feed — ask & answer questions
- 👤 User profiles with stats
- 🌙 Dark theme throughout
