from sqlalchemy import Column, String, Integer, Enum, DECIMAL, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base

class DifficultyLevel(str, enum.Enum):
    """Enum for difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class InterviewStatus(str, enum.Enum):
    """Enum for interview status"""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class Interview(Base):
    """
    Interview model - stores interview session data
    """
    __tablename__ = "interviews"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign Key
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Interview Details
    job_role = Column(String(100), nullable=False)
    difficulty_level = Column(Enum(DifficultyLevel), nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.IN_PROGRESS, nullable=False, index=True)
    
    # Performance Metrics
    overall_score = Column(DECIMAL(5, 2), nullable=True)  # 0-100
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="interviews")
    questions = relationship("Question", back_populates="interview", cascade="all, delete-orphan")
    skill_gaps = relationship("SkillGap", back_populates="interview", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Interview(id={self.id}, job_role={self.job_role}, status={self.status})>"