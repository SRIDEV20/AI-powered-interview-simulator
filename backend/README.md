# AI Interview Simulator - Backend

FastAPI backend for the AI Interview Simulator project.

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn
- **Database**: PostgreSQL + SQLAlchemy
- **Authentication**: JWT + bcrypt
- **Migrations**: Alembic

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Server

```bash
python main.py
```

## API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## Available Endpoints

- `GET /` - API information
- `GET /api/health` - Health check
- `GET /api/info` - API details