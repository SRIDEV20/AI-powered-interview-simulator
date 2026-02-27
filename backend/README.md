# AI Interview Simulator - Backend

FastAPI backend for the AI Interview Simulator project with PostgreSQL database and AI-powered interview analysis.

## 🚀 Tech Stack

- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn 0.24.0
- **Database**: PostgreSQL 18 + SQLAlchemy 2.0.35
- **Authentication**: JWT (python-jose) + bcrypt
- **Password Hashing**: bcrypt 4.0.1 (passlib)
- **Migrations**: Alembic 1.12.1
- **Validation**: Pydantic 2.12.5
- **AI**: OpenAI GPT-4

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/                  # API routes/endpoints
│   │   ├── __init__.py
│   │   ├── auth.py           # ✅ Day 6 - Register | ✅ Day 7 - Login, Me, Logout
│   │   ├── deps.py           # ✅ Day 7 - Auth middleware (JWT protection)
│   │   ├── user.py           # ✅ Day 8 - Profile & Stats endpoints
│   │   └── interview.py      # ✅ Day 10 - Create | ✅ Day 11 - List, Detail, Complete
│   │                         # ✅ Day 12 - Answer, Results | ✅ Day 13 - Score
│   ├── core/                 # Configuration & database
│   │   ├── config.py         # ✅ Day 9 - Added OpenAI settings
│   │   ├── database.py       # Database connection + get_db dependency
│   │   └── security.py       # ✅ Day 6 - bcrypt & JWT utils
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── interview.py      # ✅ Day 4 - Interview, DifficultyLevel, InterviewStatus
│   │   ├── question.py       # ✅ Day 4 - Question, QuestionType
│   │   ├── response.py       # ✅ Day 4 - Response (AI feedback)
│   │   └── skill_gap.py      # ✅ Day 4 - SkillGap
│   ├── schemas/              # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py           # ✅ Day 8 - UserProfileUpdate, UserStatsResponse
│   │   ├── interview.py      # ✅ Day 10 - Create | ✅ Day 11 - List, Detail, Complete
│   │   ├── response.py       # ✅ Day 12 - SubmitAnswer, EvaluationResult, Results
│   │   └── score.py          # ✅ Day 13 - CategoryScore, PerformanceLevel, ScoreResponse
│   └── services/             # Business logic
│       ├── __init__.py
│       ├── openai_service.py    # ✅ Day 9  - GPT-4 service wrapper
│       ├── interview_service.py # ✅ Day 10 - Generate | ✅ Day 11 - PostgreSQL storage
│       ├── evaluation_service.py# ✅ Day 12 - Answer evaluation + results
│       └── scoring_service.py   # ✅ Day 13 - Scoring algorithm + GPT summary
├── alembic/                  # Database migrations
│   ├── versions/             # Migration files
│   └── env.py                # Alembic configuration
├── venv/                     # Virtual environment (not in git)
├── .env                      # Environment variables (not in git)
├── alembic.ini               # Alembic settings
├── main.py                   # ✅ Day 9 - Added AI test endpoint
├── requirements.txt          # ✅ Day 9 - Added openai>=1.50.0
└── README.md
```

## 🗄️ Database Schema

### Tables

- **users** - User authentication and profiles
- **interviews** - Interview session tracking
- **questions** - Interview questions with types and difficulty
- **responses** - User answers with AI feedback
- **skill_gaps** - Identified skill gaps and recommendations

### Relationships

```
users (1) → (many) interviews
users (1) → (many) skill_gaps
interviews (1) → (many) questions
interviews (1) → (many) skill_gaps
questions (1) → (1) response
```

### User Model (`users` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `email` | String(255) | Unique, indexed |
| `username` | String(100) | Unique, indexed |
| `password_hash` | String(255) | bcrypt hashed (never plain text) |
| `full_name` | String(255) | Display name |
| `is_active` | Boolean | Default: true |
| `created_at` | DateTime | Auto timestamp |
| `updated_at` | DateTime | Auto update timestamp |

### Interview Model (`interviews` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key → users.id |
| `job_role` | String(100) | e.g. Python Developer |
| `difficulty_level` | Enum | beginner / intermediate / advanced |
| `status` | Enum | in_progress / completed / abandoned |
| `overall_score` | DECIMAL(5,2) | 0-100 (auto-calculated from responses) |
| `started_at` | DateTime | Auto timestamp |
| `completed_at` | DateTime | Set when completed |
| `duration_minutes` | Integer | Interview duration |

### Question Model (`questions` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `interview_id` | UUID | Foreign key → interviews.id |
| `question_text` | Text | The question content |
| `question_type` | Enum | technical / behavioral / coding / system_design |
| `difficulty` | String(20) | beginner / intermediate / advanced |
| `skill_category` | String(100) | e.g. Python, Algorithms |
| `expected_answer` | Text | Key points for AI comparison |
| `order_number` | Integer | Question order in interview |
| `created_at` | DateTime | Auto timestamp |

### Response Model (`responses` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `question_id` | UUID | Foreign key → questions.id (unique) |
| `user_answer` | Text | Candidate's submitted answer |
| `ai_feedback` | Text | GPT-4 generated feedback |
| `score` | DECIMAL(5,2) | 0-100 AI score |
| `strengths` | Text | JSON array of strengths |
| `weaknesses` | Text | JSON array of improvements |
| `answered_at` | DateTime | Auto timestamp |
| `time_taken_seconds` | Integer | Time taken to answer |

## ⚙️ Setup Instructions

### 1. Prerequisites

- Python 3.10+ installed
- PostgreSQL 18 installed and running
- Git installed
- OpenAI API key (get from https://platform.openai.com/api-keys)

### 2. Clone Repository

```bash
git clone https://github.com/SRIDEV20INFO/ai-interview-simulator.git
cd ai-interview-simulator/backend
```

### 3. Create Virtual Environment

```bash
python -m venv venv
```

### 4. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
pip install "pydantic[email]"
```

