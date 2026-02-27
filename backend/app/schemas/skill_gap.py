from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Single Skill Gap ─────────────────────────────────────────────

class SkillGapItem(BaseModel):
    """Single skill gap entry"""
    id                : str
    skill_name        : str
    proficiency_level : str        # weak / moderate / strong
    gap_score         : float      # 0-100 (lower = bigger gap)
    recommendation    : Optional[str] = None
    identified_at     : datetime

    class Config:
        from_attributes = True


# ─── Analyze Request ──────────────────────────────────────────────

class AnalyzeSkillGapsRequest(BaseModel):
    """Optional request body for skill gap analysis"""
    force_reanalyze: bool = Field(
        default=False,
        description="Set to true to re-analyze even if gaps already exist"
    )


# ─── Skill Gap Summary ────────────────────────────────────────────

class SkillGapSummary(BaseModel):
    """Summary of a single skill with score and level"""
    skill_name        : str
    gap_score         : float
    proficiency_level : str
    recommendation    : Optional[str] = None


# ─── Analyze Response ─────────────────────────────────────────────

class AnalyzeSkillGapsResponse(BaseModel):
    """Response after analyzing skill gaps for an interview"""
    interview_id    : str
    job_role        : str
    overall_score   : Optional[float]    = None
    total_skills    : int
    weak_skills     : int                # gap_score < 50
    moderate_skills : int                # gap_score 50-74
    strong_skills   : int                # gap_score >= 75
    skill_gaps      : List[SkillGapSummary] = []
    analyzed_at     : datetime


# ─── User Skill Gaps Response ─────────────────────────────────────

class UserSkillGapsResponse(BaseModel):
    """All skill gaps for a user across all interviews"""
    user_id         : str
    total_gaps      : int
    weak_count      : int
    moderate_count  : int
    strong_count    : int
    skill_gaps      : List[SkillGapItem] = []


# ─── Interview Skill Gaps Response ────────────────────────────────

class InterviewSkillGapsResponse(BaseModel):
    """Skill gaps for a specific interview"""
    interview_id    : str
    job_role        : str
    total_gaps      : int
    skill_gaps      : List[SkillGapItem] = []