from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Create FastAPI app instance
app = FastAPI(
    title="AI Interview Simulator API",
    description="Backend API for AI-powered interview simulation and skill gap analysis",
    version="1.0.0",
    docs_url="/api/docs",  # Swagger UI
    redoc_url="/api/redoc"  # ReDoc
)

# CORS Configuration
# Allow frontend to communicate with backend
origins = [
    "http://localhost:3000",  # Next.js default port
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Root endpoint - Health check
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

# API Health endpoint
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

# API Info endpoint
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
            "docs": "/api/docs",
            "redoc": "/api/redoc",
            "health": "/api/health"
        }
    }

# Run this when file is executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload on code changes (development only)
    )