### 6. Set Up PostgreSQL Database

**Connect to PostgreSQL:**
```powershell
D:\postgress\bin\psql -U postgres
```

**Create Database:**
```sql
CREATE DATABASE ai_interview_db;
\q
```

### 7. Configure Environment Variables

Create a `.env` file in the `backend` folder:

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
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

**⚠️ Important:**
- Replace `YOUR_PASSWORD` with your PostgreSQL password!
- Replace `sk-your-real-key-here` with your real OpenAI API key!
- Never commit `.env` to GitHub!
- Use `gpt-3.5-turbo` during development to save costs!

### 8. Run Database Migrations

```bash
alembic upgrade head
```

### 9. Start the Server

```bash
python main.py
```

Server will start at: **http://localhost:8000**

---

## 📚 API Documentation

Once the server is running, access interactive documentation:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

---

## 🛣️ Available Endpoints

### Root & Health

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/` | API information and status | ✅ Done |
| `GET` | `/api/health` | Health check endpoint | ✅ Done |
| `GET` | `/api/info` | API details and version | ✅ Done |

### Authentication

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register new user | ✅ Done - Day 6 |
| `POST` | `/api/auth/login` | Login & get JWT token | ✅ Done - Day 7 |
| `GET` | `/api/auth/me` | Get current user profile | ✅ Done - Day 7 |
| `POST` | `/api/auth/logout` | Logout user | ✅ Done - Day 7 |

### User

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/user/profile` | Get current user profile | ✅ Done - Day 8 |
| `PUT` | `/api/user/profile` | Update current user profile | ✅ Done - Day 8 |
| `GET` | `/api/user/stats` | Get dashboard statistics | ✅ Done - Day 8 |

### AI (Test)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/test/ai` | Test OpenAI GPT-4 connection | ✅ Done - Day 9 |

### Interviews

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `POST` | `/api/interview/create` | Create interview + generate questions | ✅ Done - Day 10 |
| `GET` | `/api/interview/` | List all my interviews | ✅ Done - Day 11 |
| `GET` | `/api/interview/{interview_id}` | Get interview detail + questions | ✅ Done - Day 11 |
| `PATCH` | `/api/interview/{interview_id}/complete` | Mark interview as completed | ✅ Done - Day 11 |
| `POST` | `/api/interview/{interview_id}/answer/{question_id}` | Submit answer + AI evaluation | ✅ Done - Day 12 |
| `GET` | `/api/interview/{interview_id}/results` | Get full interview results | ✅ Done - Day 12 |
| `GET` | `/api/interview/{interview_id}/score` | Get detailed score breakdown | ✅ Done - Day 13 |

