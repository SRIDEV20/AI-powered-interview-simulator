from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


# ─── Enums ───────────────────────────────────────────────────────

class DifficultyLevel(str, Enum):
    beginner     = "beginner"
    intermediate = "intermediate"
    advanced     = "advanced"


class QuestionType(str, Enum):
    technical  = "technical"
    behavioral = "behavioral"
    mixed      = "mixed"


class InterviewStatus(str, Enum):
    pending    = "pending"
    active     = "active"
    completed  = "completed"


# ─── Question Schemas ─────────────────────────────────────────────

class QuestionResponse(BaseModel):
    """Single generated question"""
    question        : str
    type            : str
    difficulty      : str
    expected_points : List[str]


# ─── Interview Create ─────────────────────────────────────────────

class InterviewCreateRequest(BaseModel):
    """Request body for creating a new interview"""
    job_role      : str = Field(..., min_length=2, max_length=100,
                                description="e.g. Python Developer, Data Scientist")
    difficulty    : DifficultyLevel = Field(default=DifficultyLevel.intermediate,
                                            description="beginner | intermediate | advanced")
    num_questions : int = Field(default=5, ge=1, le=10,
                                description="Number of questions (1-10)")
    question_type : QuestionType = Field(default=QuestionType.mixed,
                                         description="technical | behavioral | mixed")

    class Config:
        json_schema_extra = {
            "example": {
                "job_role"      : "Python Developer",
                "difficulty"    : "intermediate",
                "num_questions" : 5,
                "question_type" : "mixed"
            }
        }


class InterviewCreateResponse(BaseModel):
    """Response after creating a new interview"""
    interview_id  : str
    job_role      : str
    difficulty    : str
    question_type : str
    total_questions: int
    questions     : List[QuestionResponse]
    status        : str
    created_at    : datetime

    class Config:
        from_attributes = True


# ─── Interview Get ────────────────────────────────────────────────

class InterviewDetailResponse(BaseModel):
    """Response for getting interview details"""
    interview_id   : str
    job_role       : str
    difficulty     : str
    question_type  : str
    total_questions: int
    questions      : List[QuestionResponse]
    status         : str
    created_at     : datetime