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
│   │   │   ├── auth.py             
│   │   │   ├── deps.py             
│   │   │   └── user.py             
│   │   ├── core/
│   │   │   ├── config.py           # Settings
│   │   │   ├── database.py         # DB connection
│   │   │   └── security.py         # JWT & bcrypt
│   │   ├── models/
│   │   │   ├── user.py             # User model
│   │   │   ├── interview.py
│   │   │   ├── question.py
│   │   │   ├── response.py
│   │   │   └── skill_gap.py
│   │   └── schemas/
│   │       └── user.py             
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

| Method | Endpoint | Description | Day |
|--------|----------|-------------|-----|
| `GET` | `/` | API root info | Day 3 |
| `GET` | `/api/health` | Health check | Day 3 |
| `GET` | `/api/info` | API information | Day 3 |
| `POST` | `/api/auth/register` | Register new user | Day 6 |
| `POST` | `/api/auth/login` | Login & get JWT token | Day 7 |
| `GET` | `/api/auth/me` | Get current user (protected) | Day 7 |
| `POST` | `/api/auth/logout` | Logout user | Day 7 |
| `GET` | `/api/user/profile` | Get user profile (protected) | Day 8 |
| `PUT` | `/api/user/profile` | Update user profile (protected) | Day 8 |
| `GET` | `/api/user/stats` | Get dashboard stats (protected) | Day 8 |

### Coming Soon

| Method | Endpoint | Description | Day |
|--------|----------|-------------|-----|
| `POST` | `/api/interviews/` | Start interview | Day 11+ |
| `GET` | `/api/interviews/` | List user interviews | Day 11+ |
| `GET` | `/api/interviews/{id}` | Get interview details | Day 11+ |
| `POST` | `/api/interviews/{id}/answer` | Submit answer | Day 12+ |
| `GET` | `/api/skill-gaps/` | Get user skill gaps | Day 14+ |

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

# Login and save token automatically
$response = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "password": "Test1234"}'
$token = $response.access_token

# Get current user (protected route)
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/auth/me" `
  -Headers @{Authorization = "Bearer $token"}

# Get user profile
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/user/profile" `
  -Headers @{Authorization = "Bearer $token"}

# Get dashboard stats
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/user/stats" `
  -Headers @{Authorization = "Bearer $token"}

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
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT id, email, username, is_active, created_at FROM users;"
```

---

## 👤 Author

**SRIDEV20**
- GitHub: [@SRIDEV20INFO](https://github.com/SRIDEV20INFO)

## 📄 License

This project is part of a learning portfolio.
