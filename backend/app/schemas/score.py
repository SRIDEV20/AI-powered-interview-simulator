from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Category Score ───────────────────────────────────────────────

class CategoryScore(BaseModel):
    """Score breakdown for a single category"""
    category       : str
    average_score  : float
    total_questions: int
    answered       : int


# ─── Question Score ───────────────────────────────────────────────

class QuestionScoreDetail(BaseModel):
    """Score detail for a single question"""
    question_id   : str
    question_text : str
    question_type : str
    order_number  : int
    score         : Optional[float] = None
    feedback      : Optional[str]   = None
    strengths     : List[str]       = []
    improvements  : List[str]       = []
    answered      : bool            = False


# ─── Performance Level ────────────────────────────────────────────

class PerformanceLevel(BaseModel):
    """Performance level with label and message"""
    level  : str    # excellent / good / average / poor
    label  : str    # Excellent! / Good / Average / Needs Work
    message: str    # motivational message
    color  : str    # green / blue / yellow / red


# ─── Interview Score Response ─────────────────────────────────────

class InterviewScoreResponse(BaseModel):
    """Complete score breakdown for an interview"""

    # ── Basic Info ────────────────────────────────────────────────
    interview_id    : str
    job_role        : str
    difficulty      : str
    status          : str

    # ── Score Summary ─────────────────────────────────────────────
    overall_score   : Optional[float]        = None
    performance     : Optional[PerformanceLevel] = None

    # ── Question Breakdown ────────────────────────────────────────
    total_questions : int
    answered        : int
    skipped         : int
    completion_rate : float                  # percentage answered

    # ── Category Breakdown ────────────────────────────────────────
    category_scores : List[CategoryScore]    = []

    # ── Per Question Detail ───────────────────────────────────────
    question_scores : List[QuestionScoreDetail] = []

    # ── GPT Summary ───────────────────────────────────────────────
    overall_summary    : Optional[str] = None
    top_strengths      : List[str]     = []
    top_improvements   : List[str]     = []

    # ── Timestamps ────────────────────────────────────────────────
    started_at    : datetime
    completed_at  : Optional[datetime] = None

    class Config:
        from_attributes = True