### Skill Gaps (Coming Soon)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `POST` | `/api/skill-gaps/analyze/{interview_id}` | Analyze & save skill gaps | ⬜ Day 14 |
| `GET` | `/api/skill-gaps/` | Get all user skill gaps | ⬜ Day 14 |
| `GET` | `/api/skill-gaps/interview/{interview_id}` | Get interview skill gaps | ⬜ Day 14 |

---

## 🔐 Authentication - Day 6 & Day 7

### Register - `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "myusername",
  "password": "MyPass123",
  "full_name": "My Full Name"
}
```

**Success Response (201 Created):**
```json
{
  "id": "cd45625f-3c51-453d-8310-fd3b365ffa51",
  "email": "user@example.com",
  "username": "myusername",
  "full_name": "My Full Name",
  "is_active": true,
  "created_at": "2026-02-20T17:44:27.616878"
}
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `email` | Must be valid email format, must be unique |
| `username` | 3-50 chars, letters/numbers/hyphens/underscores only, must be unique |
| `password` | Min 8 chars, at least 1 uppercase letter, at least 1 number |
| `full_name` | Min 2 characters |

**Error Responses:**

| Status | Detail |
|--------|--------|
| `400` | Email already registered |
| `400` | Username already taken |
| `422` | Validation error (password too weak, username too short, etc.) |

---

