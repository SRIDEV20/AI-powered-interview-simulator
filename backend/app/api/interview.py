import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.interview import (
    InterviewCreateRequest,
    InterviewCreateResponse,
    InterviewDetailResponse,
    InterviewListResponse,
    InterviewCompleteResponse
)
from app.services.interview_service import interview_service
from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.user import User

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
    current_user : User = Depends(get_current_active_user),
    db           : Session = Depends(get_db)
):
    try:
        logger.info(f"📝 Creating interview for user {current_user.id}")
        result = interview_service.create_interview(
            request = request,
            user_id = str(current_user.id),
            db      = db
        )
        return result
    except Exception as e:
        logger.error(f"❌ Interview creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create interview: {str(e)}"
        )


# ─── List User Interviews ─────────────────────────────────────────

@router.get(
    "/",
    response_model=InterviewListResponse,
    summary="List all my interviews",
    description="Returns all interviews created by the current user"
)
async def list_interviews(
    current_user : User = Depends(get_current_active_user),
    db           : Session = Depends(get_db)
):
    try:
        results = interview_service.get_user_interviews(
            user_id = str(current_user.id),
            db      = db
        )
        return InterviewListResponse(
            total      = len(results),
            interviews = results
        )
    except Exception as e:
        logger.error(f"❌ List interviews failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list interviews: {str(e)}"
        )


# ─── Get Interview Detail ─────────────────────────────────────────

@router.get(
    "/{interview_id}",
    response_model=InterviewDetailResponse,
    summary="Get interview details",
    description="Returns interview details with all generated questions"
)
async def get_interview(
    interview_id : str,
    current_user : User = Depends(get_current_active_user),
    db           : Session = Depends(get_db)
):
    try:
        result = interview_service.get_interview(
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
        logger.error(f"❌ Get interview failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get interview: {str(e)}"
        )


# ─── Complete Interview ───────────────────────────────────────────

@router.patch(
    "/{interview_id}/complete",
    summary="Complete an interview",
    description="Marks an interview session as completed"
)
async def complete_interview(
    interview_id : str,
    current_user : User = Depends(get_current_active_user),
    db           : Session = Depends(get_db)
):
    try:
        result = interview_service.complete_interview(
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
        logger.error(f"❌ Complete interview failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete interview: {str(e)}"
        )