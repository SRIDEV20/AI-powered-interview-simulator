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
- **React Context API** - Auth state management ✅ Day 16

---

## 📁 Project Structure

```
ai-interview-simulator/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py              # ✅ Day 6 - Register | ✅ Day 7 - Login, Me, Logout
│   │   │   ├── deps.py              # ✅ Day 7 - JWT middleware
│   │   │   ├── user.py              # ✅ Day 8 - Profile & Stats
│   │   │   ├── interview.py         # ✅ Day 10 - Create
│   │   │   │                        # ✅ Day 11 - List, Detail, Complete
│   │   │   │                        # ✅ Day 12 - Answer, Results
│   │   │   │                        # ✅ Day 13 - Score breakdown
│   │   │   └── skill_gap.py         # ✅ Day 14 - Analyze, User Gaps, Interview Gaps
│   │   ├── core/
│   │   │   ├── config.py            # ✅ Day 9 - Added OpenAI settings
│   │   │   ├── database.py          # DB connection + get_db dependency
│   │   │   └── security.py          # JWT & bcrypt
│   │   ├── models/
│   │   │   ├── user.py              # User model
│   │   │   ├── interview.py         # ✅ Day 4 - Interview, DifficultyLevel, InterviewStatus
│   │   │   ├── question.py          # ✅ Day 4 - Question, QuestionType
│   │   │   ├── response.py          # ✅ Day 4 - Response (AI feedback + scores)
│   │   │   └── skill_gap.py         # ✅ Day 4 - SkillGap, ProficiencyLevel
│   │   ├── schemas/
│   │   │   ├── user.py              # ✅ Day 6 + Day 8 - User schemas
│   │   │   ├── interview.py         # ✅ Day 10 - Create | ✅ Day 11 - List, Detail, Complete
│   │   │   ├── response.py          # ✅ Day 12 - SubmitAnswer, EvaluationResult, Results
│   │   │   ├── score.py             # ✅ Day 13 - CategoryScore, PerformanceLevel, ScoreResponse
│   │   │   └── skill_gap.py         # ✅ Day 14 - SkillGapItem, AnalyzeResponse, UserGapsResponse
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── openai_service.py    # ✅ Day 9  - GPT-4 service wrapper
│   │       ├── interview_service.py # ✅ Day 10 - Generate | ✅ Day 11 - PostgreSQL storage
│   │       │                        # ✅ Day 14 - Fixed skill_category extraction
│   │       ├── evaluation_service.py# ✅ Day 12 - Answer evaluation + results
│   │       ├── scoring_service.py   # ✅ Day 13 - Scoring algorithm + GPT summary
│   │       └── skill_gap_service.py # ✅ Day 14 - Skill gap analyzer + recommendations
│   ├── main.py                      # ✅ Day 14 - Registered skill_gap router
│   ├── requirements.txt             # ✅ Day 9 - Added openai>=1.50.0
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css          # Global styles & CSS variables
│   │   │   ├── layout.tsx           # ✅ Day 16 - Wrapped with AuthProvider
│   │   │   ├── page.tsx             # ✅ Day 5  - Landing page
│   │   │   ├── page.module.css      # Landing page styles
│   │   │   ├── login/
│   │   │   │   ├── page.tsx         # ✅ Day 16 - Connected to real API
│   │   │   │   └── page.module.css  # Login styles
│   │   │   ├── register/
│   │   │   │   ├── page.tsx         # ✅ Day 16 - Connected to real API
│   │   │   │   └── page.module.css  # Register styles
│   │   │   └── dashboard/
│   │   │       └── page.tsx         # ✅ Day 16 - Protected placeholder
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx       # ✅ Day 5 - Sticky header
│   │   │   │   ├── Header.module.css
│   │   │   │   ├── Footer.tsx       # ✅ Day 5 - Footer
│   │   │   │   └── Footer.module.css
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx # ✅ Day 16 - Route guard
│   │   │   ├── BackendStatus.tsx    # ✅ Day 5 - Live health indicator
│   │   │   └── BackendStatus.module.css
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # ✅ Day 16 - Auth state + JWT + login/logout
│   │   └── lib/
│   │       └── api.ts               # ✅ Day 16 - Auth API functions added
│   ├── .env.local                   # Environment variables (not in git)
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
| `POST` | `/api/auth/register` | Register new user | ✅ Day 6 |
| `POST` | `/api/auth/login` | Login & get JWT token | ✅ Day 7 |
| `GET` | `/api/auth/me` | Get current user (protected) | ✅ Day 7 |
| `POST` | `/api/auth/logout` | Logout user | ✅ Day 7 |
| `GET` | `/api/user/profile` | Get user profile (protected) | ✅ Day 8 |
| `PUT` | `/api/user/profile` | Update user profile (protected) | ✅ Day 8 |
| `GET` | `/api/user/stats` | Get dashboard stats (protected) | ✅ Day 8 |
| `GET` | `/api/test/ai` | Test OpenAI GPT-4 connection | ✅ Day 9 |
| `POST` | `/api/interview/create` | Create interview + generate questions | ✅ Day 10 |
| `GET` | `/api/interview/` | List all my interviews | ✅ Day 11 |
| `GET` | `/api/interview/{interview_id}` | Get interview detail + questions | ✅ Day 11 |
| `PATCH` | `/api/interview/{interview_id}/complete` | Mark interview as completed | ✅ Day 11 |
| `POST` | `/api/interview/{interview_id}/answer/{question_id}` | Submit answer + AI evaluation | ✅ Day 12 |
| `GET` | `/api/interview/{interview_id}/results` | Get full interview results | ✅ Day 12 |
| `GET` | `/api/interview/{interview_id}/score` | Get detailed score breakdown | ✅ Day 13 |
| `POST` | `/api/skill-gaps/analyze/{interview_id}` | Analyze & save skill gaps | ✅ Day 14 |
| `GET` | `/api/skill-gaps/` | Get all user skill gaps | ✅ Day 14 |
| `GET` | `/api/skill-gaps/interview/{interview_id}` | Get interview skill gaps | ✅ Day 14 |

### Coming Soon

| Method | Endpoint | Description | Day |
|--------|----------|-------------|-----|
| `GET` | `/api/frontend/dashboard` | Full dashboard + stats | ⬜ Day 17 |
| `GET` | `/api/frontend/profile` | User profile page | ⬜ Day 18 |
| `GET` | `/api/frontend/interview/setup` | New interview setup | ⬜ Day 19 |
| `GET` | `/api/frontend/interview/[id]` | Live interview session | ⬜ Day 21 |

---

## 🖥️ Frontend Pages

| Page | Route | Description | Status |
|------|-------|-------------|--------|
| Landing | `/` | Hero, features, how it works | ✅ Day 5 |
| Login | `/login` | Login form + validation + API | ✅ Day 15 + 16 |
| Register | `/register` | Register form + password strength + API | ✅ Day 15 + 16 |
| Dashboard | `/dashboard` | Protected placeholder | ✅ Day 16 |
| Dashboard | `/dashboard` | Full stats + interview history | ⬜ Day 17 |
| Profile | `/profile` | View & edit user profile | ⬜ Day 18 |
| Interview Setup | `/interview/setup` | Configure new interview | ⬜ Day 19 |
| Interview Session | `/interview/[id]` | Live interview UI | ⬜ Day 21 |
| Results | `/results/[id]` | Interview results & score | ⬜ Day 22 |

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

**Create `backend/.env`:**

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

# OpenAI Settings
OPENAI_API_KEY=sk-your-real-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

**Create `frontend/.env.local`:**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

⚠️ **Never commit `.env` or `.env.local` to GitHub — protected by `.gitignore`!**

---

## 🧪 Quick Test

```powershell
# ── Auth ──────────────────────────────────────────────────────────

