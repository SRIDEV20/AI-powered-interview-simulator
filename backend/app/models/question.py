from sqlalchemy import Column, String, Text, Integer, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base

class QuestionType(str, enum.Enum):
    """Enum for question types"""
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    CODING = "coding"
    SYSTEM_DESIGN = "system_design"

class Question(Base):
    """
    Question model - stores interview questions
    """
    __tablename__ = "questions"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign Key
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Question Details
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False)
    difficulty = Column(String(20), nullable=False)  # beginner, intermediate, advanced
    skill_category = Column(String(100), nullable=False, index=True)  # e.g., "Python", "Algorithms"
    
    # Expected Answer (for AI comparison)
    expected_answer = Column(Text, nullable=True)
    
    # Order
    order_number = Column(Integer, nullable=False)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    interview = relationship("Interview", back_populates="questions")
    response = relationship("Response", back_populates="question", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Question(id={self.id}, type={self.question_type}, order={self.order_number})>"