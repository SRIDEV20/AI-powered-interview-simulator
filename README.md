# AI Interview Simulator

A full-stack AI-powered interview simulator that helps you practice interviews, get instant feedback, and track skill gaps over time.

## Tech Stack

### Backend
- FastAPI (Python web framework)
- PostgreSQL (database)
- SQLAlchemy (ORM)
- Alembic (migrations)
- bcrypt (password hashing)
- JWT (authentication tokens)
- Pydantic (data validation)
- OpenAI (AI-powered interview analysis and feedback)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- CSS Modules (component-scoped styles)
- React Context API (auth state management)

## Project Structure

```
ai-interview-simulator/
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── deps.py
│   │   │   ├── user.py
│   │   │   ├── interview.py
│   │   │   └── skill_gap.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── interview.py
│   │   │   ├── question.py
│   │   │   ├── response.py
│   │   │   └── skill_gap.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── interview.py
│   │   │   ├── response.py
│   │   │   ├── score.py
│   │   │   └── skill_gap.py
│   │   └── services/
│   │       ├── openai_service.py
│   │       ├── interview_service.py
│   │       ├── evaluation_service.py
│   │       ├── scoring_service.py
│   │       └── skill_gap_service.py
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.local
│   └── README.md
└── README.md
```

## API Endpoints

### Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API root info |
| GET | `/api/health` | Health check |
| GET | `/api/info` | API information |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/user/profile` | Get user profile (protected) |
| PUT | `/api/user/profile` | Update user profile (protected) |
| GET | `/api/user/stats` | Get dashboard stats (protected) |
| GET | `/api/test/ai` | Test OpenAI connection |
| POST | `/api/interview/create` | Create interview and generate questions |
| GET | `/api/interview/` | List all interviews for current user |
| GET | `/api/interview/{interview_id}` | Get interview details and questions |
| PATCH | `/api/interview/{interview_id}/complete` | Mark interview as completed |
| POST | `/api/interview/{interview_id}/answer/{question_id}` | Submit answer and get AI evaluation |
| GET | `/api/interview/{interview_id}/results` | Get full interview results |
| GET | `/api/interview/{interview_id}/score` | Get detailed score breakdown |
| POST | `/api/skill-gaps/analyze/{interview_id}` | Analyze and save skill gaps |
| GET | `/api/skill-gaps/` | Get all skill gaps for current user |
| GET | `/api/skill-gaps/interview/{interview_id}` | Get skill gaps for a specific interview |

## Frontend Pages

Common routes:

- `/` (landing page)
- `/login`
- `/register`
- `/dashboard`
- `/interview/setup`
- `/interview/[id]`
- `/results/[id]`
- `/skill-gap` (if enabled)

## Getting Started

### 1) Clone the Repository

```bash
git clone https://github.com/SRIDEV20INFO/ai-interview-simulator.git
cd ai-interview-simulator
```

### 2) Backend Setup

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

Backend runs at:
- http://localhost:8000

API documentation:
- http://localhost:8000/api/docs

If you see `ModuleNotFoundError: No module named 'psycopg'`, install the PostgreSQL driver:

```powershell
python -m pip install "psycopg[binary]"
```

### 3) Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at:
- http://localhost:3000

### 4) Environment Variables

Create `backend/.env`:

```env
APP_NAME="AI Interview Simulator"
APP_VERSION="1.0.0"
DEBUG=True

HOST=0.0.0.0
PORT=8000

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_interview_db

SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

OPENAI_API_KEY=sk-your-real-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Never commit `.env` or `.env.local` to GitHub.

## Quick Test (PowerShell)

```powershell
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

# Create interview
$interview = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/interview/create" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"job_role": "Java Developer", "difficulty": "intermediate", "num_questions": 3, "question_type": "technical"}'
$interviewId = $interview.interview_id
$q1Id = $interview.questions[0].id

# Submit one answer
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/interview/$interviewId/answer/$q1Id" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"user_answer": "Your answer here...", "time_taken_seconds": 90}'

# Complete interview
Invoke-RestMethod -Method PATCH `
  -Uri "http://localhost:8000/api/interview/$interviewId/complete" `
  -Headers @{Authorization = "Bearer $token"}

# Get score
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/interview/$interviewId/score?generate_summary=false" `
  -Headers @{Authorization = "Bearer $token"}
```

## Database Setup (Optional)

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_interview_db;
```

## Author

SRIDEV20  
GitHub: @SRIDEV20INFO

## License

This project is part of a learning portfolio.