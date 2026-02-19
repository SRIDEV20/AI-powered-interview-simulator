# AI Interview Simulator - Backend

FastAPI backend for the AI Interview Simulator project with PostgreSQL database and AI-powered interview analysis.

## 🚀 Tech Stack

- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn 0.24.0
- **Database**: PostgreSQL 18 + SQLAlchemy 2.0.35
- **Authentication**: JWT (python-jose) + bcrypt
- **Migrations**: Alembic 1.12.1
- **Validation**: Pydantic 2.12.5

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/              # API routes/endpoints
│   ├── core/             # Configuration & database
│   │   ├── config.py     # Settings management
│   │   └── database.py   # Database connection
│   ├── models/           # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── interview.py
│   │   ├── question.py
│   │   ├── response.py
│   │   └── skill_gap.py
│   ├── schemas/          # Pydantic schemas (API validation)
│   └── services/         # Business logic
├── alembic/              # Database migrations
│   ├── versions/         # Migration files
│   └── env.py           # Alembic configuration
├── venv/                 # Virtual environment (not in git)
├── .env                  # Environment variables (not in git)
├── alembic.ini           # Alembic settings
├── main.py               # Application entry point
├── requirements.txt      # Python dependencies
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

## ⚙️ Setup Instructions

### 1. Prerequisites

- Python 3.10+ installed
- PostgreSQL 18 installed and running
- Git installed

### 2. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-interview-simulator.git
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
```

### 6. Set Up PostgreSQL Database

**Connect to PostgreSQL:**
```bash
# Windows (adjust path to your PostgreSQL installation)
D:\postgress\bin\psql -U postgres

# Or if PostgreSQL is in PATH:
psql -U postgres
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
```

**⚠️ Important:** Replace `YOUR_PASSWORD` with your PostgreSQL password!

### 8. Run Database Migrations

```bash
# Create all database tables
alembic upgrade head
```

### 9. Start the Server

```bash
python main.py
```

Server will start at: **http://localhost:8000**

## 📚 API Documentation

Once the server is running, access interactive documentation:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## 🛣️ Available Endpoints

### Root & Health
- `GET /` - API information and status
- `GET /api/health` - Health check endpoint
- `GET /api/info` - API details and version

### Users (Coming Soon)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user profile

### Interviews (Coming Soon)
- `POST /api/interviews/start` - Start new interview
- `GET /api/interviews/{id}` - Get interview details
- `GET /api/interviews/user/{user_id}` - Get user's interviews

### Questions (Coming Soon)
- `GET /api/questions/{interview_id}` - Get interview questions
- `POST /api/questions/{id}/answer` - Submit answer

### Skill Gaps (Coming Soon)
- `GET /api/skill-gaps/user/{user_id}` - Get user's skill gaps
- `GET /api/skill-gaps/interview/{interview_id}` - Get interview skill gaps

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

## 🧪 Testing

### Test Database Connection

Create `test_db.py`:

```python
from app.core.database import engine
from sqlalchemy import text

with engine.connect() as connection:
    result = connection.execute(text("SELECT version();"))
    print(f"✅ Connected to: {result.fetchone()[0]}")
```

Run:
```bash
python test_db.py
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | AI Interview Simulator |
| `DEBUG` | Debug mode | True |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SECRET_KEY` | JWT secret key | Required |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | 1440 (24 hours) |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:3000,3001 |

## 📦 Dependencies

Core packages:
- `fastapi==0.104.1` - Web framework
- `uvicorn==0.24.0` - ASGI server
- `sqlalchemy==2.0.35` - ORM
- `alembic==1.12.1` - Database migrations
- `psycopg2-binary==2.9.9` - PostgreSQL driver
- `pydantic==2.12.5` - Data validation
- `python-jose==3.3.0` - JWT handling
- `passlib==1.7.4` - Password hashing
- `bcrypt==4.0.1` - Password encryption

See `requirements.txt` for complete list.

## 🐛 Troubleshooting

### psql command not found
Add PostgreSQL bin folder to PATH: `D:\postgress\bin`

### Database connection failed
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify password is correct

### Alembic errors
```bash
# Reset migrations (careful - destroys data!)
alembic downgrade base
alembic upgrade head
```

### Port 8000 already in use
```bash
# Change port in .env or kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## 📝 Development Notes

### Adding a New Model

1. Create model in `app/models/your_model.py`
2. Import in `app/models/__init__.py`
3. Create migration: `alembic revision --autogenerate -m "Add your_model"`
4. Apply migration: `alembic upgrade head`

### Code Style

- Follow PEP 8
- Use type hints
- Add docstrings to functions
- Keep functions focused and small

## 🚀 Deployment (Future)

- [ ] Set DEBUG=False
- [ ] Use strong SECRET_KEY
- [ ] Set up proper CORS origins
- [ ] Use environment-specific configs
- [ ] Set up logging
- [ ] Add rate limiting
- [ ] Configure SSL/TLS

## 📄 License

This project is part of a learning portfolio.

## 👤 Author

**SRIDEV20**
- GitHub: [@SRIDEV20](https://github.com/SRIDEV20)

## 🙏 Acknowledgments

- FastAPI documentation
- SQLAlchemy tutorials
- PostgreSQL community