### Login - `POST /api/auth/login` ✅ Day 7

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "MyPass123"
}
```

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "cd45625f-3c51-453d-8310-fd3b365ffa51",
    "email": "user@example.com",
    "username": "myusername",
    "full_name": "My Full Name",
    "is_active": true,
    "created_at": "2026-02-20T17:44:27.616878"
  }
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| `401` | Incorrect email or password |
| `403` | Account is inactive |

---

### Get Current User - `GET /api/auth/me` ✅ Day 7

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Success Response (200 OK):**
```json
{
  "id": "cd45625f-3c51-453d-8310-fd3b365ffa51",
  "email": "test@example.com",
  "username": "testuser",
  "full_name": "Test User",
  "is_active": true,
  "created_at": "2026-02-20T17:44:27.616878"
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| `401` | Not authenticated (no token) |
| `401` | Could not validate credentials (invalid/expired token) |
| `403` | Account is inactive |

---

## 👤 User Profile - Day 8

### Get Profile - `GET /api/user/profile` ✅ Day 8

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Success Response (200 OK):**
```json
{
  "id": "cd45625f-3c51-453d-8310-fd3b365ffa51",
  "email": "test@example.com",
  "username": "testuser",
  "full_name": "Test User",
  "is_active": true,
  "created_at": "2026-02-20T17:44:27.616878"
}
```

---

### Update Profile - `PUT /api/user/profile` ✅ Day 8

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Request Body (all fields optional):**
```json
{
  "full_name": "New Full Name",
  "username": "newusername"
}
```

**Success Response (200 OK):**
```json
{
  "id": "cd45625f-3c51-453d-8310-fd3b365ffa51",
  "email": "test@example.com",
  "username": "newusername",
  "full_name": "New Full Name",
  "is_active": true,
  "created_at": "2026-02-20T17:44:27.616878"
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| `400` | Username already taken |
| `401` | Not authenticated |
| `422` | Validation error |

---

### Get Stats - `GET /api/user/stats` ✅ Day 8

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Success Response (200 OK):**
```json
{
  "total_interviews": 0,
  "completed_interviews": 0,
  "average_score": 0.0,
  "best_score": 0.0,
  "total_questions_answered": 0,
  "member_since": "2026-02-20T17:44:27.616878",
  "account_status": "active"
}
```

---

## 🤖 OpenAI Integration - Day 9

### Test AI Connection - `GET /api/test/ai` ✅ Day 9

**Success Response (200 OK):**
```json
{
  "status": "connected",
  "model": "gpt-3.5-turbo",
  "response": "OpenAI connection successful!"
}
```

**Error Response:**
```json
{
  "status": "failed",
  "model": "gpt-3.5-turbo",
  "error": "Incorrect API key provided"
}
```

---

## 🎯 Interview Management - Day 10 & Day 11

### Create Interview - `POST /api/interview/create` ✅ Day 10

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Request Body:**
```json
{
  "job_role": "Python Developer",
  "difficulty": "intermediate",
  "num_questions": 3,
  "question_type": "mixed"
}
```

**Field Options:**

| Field | Options | Default |
|-------|---------|---------|
| `job_role` | Any string (2-100 chars) | Required |
| `difficulty` | beginner / intermediate / advanced | intermediate |
| `num_questions` | 1-10 | 5 |
| `question_type` | technical / behavioral / mixed | mixed |

**Success Response (201 Created):**
```json
{
  "interview_id": "849ff4b1-b0af-47de-8c7b-959710f2b137",
  "job_role": "Python Developer",
  "difficulty": "intermediate",
  "question_type": "mixed",
  "total_questions": 3,
  "questions": [
    {
      "id": "d9dee515-78a5-4539-ab7a-1d35ee52a906",
      "question": "Explain the difference between list comprehension and generator expression in Python.",
      "type": "technical",
      "difficulty": "intermediate",
      "expected_points": [
        "List comprehension returns a list",
        "Generator expressions are memory-efficient",
        "List comprehensions use [] while generators use ()"
      ],
      "order_number": 1
    }
  ],
  "status": "in_progress",
  "created_at": "2026-02-24T13:33:15.536135"
}
```

---

### List My Interviews - `GET /api/interview/` ✅ Day 11

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Success Response (200 OK):**
```json
{
  "total": 1,
  "interviews": [
    {
      "interview_id": "849ff4b1-b0af-47de-8c7b-959710f2b137",
      "job_role": "Python Developer",
      "difficulty": "intermediate",
      "total_questions": 3,
      "status": "in_progress",
      "overall_score": null,
      "created_at": "2026-02-24T13:33:15.536135"
    }
  ]
}
```

---

### Get Interview Detail - `GET /api/interview/{interview_id}` ✅ Day 11

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Success Response (200 OK):**
```json
{
  "interview_id": "849ff4b1-b0af-47de-8c7b-959710f2b137",
  "job_role": "Python Developer",
  "difficulty": "intermediate",
  "question_type": "mixed",
  "total_questions": 3,
  "questions": [
    {
      "id": "d9dee515-78a5-4539-ab7a-1d35ee52a906",
      "question": "Explain the difference between list comprehension and generator expression in Python.",
      "type": "technical",
      "difficulty": "intermediate",
      "expected_points": [
        "List comprehension returns a list",
        "Generator expressions are memory-efficient",
        "List comprehensions use [] while generators use ()"
      ],
      "order_number": 1
    }
  ],
  "status": "in_progress",
  "created_at": "2026-02-24T13:33:15.536135"
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| `404` | Interview not found |
| `401` | Not authenticated |

---

### Complete Interview - `PATCH /api/interview/{interview_id}/complete` ✅ Day 11

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Success Response (200 OK):**
```json
{
  "interview_id": "849ff4b1-b0af-47de-8c7b-959710f2b137",
  "status": "completed",
  "message": "Interview completed successfully",
  "completed_at": "2026-02-24T13:42:47.510167"
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| `404` | Interview not found |
| `401` | Not authenticated |

---

## 📝 Answer Submission & Evaluation - Day 12

### Submit Answer - `POST /api/interview/{interview_id}/answer/{question_id}` ✅ Day 12

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Request Body:**
```json
{
  "user_answer": "A list comprehension returns a full list stored in memory, while a generator expression returns a lazy iterator that yields items one at a time. Generators are more memory efficient for large datasets.",
  "time_taken_seconds": 120
}
```

**Field Rules:**

| Field | Rules |
|-------|-------|
| `user_answer` | Required, 1-5000 characters |
| `time_taken_seconds` | Optional, must be >= 0 |

**Success Response (201 Created):**
```json
{
  "response_id": "44b32da7-237d-4547-8d33-3cd95c891a78",
  "interview_id": "f569d79e-baff-4ac7-b03f-46b9190d5857",
  "question_id": "d9a87d4f-3257-4d4c-8896-a782d987565f",
  "question_text": "Explain the difference between list comprehension and generator expression in Python.",
  "user_answer": "A list comprehension returns a full list...",
  "score": 85,
  "feedback": "The candidate provided a clear and accurate explanation...",
  "strengths": [
    "Clear explanation",
    "Memory efficiency understanding"
  ],
  "improvements": [
    "Could provide more examples",
    "Could elaborate on lazy evaluation benefits"
  ],
  "keywords_mentioned": [
    "list comprehension",
    "generator expression",
    "memory efficiency",
    "lazy evaluation"
  ],
  "time_taken_seconds": 120,
  "answered_at": "2026-02-25T17:01:14.263734"
}
```

**How GPT-4 Scores (0-100):**

| Criteria | Weight |
|----------|--------|
| Accuracy and correctness | 40% |
| Coverage of key points | 30% |
| Clarity and communication | 20% |
| Depth of knowledge | 10% |

**Error Responses:**

| Status | Detail |
|--------|--------|
| `404` | Interview not found |
| `404` | Question not found in interview |
| `404` | Question already answered |
| `401` | Not authenticated |

---

### Get Interview Results - `GET /api/interview/{interview_id}/results` ✅ Day 12

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Success Response (200 OK):**
```json
{
  "interview_id": "f569d79e-baff-4ac7-b03f-46b9190d5857",
  "job_role": "Python Developer",
  "difficulty": "intermediate",
  "status": "in_progress",
  "overall_score": 51.67,
  "total_questions": 3,
  "answered": 3,
  "responses": [
    {
      "response_id": "44b32da7-...",
      "question_id": "d9a87d4f-...",
      "question_text": "Explain the difference between list comprehension...",
      "question_type": "technical",
      "order_number": 1,
      "user_answer": "A list comprehension returns a full list...",
      "score": 85,
      "feedback": "The candidate provided a clear and accurate explanation...",
      "strengths": ["Clear explanation", "Memory efficiency understanding"],
      "improvements": ["Could provide more examples"],
      "time_taken_seconds": 120,
      "answered_at": "2026-02-25T17:01:14.263734"
    }
  ],
  "created_at": "2026-02-25T16:59:07.029162",
  "completed_at": null
}
```

**Error Responses:**

| Status | Detail |
|--------|--------|
| `404` | Interview not found |
| `401` | Not authenticated |

---

## 📊 Scoring & Feedback - Day 13

### Get Interview Score - `GET /api/interview/{interview_id}/score` ✅ Day 13

**Headers Required:**
```
Authorization: Bearer <your_token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `generate_summary` | bool | true | Set to false to skip GPT summary (saves API cost) |

**Success Response (200 OK):**
```json
{
  "interview_id": "f569d79e-baff-4ac7-b03f-46b9190d5857",
  "job_role": "Python Developer",
  "difficulty": "intermediate",
  "status": "in_progress",
  "overall_score": 51.67,
  "performance": {
    "level": "average",
    "label": "Average 📈",
    "message": "Average performance. Focus on the improvement areas to boost your score.",
    "color": "yellow"
  },
  "total_questions": 3,
  "answered": 3,
  "skipped": 0,
  "completion_rate": 100.0,
  "category_scores": [
    {
      "category": "technical",
      "average_score": 51.67,
      "total_questions": 3,
      "answered": 3
    }
  ],
  "question_scores": [
    {
      "question_id": "d9a87d4f-...",
      "question_text": "Explain the difference between list comprehension...",
      "question_type": "technical",
      "order_number": 1,
      "score": 85,
      "feedback": "Clear and accurate explanation...",
      "strengths": ["Clear explanation", "Memory efficiency understanding"],
      "improvements": ["Could provide more examples"],
      "answered": true
    }
  ],
  "overall_summary": "GPT-4 generated interview summary...",
  "top_strengths": ["strength 1", "strength 2"],
  "top_improvements": ["improvement 1", "improvement 2"],
  "started_at": "2026-02-25T16:59:07.029162",
  "completed_at": null
}
```

**Performance Levels:**

| Score Range | Level | Label | Color |
|-------------|-------|-------|-------|
| 85 - 100 | excellent | Excellent! 🌟 | green |
| 70 - 84 | good | Good 👍 | blue |
| 50 - 69 | average | Average 📈 | yellow |
| 0 - 49 | poor | Needs Work 💪 | red |

**Error Responses:**

| Status | Detail |
|--------|--------|
| `404` | Interview not found |
| `401` | Not authenticated |

---

### Security Notes
- Passwords are hashed with **bcrypt** before storing
- Passwords are **never stored in plain text**
- Passwords are **never returned** in API responses
- All UUIDs are auto-generated
- JWT tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default 1440 = 24 hours)
- Wrong credentials always return the same error (never reveals which field is wrong)
- OpenAI API key is stored in `.env` and **never committed to GitHub**

---

## 🧩 Core Modules

### `app/core/security.py` ✅ Day 6

| Function | Description |
|----------|-------------|
| `hash_password(password)` | Hash plain text password with bcrypt |
| `verify_password(plain, hashed)` | Verify password against hash |
| `create_access_token(data)` | Create signed JWT token |
| `decode_access_token(token)` | Decode and verify JWT token |

### `app/api/deps.py` ✅ Day 7

| Function | Description |
|----------|-------------|
| `get_current_user()` | Extracts & validates JWT token, returns user |
| `get_current_active_user()` | Extends above with active status check |

### `app/schemas/user.py` ✅ Day 6 + Day 8

| Schema | Day | Usage |
|--------|-----|-------|
| `UserCreate` | Day 6 | Validate registration request body |
| `UserLogin` | Day 6 | Validate login request body |
| `UserResponse` | Day 6 | Shape the registration/login response |
| `Token` | Day 6 | JWT token response shape (includes user) |
| `TokenData` | Day 6 | JWT payload data shape |
| `UserProfileUpdate` | Day 8 | Validate profile update request body |
| `UserStatsResponse` | Day 8 | Shape the dashboard stats response |

### `app/schemas/interview.py` ✅ Day 10 + Day 11

| Schema | Day | Usage |
|--------|-----|-------|
| `InterviewCreateRequest` | Day 10 | Validate interview creation request |
| `InterviewCreateResponse` | Day 10 | Shape create interview response |
| `QuestionResponse` | Day 10 | Shape individual question data |
| `InterviewDetailResponse` | Day 11 | Shape full interview detail response |
| `InterviewSummary` | Day 11 | Shape interview list item |
| `InterviewListResponse` | Day 11 | Shape list all interviews response |
| `InterviewCompleteResponse` | Day 11 | Shape complete interview response |

### `app/schemas/response.py` ✅ Day 12

| Schema | Day | Usage |
|--------|-----|-------|
| `SubmitAnswerRequest` | Day 12 | Validate answer submission body |
| `EvaluationResult` | Day 12 | Shape GPT-4 evaluation result |
| `SubmitAnswerResponse` | Day 12 | Shape answer submission response |
| `ResponseDetail` | Day 12 | Shape single response detail |
| `InterviewResultsResponse` | Day 12 | Shape full interview results |

### `app/schemas/score.py` ✅ Day 13

| Schema | Day | Usage |
|--------|-----|-------|
| `CategoryScore` | Day 13 | Score breakdown per question type |
| `QuestionScoreDetail` | Day 13 | Per-question score with feedback |
| `PerformanceLevel` | Day 13 | Level label + message + color |
| `InterviewScoreResponse` | Day 13 | Full score breakdown response |

### `app/api/user.py` ✅ Day 8

| Function | Description |
|----------|-------------|
| `get_profile()` | Returns current user profile |
| `update_profile()` | Updates full_name and/or username |
| `get_stats()` | Returns dashboard statistics |

### `app/api/interview.py` ✅ Day 10 → Day 13

| Function | Day | Description |
|----------|-----|-------------|
| `create_interview()` | Day 10 | Creates interview + generates GPT questions |
| `list_interviews()` | Day 11 | Returns all interviews for current user |
| `get_interview()` | Day 11 | Returns interview detail with all questions |
| `complete_interview()` | Day 11 | Marks interview as completed |
| `submit_answer()` | Day 12 | Submits answer + GPT-4 evaluation |
| `get_interview_results()` | Day 12 | Returns all Q&A + scores + feedback |
| `get_interview_score()` | Day 13 | Returns full score breakdown + summary |

### `app/services/openai_service.py` ✅ Day 9

| Function | Description |
|----------|-------------|
| `chat()` | Base GPT-4 chat call |
| `generate_interview_questions()` | Generate questions by role & difficulty |
| `evaluate_answer()` | Evaluate candidate answer with score & feedback |
| `analyze_skill_gaps()` | Analyze interview performance & identify gaps |
| `test_connection()` | Verify API key is working |

### `app/services/interview_service.py` ✅ Day 10 + Day 11

| Function | Description |
|----------|-------------|
| `_build_prompt()` | Build GPT prompt for question generation |
| `_generate_questions()` | Call GPT and parse response to list of dicts |
| `_map_difficulty()` | Map string to DifficultyLevel enum |
| `_map_question_type()` | Map string to QuestionType enum |
| `create_interview()` | Create interview + questions → save to PostgreSQL |
| `get_interview()` | Fetch interview + questions from PostgreSQL |
| `get_user_interviews()` | Fetch all interviews for a user from PostgreSQL |
| `complete_interview()` | Update interview status to COMPLETED in PostgreSQL |

### `app/services/evaluation_service.py` ✅ Day 12

| Function | Description |
|----------|-------------|
| `_build_evaluation_prompt()` | Build GPT prompt with scoring criteria |
| `_parse_evaluation()` | Clean and parse GPT JSON response |
| `submit_answer()` | Validate → evaluate with GPT-4 → save to PostgreSQL |
| `_update_interview_score()` | Recalculate interview average score |
| `get_interview_results()` | Fetch all Q&A + responses from PostgreSQL |

### `app/services/scoring_service.py` ✅ Day 13

| Function | Description |
|----------|-------------|
| `_get_performance_level()` | Map score to Excellent/Good/Average/Poor |
| `_calculate_category_scores()` | Average scores per question type category |
| `_generate_summary()` | GPT-4 overall interview summary + top strengths |
| `get_interview_score()` | Full score breakdown → update DB → return response |

---

## 🔧 Database Migrations

### Create a New Migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback Last Migration

```bash
alembic downgrade -1
```

### View Migration History

```bash
alembic history
```

---

## 🧪 Testing

### Option 1 - Swagger UI (Recommended) ✅

Open browser and go to: **http://localhost:8000/api/docs**
- Click any endpoint → Click **"Try it out"** → Fill in data → Click **"Execute"**
- No commands needed!

---

### Option 2 - PowerShell

#### Test Registration & Login

```powershell
# Register
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "username": "testuser", "password": "Test1234", "full_name": "Test User"}'

# Login and save token
$response = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "password": "Test1234"}'
$token = $response.access_token
```

#### Test Full Interview Lifecycle

```powershell
# Step 1 - Create interview
$interview = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/interview/create" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"job_role": "Python Developer", "difficulty": "intermediate", "num_questions": 3, "question_type": "technical"}'
$interviewId = $interview.interview_id
$q1Id = $interview.questions[0].id

# Step 2 - Submit answer (GPT evaluates)
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/interview/$interviewId/answer/$q1Id" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"user_answer": "Your answer here", "time_taken_seconds": 120}'

# Step 3 - Get full results
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/interview/$interviewId/results" `
  -Headers @{Authorization = "Bearer $token"}

# Step 4 - Get score breakdown
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/interview/$interviewId/score?generate_summary=true" `
  -Headers @{Authorization = "Bearer $token"}

# Step 5 - Complete interview
Invoke-RestMethod -Method PATCH `
  -Uri "http://localhost:8000/api/interview/$interviewId/complete" `
  -Headers @{Authorization = "Bearer $token"}
```

#### Verify in Database

```powershell
# Check interviews table
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT id, job_role, overall_score, status FROM interviews;"

# Check questions table
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT id, question_text, order_number FROM questions;"

# Check responses table
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT id, score, ai_feedback, answered_at FROM responses;"
```

---

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | AI Interview Simulator |
| `APP_VERSION` | Application version | 1.0.0 |
| `DEBUG` | Debug mode | True |
| `HOST` | Server host | 0.0.0.0 |
| `PORT` | Server port | 8000 |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SECRET_KEY` | JWT secret key (min 32 chars) | Required |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | 1440 (24 hours) |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:3000,3001 |
| `OPENAI_API_KEY` | OpenAI API key | Required ✅ Day 9 |
| `OPENAI_MODEL` | GPT model to use | gpt-3.5-turbo ✅ Day 9 |
| `OPENAI_MAX_TOKENS` | Max tokens per request | 2000 ✅ Day 9 |
| `OPENAI_TEMPERATURE` | Response creativity (0-1) | 0.7 ✅ Day 9 |

---

## 📦 Dependencies

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
pydantic==2.12.5
pydantic-settings==2.0.3
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
python-dotenv==1.0.0
python-multipart==0.0.6
python-dateutil==2.8.2
openai>=1.50.0
```

Install all:
```powershell
pip install -r requirements.txt
pip install "pydantic[email]"
```

---

## 🐛 Troubleshooting

### `ModuleNotFoundError: No module named 'email_validator'`
```powershell
pip install "pydantic[email]"
```

### Wrong Virtual Environment (SQLAlchemy AssertionError)
```powershell
# Always use backend/venv NOT root/.venv
deactivate
cd D:\ai-interview-simulator\backend
.\venv\Scripts\Activate.ps1
python main.py
```

### psql command not found
```powershell
$env:PATH += ";D:\postgress\bin"
```

### Database connection failed
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify password is correct
- Make sure `ai_interview_db` exists

### Table does not exist
- Tables are auto-created on startup via `Base.metadata.create_all()`
- Or run: `alembic upgrade head`
- Restart the server

### Port 8000 already in use
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### JWT Token Issues
- Make sure `SECRET_KEY` in `.env` is set and at least 32 characters
- Make sure token is passed as `Bearer <token>` in the Authorization header
- Tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` — login again to get a new one

### OpenAI 401 - Incorrect API Key
- Go to https://platform.openai.com/api-keys
- Create a new key and copy the full key
- Paste in `.env` without quotes: `OPENAI_API_KEY=sk-proj-xxx`
- Restart server after updating `.env`

### OpenAI `proxies` TypeError
```powershell
pip install --upgrade openai
```

### Question already answered (404)
- Each question can only be answered once
- Use a different question_id or create a new interview

### Circular Import Error
- Never import services inside model files
- Models should only import from `app.core.database`
- Services import from models, never the other way around

### Question ID showing "None"
- Make sure `db.flush()` is called after `db.add(question)`
- This forces PostgreSQL to assign the UUID immediately

### Pylance Import Warnings in VS Code
- These are **not real errors** — just VS Code can't resolve paths
- Code still runs fine
- Fix: `Ctrl+Shift+P` → Python: Select Interpreter → choose venv

### Git Push Rejected
```powershell
git pull origin main --rebase
git push origin main
```

### Alembic errors
```bash
alembic downgrade base
alembic upgrade head
```

---

## 📝 Development Notes

### Adding a New Model

1. Create model in `app/models/your_model.py`
2. Import in `app/models/__init__.py`
3. Create migration: `alembic revision --autogenerate -m "Add your_model"`
4. Apply migration: `alembic upgrade head`

### Adding a New Route

1. Create router in `app/api/your_router.py`
2. Import and include in `main.py`:
```python
from app.api.your_router import router as your_router
app.include_router(your_router)
```

### Protecting a Route

```python
from app.api.deps import get_current_active_user
from app.models.user import User

@router.get("/protected")
def protected_route(current_user: User = Depends(get_current_active_user)):
    return {"message": f"Hello {current_user.username}"}
```

### Import Rules (Avoid Circular Imports!)

```
✅ models   → core.database only
✅ schemas  → no model imports
✅ services → models + schemas + core
✅ api      → services + schemas + models + deps
❌ models   → services  (NEVER!)
❌ schemas  → models    (NEVER!)
```

### Code Style

- Follow PEP 8
- Use type hints everywhere
- Add docstrings to all functions
- Keep functions focused and small

---

## 📊 Progress Tracker

```
Week 1 - Foundation
✅ Day 1  - Project setup & GitHub
✅ Day 2  - Database schema & API design
✅ Day 3  - FastAPI initialization
✅ Day 4  - PostgreSQL database + ORM models
✅ Day 5  - Next.js frontend + landing page
✅ Day 6  - User registration API
✅ Day 7  - Login API + JWT tokens

Week 2 - Core Backend APIs & AI Integration
✅ Day 8  - User profile endpoints
✅ Day 9  - OpenAI GPT-4 integration
✅ Day 10 - Question generation + interview create
✅ Day 11 - PostgreSQL storage + full interview lifecycle
✅ Day 12 - Answer submission & AI evaluation
✅ Day 13 - Scoring algorithm & feedback
⬜ Day 14 - Skill gap analysis
```

---

## 🚀 Deployment (Future)

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY` (min 32 chars)
- [ ] Set up proper CORS origins
- [ ] Use environment-specific configs
- [ ] Set up logging
- [ ] Add rate limiting
- [ ] Configure SSL/TLS

---

## 📄 License

This project is part of a learning portfolio.

## 👤 Author

**SRIDEV20**
- GitHub: [@SRIDEV20INFO](https://github.com/SRIDEV20INFO)

## 🙏 Acknowledgments

- FastAPI documentation
- SQLAlchemy tutorials
- PostgreSQL community
- Pydantic v2 documentation
- OpenAI documentation