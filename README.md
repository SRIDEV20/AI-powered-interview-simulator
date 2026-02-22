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
- **OpenAI GPT-4** - AI powered interview analysis ✅ Day 9

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
│   │   │   ├── config.py           # ✅ Day 9 - Added OpenAI settings
│   │   │   ├── database.py         # DB connection
│   │   │   └── security.py         # JWT & bcrypt
│   │   ├── models/
��   │   │   ├── user.py             # User model
│   │   │   ├── interview.py
│   │   │   ├── question.py
│   │   │   ├── response.py
│   │   │   └── skill_gap.py
│   │   ├── schemas/
│   │   │   └── user.py             
│   │   └── services/
│   │       ├── __init__.py
│   │       └── openai_service.py   # ✅ Day 9 - GPT-4 service wrapper
│   ├── main.py                     # ✅ Day 9 - Added AI test endpoint
│   ├── requirements.txt            # ✅ Day 9 - Added openai>=1.50.0
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
| `GET` | `/api/test/ai` | Test OpenAI GPT-4 connection | ✅ Day 9 |

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

### 4. Configure Environment Variables

Create `backend/.env` file:

```env
# Application Settings
APP_NAME="AI Interview Simulator"
APP_VERSION="1.0.0"
DEBUG=True

# Server Settings
HOST=0.0.0.0
PORT=8000

# Database Settings
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_interview_db

# JWT Settings
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# OpenAI Settings ✅ Day 9
OPENAI_API_KEY=sk-your-real-key-here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

⚠️ **Never commit `.env` to GitHub — it's protected by `.gitignore`!**

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

# Test OpenAI GPT-4 connection ✅ Day 9
Invoke-RestMethod -Uri "http://localhost:8000/api/test/ai"
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

## 🗺️ Progress

| Day | What Was Built | Status |
|-----|---------------|--------|
| Day 1 | Project setup & GitHub | ✅ Done |
| Day 2 | Database schema & API design | ✅ Done |
| Day 3 | FastAPI initialization | ✅ Done |
| Day 4 | PostgreSQL database + ORM models | ✅ Done |
| Day 5 | Next.js frontend + landing page | ✅ Done |
| Day 6 | User registration API + bcrypt + Pydantic | ✅ Done |
| Day 7 | Login API + JWT tokens + Protected routes | ✅ Done |
| Day 8 | User profile endpoints + dashboard stats | ✅ Done |
| Day 9 | OpenAI GPT-4 integration + service wrapper | ✅ Done |
| Day 10 | Question generation service | ⬜ Next |
| Day 11 | Interview session management | ⬜ Coming |
| Day 12 | Answer submission & AI evaluation | ⬜ Coming |
| Day 13 | Scoring algorithm & feedback | ⬜ Coming |
| Day 14 | Skill gap analysis | ⬜ Coming |

---

## 👤 Author

**SRIDEV20**
- GitHub: [@SRIDEV20INFO](https://github.com/SRIDEV20INFO)

## 📄 License

This project is part of a learning portfolio.