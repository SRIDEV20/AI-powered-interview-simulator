from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.api.auth import router as auth_router
from app.api.user import router as user_router          # ✅ Day 8
from app.api.interview import router as interview_router # ✅ Day 10 NEW
from app.core.database import engine, Base

# Create all database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app instance
app = FastAPI(
    title="AI Interview Simulator API",
    description="Backend API for AI-powered interview simulation and skill gap analysis",
    version="1.0.0",
    docs_url="/api/docs",   # Swagger UI
    redoc_url="/api/redoc"  # ReDoc
)

# ─── CORS Configuration ──────────────────────────────────────────
origins = [
    "http://localhost:3000",  # Next.js default port
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Include Routers ─────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(user_router)                         # ✅ Day 8
app.include_router(interview_router)                    # ✅ Day 10 NEW

# ─── Root Endpoints ──────────────────────────────────────────────

@app.get("/")
async def root():
    """
    Root endpoint - Health check
    Returns API status and current timestamp
    """
    return {
        "message": "AI Interview Simulator API",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    Used to verify API is running properly
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/info")
async def api_info():
    """
    API information endpoint
    Returns details about the API
    """
    return {
        "name": "AI Interview Simulator API",
        "version": "1.0.0",
        "description": "Backend API for AI-powered interview simulation and skill gap analysis",
        "endpoints": {
            "docs"            : "/api/docs",
            "redoc"           : "/api/redoc",
            "health"          : "/api/health",
            "register"        : "/api/auth/register",
            "login"           : "/api/auth/login",
            "me"              : "/api/auth/me",
            "logout"          : "/api/auth/logout",
            "profile"         : "/api/user/profile",        # ✅ Day 8
            "stats"           : "/api/user/stats",          # ✅ Day 8
            "ai_test"         : "/api/test/ai",             # ✅ Day 9
            "interview_create": "/api/interview/create",    # ✅ Day 10 NEW
            "interview_get"   : "/api/interview/{id}",      # ✅ Day 10 NEW
            "interview_list"  : "/api/interview/"           # ✅ Day 10 NEW
        }
    }


# ─── Day 9 - AI Connection Test Endpoint ─────────────────────────

@app.get("/api/test/ai", tags=["Test"])
async def test_ai():
    """
    Test OpenAI GPT-4 connection.
    Verifies API key is working correctly.
    ⚠️ Temporary endpoint - only for Day 9 testing.
    """
    from app.services.openai_service import openai_service
    result = openai_service.test_connection()
    return result


# ─── Run Server ──────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload on code changes (development only)
    )