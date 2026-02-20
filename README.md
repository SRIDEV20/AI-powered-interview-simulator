    # 🤖 AI Interview Simulator

A full-stack AI-powered interview simulator that helps you practice interviews, get instant feedback, and track skill gaps over time.

## 🚀 Tech Stack

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **bcrypt** - Password hashing
- **JWT** - Authentication tokens
- **Pydantic v2** - Data validation

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **CSS Modules** - Component scoped styles

---

## 📁 Project Structure

```
ai-interview-simulator/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth.py             # Auth routes
│   │   ├── core/
│   │   │   ├── config.py           # Settings
│   │   │   ├── database.py         # DB connection
│   │   │   └── security.py         # JWT & bcrypt
│   │   ├── models/
│   │   │   └── user.py             # User model
│   │   └── schemas/
│   │       └── user.py             # Pydantic schemas
│   ├── main.py                     # FastAPI entry point
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── page.module.css
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── BackendStatus.tsx
│   │   └── lib/
│   │       └── api.ts
│   ├── .env.local
│   └── README.md
└── README.md
```

---

## 🔌 API Endpoints

### Currently Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API root info |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/info` | API information |
| `POST` | `/api/auth/register` | Register new user |

### Coming Soon

| Method | Endpoint | Description | Day |
|--------|----------|-------------|-----|
| `POST` | `/api/auth/login` | Login & get JWT | Day 7 |
| `GET` | `/api/auth/me` | Get current user | Day 7 |
| `POST` | `/api/interviews/` | Start interview | Day 8+ |

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SRIDEV20INFO/ai-interview-simulator.git
cd ai-interview-simulator
```

### 2. Start Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

Backend runs at: **http://localhost:8000**
API Docs at: **http://localhost:8000/api/docs**

### 3. Start Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🧪 Quick Test

```powershell
# Register a user
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "username": "testuser", "password": "Test1234", "full_name": "Test User"}'

# Health check
Invoke-RestMethod -Uri "http://localhost:8000/api/health"
```

---

## 🗄️ Database Setup

```powershell
# Connect to PostgreSQL
D:\postgress\bin\psql -U postgres

# Create database
CREATE DATABASE ai_interview_db;

# Verify users table
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT * FROM users;"
```

---

## 👤 Author

**SRIDEV20**
- GitHub: [@SRIDEV20INFO](https://github.com/SRIDEV20INFO)

## 📄 License

This project is part of a learning portfolio.