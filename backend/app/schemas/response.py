from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Submit Answer ──────────��─────────────────────────────────────

class SubmitAnswerRequest(BaseModel):
    """Request body for submitting an answer"""
    user_answer        : str = Field(..., min_length=1, max_length=5000,
                                     description="The candidate's answer")
    time_taken_seconds : Optional[int] = Field(None, ge=0,
                                     description="Time taken to answer in seconds")

    class Config:
        json_schema_extra = {
            "example": {
                "user_answer"        : "A list comprehension returns a full list in memory, while a generator expression returns an iterator that yields items one by one. Generators are more memory efficient for large datasets.",
                "time_taken_seconds" : 120
            }
        }


# ─── Evaluation Result ────────────────────────────────────────────

class EvaluationResult(BaseModel):
    """AI evaluation result from GPT-4"""
    score              : float          = Field(..., ge=0, le=100)
    feedback           : str
    strengths          : List[str]      = []
    improvements       : List[str]      = []
    keywords_mentioned : List[str]      = []


# ─── Submit Answer Response ───────────────────────────────────────

class SubmitAnswerResponse(BaseModel):
    """Response after submitting and evaluating an answer"""
    response_id        : str
    interview_id       : str
    question_id        : str
    question_text      : str
    user_answer        : str
    score              : float
    feedback           : str
    strengths          : List[str]
    improvements       : List[str]
    keywords_mentioned : List[str]
    time_taken_seconds : Optional[int]  = None
    answered_at        : datetime

    class Config:
        from_attributes = True


# ─── Get Response ─────────────────────────────────────────────────

class ResponseDetail(BaseModel):
    """Full response detail for a single question"""
    response_id        : str
    question_id        : str
    question_text      : str
    question_type      : str
    order_number       : int
    user_answer        : str
    score              : Optional[float] = None
    feedback           : Optional[str]   = None
    strengths          : List[str]       = []
    improvements       : List[str]       = []
    keywords_mentioned : List[str]       = []
    time_taken_seconds : Optional[int]   = None
    answered_at        : datetime

    class Config:
        from_attributes = True


# ─── Interview Results ────────────────────────────────────────────

class InterviewResultsResponse(BaseModel):
    """Full interview results with all responses"""
    interview_id    : str
    job_role        : str
    difficulty      : str
    status          : str
    overall_score   : Optional[float]      = None
    total_questions : int
    answered        : int
    responses       : List[ResponseDetail] = []
    created_at      : datetime
    completed_at    : Optional[datetime]   = None

    class Config:
        from_attributes = True