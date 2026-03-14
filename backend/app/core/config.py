from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # Application
    APP_NAME: str = "AI Interview Simulator"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/ai_interview_db"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # ─── OpenAI Settings ──────────────────────────────────────── ✅ Day 9 NEW
    OPENAI_API_KEY: str = "sk-placeholder-add-real-key-later"
    OPENAI_MODEL: str = "gpt-4"
    OPENAI_MAX_TOKENS: int = 1000
    OPENAI_TEMPERATURE: float = 0.7

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.DATABASE_URL.startswith("postgresql://") and "+" not in self.DATABASE_URL.split("://", 1)[0]:
            return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
        return self.DATABASE_URL

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()