# Register a user
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "username": "testuser", "password": "Test1234", "full_name": "Test User"}'

# Login and save token
$response = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "password": "Test1234"}'
$token = $response.access_token

# Get current user
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/auth/me" `
  -Headers @{Authorization = "Bearer $token"}

# ── User ──────────────────────────────────────────────────────────

# Get user profile
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/user/profile" `
  -Headers @{Authorization = "Bearer $token"}

# Get dashboard stats
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/user/stats" `
  -Headers @{Authorization = "Bearer $token"}

# ── Interview Lifecycle ───────────────────────────────────────────

# Step 1 - Create interview (GPT-4 💰)
$interview = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/interview/create" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"job_role": "Java Developer", "difficulty": "intermediate", "num_questions": 3, "question_type": "technical"}'
$interviewId = $interview.interview_id
$q1Id = $interview.questions[0].id
$q2Id = $interview.questions[1].id
$q3Id = $interview.questions[2].id

# Step 2 - Submit all 3 answers (GPT evaluates 💰 x3)
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/interview/$interviewId/answer/$q1Id" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"user_answer": "Your answer here...", "time_taken_seconds": 90}'

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/interview/$interviewId/answer/$q2Id" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"user_answer": "Your answer here...", "time_taken_seconds": 75}'

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/interview/$interviewId/answer/$q3Id" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"user_answer": "Your answer here...", "time_taken_seconds": 100}'

