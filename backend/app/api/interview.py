from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.interview import (
    InterviewCreateRequest,
    InterviewCreateResponse,
    InterviewDetailResponse
)
from app.services.interview_service import interview_service
from app.api.deps import get_current_active_user
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"]
)


# ─── Create Interview ─────────────────────────────────────────────

@router.post(
    "/create",
    response_model=InterviewCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new interview session",
    description="Generates interview questions using GPT-4 based on role and difficulty"
)
async def create_interview(
    request      : InterviewCreateRequest,
    current_user : User = Depends(get_current_active_user)
):
    """
    Create a new AI-powered interview session.

    - **job_role**: e.g. Python Developer, Data Scientist
    - **difficulty**: beginner | intermediate | advanced
    - **num_questions**: 1-10 (default: 5)
    - **question_type**: technical | behavioral | mixed
    """
    try:
        logger.info(f"📝 Creating interview for user {current_user.id} | role={request.job_role}")

        result = interview_service.create_interview(
            request = request,
            user_id = str(current_user.id)
        )
        return result

    except Exception as e:
        logger.error(f"❌ Interview creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create interview: {str(e)}"
        )


# ─── Get Interview ────────────────────────────────────────────────

@router.get(
    "/{interview_id}",
    response_model=InterviewDetailResponse,
    summary="Get interview details",
    description="Returns interview details with all generated questions"
)
async def get_interview(
    interview_id : str,
    current_user : User = Depends(get_current_active_user)
):
    """
    Get interview details by ID.

    - **interview_id**: UUID of the interview session
    """
    try:
        result = interview_service.get_interview(interview_id)
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Get interview failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get interview: {str(e)}"
        )


# ─── List User Interviews ─────────────────────────────────────────

@router.get(
    "/",
    summary="List all interviews",
    description="Returns all interviews created by the current user"
)
async def list_interviews(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all interviews for the current user.
    """
    try:
        results = interview_service.get_user_interviews(str(current_user.id))
        return {
            "total"      : len(results),
            "interviews" : results
        }
    except Exception as e:
        logger.error(f"❌ List interviews failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list interviews: {str(e)}"
        )