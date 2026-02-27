import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.skill_gap import (
    AnalyzeSkillGapsRequest,
    AnalyzeSkillGapsResponse,
    UserSkillGapsResponse,
    InterviewSkillGapsResponse
)
from app.services.skill_gap_service import skill_gap_service
from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/skill-gaps",
    tags=["Skill Gaps"]
)


# ─── Analyze Interview Skill Gaps ─────────────────────────────────

@router.post(
    "/analyze/{interview_id}",
    response_model=AnalyzeSkillGapsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Analyze skill gaps for an interview",
    description="Analyzes interview responses, identifies weak areas, generates GPT-4 recommendations and saves to DB"
)
async def analyze_skill_gaps(
    interview_id : str,
    request      : AnalyzeSkillGapsRequest = AnalyzeSkillGapsRequest(),
    current_user : User = Depends(get_current_active_user),
    db           : Session = Depends(get_db)
):
    try:
        logger.info(
            f"🔍 Analyzing skill gaps for interview {interview_id} "
            f"| user {current_user.id}"
        )
        result = skill_gap_service.analyze_interview(
            interview_id = interview_id,
            user_id      = str(current_user.id),
            db           = db,
            force        = request.force_reanalyze
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Skill gap analysis failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze skill gaps: {str(e)}"
        )


# ─── Get All User Skill Gaps ───────────────────────���──────────────

@router.get(
    "/",
    response_model=UserSkillGapsResponse,
    summary="Get all my skill gaps",
    description="Returns all skill gaps for the current user across all interviews, sorted by lowest score first"
)
async def get_user_skill_gaps(
    current_user : User = Depends(get_current_active_user),
    db           : Session = Depends(get_db)
):
    try:
        result = skill_gap_service.get_user_skill_gaps(
            user_id = str(current_user.id),
            db      = db
        )
        return result
    except Exception as e:
        logger.error(f"❌ Get user skill gaps failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get skill gaps: {str(e)}"
        )


# ─── Get Interview Skill Gaps ─────────────────────────────────────

@router.get(
    "/interview/{interview_id}",
    response_model=InterviewSkillGapsResponse,
    summary="Get skill gaps for an interview",
    description="Returns all skill gaps identified for a specific interview"
)
async def get_interview_skill_gaps(
    interview_id : str,
    current_user : User = Depends(get_current_active_user),
    db           : Session = Depends(get_db)
):
    try:
        result = skill_gap_service.get_interview_skill_gaps(
            interview_id = interview_id,
            db           = db
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Get interview skill gaps failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get interview skill gaps: {str(e)}"
        )