# Step 3 - Get results
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/interview/$interviewId/results" `
  -Headers @{Authorization = "Bearer $token"}

# Step 4 - Get score breakdown (GPT summary 💰)
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/interview/$interviewId/score?generate_summary=true" `
  -Headers @{Authorization = "Bearer $token"}

# Step 5 - Analyze skill gaps (GPT recommendations 💰)
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/skill-gaps/analyze/$interviewId" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"force_reanalyze": false}'

# Step 6 - Get all user skill gaps
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/skill-gaps/" `
  -Headers @{Authorization = "Bearer $token"}

# Step 7 - Complete interview
Invoke-RestMethod -Method PATCH `
  -Uri "http://localhost:8000/api/interview/$interviewId/complete" `
  -Headers @{Authorization = "Bearer $token"}

# ── Health & AI ───────────────────────────────────────────────────

Invoke-RestMethod -Uri "http://localhost:8000/api/health"
Invoke-RestMethod -Uri "http://localhost:8000/api/test/ai"
```

---

## 🖥️ Frontend Pages Test

```
http://localhost:3000/           ← Landing page
http://localhost:3000/login      ← Login form (connects to real API)
http://localhost:3000/register   ← Register form (connects to real API)
http://localhost:3000/dashboard  ← Protected → redirects to /login if not auth
```

---

## 🗄️ Database Setup

```powershell
# Connect to PostgreSQL
D:\postgress\bin\psql -U postgres

# Create database
CREATE DATABASE ai_interview_db;

# Verify tables
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT id, email, username FROM users;"
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT id, job_role, overall_score, status FROM interviews;"
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT id, question_text, skill_category FROM questions;"
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT id, score, answered_at FROM responses;"
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT skill_name, proficiency_level, gap_score FROM skill_gaps ORDER BY gap_score ASC;"
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
| Day 10 | Question generation + interview create endpoint | ✅ Done |
| Day 11 | PostgreSQL storage + full interview lifecycle | ✅ Done |
| Day 12 | Answer submission + GPT-4 evaluation + results | ✅ Done |
| Day 13 | Scoring algorithm + category scores + performance levels | ✅ Done |
| Day 14 | Skill gap analysis + weak area detection + recommendation engine | ✅ Done |
| Day 15 | Login page + Register page + form validation + password strength | ✅ Done |
| Day 16 | Auth context + JWT storage + API integration + protected routes | ✅ Done |
| Day 17 | Dashboard layout + user stats + interview history | ⬜ Next |
| Day 18 | Profile page (view/edit) | ⬜ Upcoming |
| Day 19 | New interview setup page | ⬜ Upcoming |
| Day 20 | Connect interview setup to API | ⬜ Upcoming |
| Day 21 | Live interview interface | ⬜ Upcoming |

---

## 👤 Author

**SRIDEV20**
- GitHub: [@SRIDEV20INFO](https://github.com/SRIDEV20INFO)

## 📄 License

This project is part of a learning portfolio.