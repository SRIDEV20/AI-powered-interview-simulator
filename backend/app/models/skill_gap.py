from sqlalchemy import Column, String, Text, Enum, DECIMAL, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base

class ProficiencyLevel(str, enum.Enum):
    """Enum for proficiency levels"""
    WEAK = "weak"
    MODERATE = "moderate"
    STRONG = "strong"

class SkillGap(Base):
    """
    SkillGap model - stores identified skill gaps from interviews
    """
    __tablename__ = "skill_gaps"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign Keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Skill Details
    skill_name = Column(String(100), nullable=False, index=True)
    proficiency_level = Column(Enum(ProficiencyLevel), nullable=False)
    gap_score = Column(DECIMAL(5, 2), nullable=False)  # 0-100 (lower = bigger gap)
    
    # Recommendations
    recommendation = Column(Text, nullable=True)
    
    # Timestamp
    identified_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="skill_gaps")
    interview = relationship("Interview", back_populates="skill_gaps")

    def __repr__(self):
        return f"<SkillGap(skill={self.skill_name}, level={self.proficiency_level})>"