from sqlalchemy import Column, Text, Integer, DECIMAL, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class Response(Base):
    """
    Response model - stores user answers to questions
    """
    __tablename__ = "responses"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign Key
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Answer Details
    user_answer = Column(Text, nullable=False)
    
    # AI Feedback
    ai_feedback = Column(Text, nullable=True)
    score = Column(DECIMAL(5, 2), nullable=True)  # 0-100
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    
    # Timing
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    time_taken_seconds = Column(Integer, nullable=True)
    
    # Relationships
    question = relationship("Question", back_populates="response")

    def __repr__(self):
        return f"<Response(id={self.id}, score={self.score})>"