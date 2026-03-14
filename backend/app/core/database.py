from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# Create database engine
engine = create_engine(
    settings.sqlalchemy_database_url,
    echo=True,  # Log SQL queries (set to False in production)
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,  # Connection pool size
    max_overflow=20  # Max overflow connections
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    """
    Database session dependency
    Yields a database session and closes it when done
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()