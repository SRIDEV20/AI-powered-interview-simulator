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
│   │   └── user.py           # ✅ Day 8 - Profile & Stats endpoints
│   ├── core/                 # Configuration & database
│   │   ├── config.py         # ✅ Day 9 - Added OpenAI settings
│   │   ├── database.py       # Database connection
│   │   └── security.py       # ✅ Day 6 - bcrypt & JWT utils
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── interview.py
│   │   ├── question.py
│   │   ├── response.py
│   │   └── skill_gap.py
│   ├── schemas/              # Pydantic schemas
│   │   ├── __init__.py
│   │   └── user.py           # ✅ Day 8 - Added UserProfileUpdate, UserStatsResponse
│   └── services/             # Business logic
│       ├── __init__.py
│       └── openai_service.py # ✅ Day 9 - GPT-4 service wrapper
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
# Windows
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
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

**⚠️ Important:**
- Replace `YOUR_PASSWORD` with your PostgreSQL password!
- Replace `sk-your-real-key-here` with your real OpenAI API key!
- Never commit `.env` to GitHub!

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

### Interviews (Coming Soon)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `POST` | `/api/interviews/start` | Start new interview | ⬜ Day 11+ |
| `GET` | `/api/interviews/{id}` | Get interview details | ⬜ Day 11+ |
| `GET` | `/api/interviews/user/{user_id}` | Get user's interviews | ⬜ Day 11+ |

### Questions (Coming Soon)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/questions/{interview_id}` | Get interview questions | ⬜ Day 11+ |
| `POST` | `/api/questions/{id}/answer` | Submit answer | ⬜ Day 12+ |

### Skill Gaps (Coming Soon)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/skill-gaps/user/{user_id}` | Get user's skill gaps | ⬜ Day 14+ |
| `GET` | `/api/skill-gaps/interview/{interview_id}` | Interview skill gaps | ⬜ Day 14+ |

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
  "model": "gpt-4",
  "response": "OpenAI connection successful!"
}
```

**Error Response:**
```json
{
  "status": "failed",
  "model": "gpt-4",
  "error": "Incorrect API key provided"
}
```

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

### `app/api/user.py` ✅ Day 8

| Function | Description |
|----------|-------------|
| `get_profile()` | Returns current user profile |
| `update_profile()` | Updates full_name and/or username |
| `get_stats()` | Returns dashboard statistics |

### `app/services/openai_service.py` ✅ Day 9

| Function | Description |
|----------|-------------|
| `chat()` | Base GPT-4 chat call |
| `generate_interview_questions()` | Generate questions by role & difficulty |
| `evaluate_answer()` | Evaluate candidate answer with score & feedback |
| `analyze_skill_gaps()` | Analyze interview performance & identify gaps |
| `test_connection()` | Verify API key is working |

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

#### Test Registration

```powershell
# ✅ Test 1 - Successful registration
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "username": "testuser", "password": "Test1234", "full_name": "Test User"}'

# ✅ Test 2 - Duplicate email
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "username": "anotheruser", "password": "Test1234", "full_name": "Another User"}'

# ✅ Test 3 - Weak password
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"email": "new@example.com", "username": "newuser", "password": "weak", "full_name": "New User"}'

# ✅ Test 4 - Short username
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"email": "new2@example.com", "username": "ab", "password": "Test1234", "full_name": "New User"}'

# ✅ Test 5 - Health check
Invoke-RestMethod -Uri "http://localhost:8000/api/health"
```

#### Test Login & Protected Routes

```powershell
# ✅ Login and save token automatically
$response = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "password": "Test1234"}'
$token = $response.access_token

# ✅ Get current user
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/auth/me" `
  -Headers @{Authorization = "Bearer $token"}
```

#### Test User Profile & Stats

```powershell
# ✅ Login and save token
$response = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email": "test@example.com", "password": "Test1234"}'
$token = $response.access_token

# ✅ Test 1 - Get profile
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/user/profile" `
  -Headers @{Authorization = "Bearer $token"}

# ✅ Test 2 - Update full name
Invoke-RestMethod -Method PUT `
  -Uri "http://localhost:8000/api/user/profile" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"full_name": "Test User Updated"}'

# ✅ Test 3 - Update username
Invoke-RestMethod -Method PUT `
  -Uri "http://localhost:8000/api/user/profile" `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body '{"username": "testuserupdated"}'

# ✅ Test 4 - Get dashboard stats
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/user/stats" `
  -Headers @{Authorization = "Bearer $token"}

# ✅ Test 5 - Access without token (should fail)
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:8000/api/user/profile"
```

#### Test OpenAI Connection

```powershell
# ✅ Test AI connection
Invoke-RestMethod -Uri "http://localhost:8000/api/test/ai"
```

### Verify in Database

```powershell
D:\postgress\bin\psql -U postgres -d ai_interview_db -c "SELECT id, email, username, is_active, created_at FROM users;"
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
| `OPENAI_MODEL` | GPT model to use | gpt-4 ✅ Day 9 |
| `OPENAI_MAX_TOKENS` | Max tokens per request | 1000 ✅ Day 9 |
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
# Upgrade openai package
pip install --upgrade openai
```

### Pylance Import Warnings in VS Code
- These are **not real errors** — just VS Code can't resolve paths
- Code still runs fine
- Fix: `Ctrl+Shift+P` → Python: Select Interpreter → choose venv

### Git Push Rejected
```powershell
# Always pull before push
git pull origin main --rebase
git push origin main
```

### Alembic errors
```bash
# Reset migrations (careful - destroys data!)
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

Use `get_current_user` dependency from `app/api/deps.py`:
```python
from app.api.deps import get_current_user
from app.models.user import User

@router.get("/protected")
def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello {current_user.username}"}
```

### Code Style

- Follow PEP 8
- Use type hints everywhere
- Add docstrings to all functions
- Keep functions focused and small

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