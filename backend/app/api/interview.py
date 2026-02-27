import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.schemas.interview import (
    InterviewCreateRequest,
    InterviewCreateResponse,
    InterviewDetailResponse,
    InterviewListResponse,
)
from app.schemas.response import (
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    InterviewResultsResponse
)
from app.schemas.score import InterviewScoreResponse
from app.services.interview_service import interview_service
from app.services.evaluation_service import evaluation_service
from app.services.scoring_service import scoring_service
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


# ─── Submit Answer ────────────────────────────────────────────────

@router.post(
    "/{interview_id}/answer/{question_id}",
    response_model=SubmitAnswerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit answer for a question",
    description="Submits user answer, evaluates with GPT-4, saves score and feedback"
)
async def submit_answer(
    interview_id : str,
    question_id  : str,
    request      : SubmitAnswerRequest,
    current_user : User = Depends(get_current_active_user),
    db           : Session = Depends(get_db)
):
    try:
        logger.info(
            f"📝 Answer submitted by user {current_user.id} "
            f"for question {question_id}"
        )
        result = evaluation_service.submit_answer(
            interview_id = interview_id,
            question_id  = question_id,
            request      = request,
            db           = db
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Answer submission failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit answer: {str(e)}"
        )


# ─── Get Interview Results ────────────────────────────────────────

@router.get(
    "/{interview_id}/results",
    response_model=InterviewResultsResponse,
    summary="Get full interview results",
    description="Returns all questions with answers, scores and AI feedback"
)
async def get_interview_results(
    interview_id : str,
    current_user : User = Depends(get_current_active_user),
    db           : Session = Depends(get_db)
):
    try:
        result = evaluation_service.get_interview_results(
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
        logger.error(f"❌ Get results failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get results: {str(e)}"
        )


# ─── Get Interview Score ──────────────────────────────────────────

@router.get(
    "/{interview_id}/score",
    response_model=InterviewScoreResponse,
    summary="Get detailed score breakdown",
    description="Returns category-wise scores, performance level and GPT-4 summary"
)
async def get_interview_score(
    interview_id     : str,
    generate_summary : bool = Query(
        default=True,
        description="Set to false to skip GPT summary (saves API cost)"
    ),
    current_user     : User = Depends(get_current_active_user),
    db               : Session = Depends(get_db)
):
    try:
        logger.info(f"📊 Scoring interview {interview_id}")
        result = scoring_service.get_interview_score(
            interview_id     = interview_id,
            db               = db,
            generate_summary = generate_summary
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Scoring failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate score: {str(e)}"
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