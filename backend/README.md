# AI Interview Simulator - Backend

FastAPI backend for the AI Interview Simulator project with a PostgreSQL database and AI-powered interview analysis.

## Tech Stack

- Framework: FastAPI
- Server: Uvicorn
- Database: PostgreSQL + SQLAlchemy
- Authentication: JWT + bcrypt
- Password hashing: passlib (bcrypt)
- Migrations: Alembic
- Validation: Pydantic
- AI: OpenAI

## Project Structure

```
backend/
├── alembic/
│   ├── versions/
│   └── env.py
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── deps.py
│   │   ├── user.py
│   │   ├── interview.py
│   │   └── skill_gap.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── interview.py
│   │   ├── question.py
│   │   ├── response.py
│   │   └── skill_gap.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── interview.py
│   │   ├── response.py
│   │   ├── score.py
│   │   └── skill_gap.py
│   └── services/
│       ├── __init__.py
│       ├── openai_service.py
│       ├── interview_service.py
│       ├── evaluation_service.py
│       ├── scoring_service.py
│       └── skill_gap_service.py
├── .env
├── alembic.ini
├── main.py
├── requirements.txt
└── README.md
```

## Database Schema

### Tables

- users: User authentication and profile data
- interviews: Interview session tracking
- questions: Interview questions with type, difficulty, and skill category
- responses: User answers with AI feedback and scoring
- skill_gaps: Skill gap summary and recommendations across interviews

### Relationships

```
users (1) -> (many) interviews
users (1) -> (many) skill_gaps
interviews (1) -> (many) questions
interviews (1) -> (many) skill_gaps
questions (1) -> (0..1) responses
```

## Setup Instructions

### 1) Prerequisites

- Python 3.10+ installed
- PostgreSQL installed and running
- Git installed
- OpenAI API key available in your environment

### 2) Clone Repository

```bash
git clone https://github.com/SRIDEV20INFO/ai-interview-simulator.git
cd ai-interview-simulator/backend
```

### 3) Create and Activate Virtual Environment

Create:

```bash
python -m venv venv
```

Activate:

Windows PowerShell:
```powershell
.\venv\Scripts\Activate.ps1
```

Windows CMD:
```cmd
venv\Scripts\activate
```

Mac/Linux:
```bash
source venv/bin/activate
```

### 4) Install Dependencies

```bash
python -m pip install -U pip
pip install -r requirements.txt
pip install "pydantic[email]"
```

Important: If your SQLAlchemy connection URL uses `postgresql+psycopg`, install the psycopg v3 driver:

```bash
pip install "psycopg[binary]"
```

### 5) Create PostgreSQL Database

Connect:
```bash
psql -U postgres
```

Create DB:
```sql
CREATE DATABASE ai_interview_db;
\q
```

### 6) Configure Environment Variables

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

Notes:
- Replace `YOUR_PASSWORD` with your local PostgreSQL password.
- Never commit `.env` to GitHub.
- Use `gpt-3.5-turbo` during development to reduce cost.

### 7) Run Migrations

```bash
alembic upgrade head
```

### 8) Start the Server

```bash
python main.py
```

Server:
- http://localhost:8000

API docs:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## API Overview

### Root and Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API root info |
| GET | `/api/health` | Health check |
| GET | `/api/info` | API version/info |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/logout` | Logout |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile (protected) |
| PUT | `/api/user/profile` | Update profile (protected) |
| GET | `/api/user/stats` | Get user stats (protected) |

### Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/create` | Create interview and generate questions |
| GET | `/api/interview/` | List my interviews |
| GET | `/api/interview/{interview_id}` | Interview details and questions |
| POST | `/api/interview/{interview_id}/answer/{question_id}` | Submit an answer |
| GET | `/api/interview/{interview_id}/results` | Full results (Q/A + feedback) |
| GET | `/api/interview/{interview_id}/score` | Score breakdown (supports GPT summary toggle) |
| PATCH | `/api/interview/{interview_id}/complete` | Mark interview completed |

### Skill Gaps

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/skill-gaps/analyze/{interview_id}` | Analyze skill gaps for an interview |
| GET | `/api/skill-gaps/` | All skill gaps for current user |
| GET | `/api/skill-gaps/interview/{interview_id}` | Skill gaps for a specific interview |

## Authentication

Protected routes require the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens expire based on `ACCESS_TOKEN_EXPIRE_MINUTES`.

## Quick Test (PowerShell)

```powershell
# Login and save token
$response = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "password": "Test1234"}'
$token = $response.access_token

# Create an interview
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

# Get score (skip summary to avoid cost)
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/interview/$interviewId/score?generate_summary=false" `
  -Headers @{Authorization = "Bearer $token"}
```

## Migrations

Create a new migration:

```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:

```bash
alembic upgrade head
```

Rollback last migration:

```bash
alembic downgrade -1
```

View migration history:

```bash
alembic history
```

## Troubleshooting

### ModuleNotFoundError: No module named 'email_validator'

```bash
pip install "pydantic[email]"
```

### ModuleNotFoundError: No module named 'psycopg'

If your SQLAlchemy URL uses `postgresql+psycopg`:

```bash
pip install "psycopg[binary]"
```

Alternatively, if you use psycopg2, ensure your URL uses `postgresql+psycopg2` and install:

```bash
pip install psycopg2-binary
```

### Database connection failed

- Confirm PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Confirm DB exists (`ai_interview_db`)
- Confirm credentials are correct

### Tables do not exist

Run:

```bash
alembic upgrade head
```

Then restart the server.

### Port 8000 already in use

```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### OpenAI errors

- 401 errors usually mean the API key is invalid or missing
- Ensure `.env` has the correct `OPENAI_API_KEY`
- Restart the backend after changing `.env`

### Circular imports

Recommended import layering:

- models import only shared base/database utilities
- schemas should not import models
- services can import models and schemas
- api routers can import services, schemas, deps, and models

## License

This project is part of a learning portfolio.

## Author

SRIDEV20  
GitHub: @SRIDEV20INFO