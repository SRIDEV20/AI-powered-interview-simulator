from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.interview import Interview, InterviewStatus  # ✅ Fixed - import Enum
from app.models.response import Response
from app.schemas.user import UserResponse, UserProfileUpdate, UserStatsResponse

router = APIRouter(prefix="/api/user", tags=["User"])


# ─── GET Profile ────────────────────��────────────────────────────

@router.get(
    "/profile",
    response_model=UserResponse,
    summary="Get current user profile"
)
def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.
    Requires a valid JWT token in the Authorization header.
    """
    return current_user


# ─── PUT Profile ─────────────────────────────────────────────────

@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update current user profile"
)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current authenticated user's profile.
    Only provided fields will be updated (partial update).
    - **full_name**: update display name
    - **username**: update username (must be unique)
    """

    # Check if new username is taken by another user
    if profile_data.username and profile_data.username != current_user.username:
        existing = db.query(User).filter(
            User.username == profile_data.username
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

    # Apply updates - only update fields that were provided
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name

    if profile_data.username is not None:
        current_user.username = profile_data.username

    # Save to database
    db.commit()
    db.refresh(current_user)

    return current_user


# ─── GET Stats ───────────────────────────────────────────────────

@router.get(
    "/stats",
    response_model=UserStatsResponse,
    summary="Get current user dashboard stats"
)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for the current authenticated user.
    Returns interview counts, scores, and account info.
    """

    # Total interviews created by user
    total_interviews = db.query(func.count(Interview.id)).filter(
        Interview.user_id == current_user.id
    ).scalar() or 0

    # Completed interviews only - ✅ Fixed: use Enum not string
    completed_interviews = db.query(func.count(Interview.id)).filter(
        Interview.user_id == current_user.id,
        Interview.status == InterviewStatus.COMPLETED
    ).scalar() or 0

    # Average score across all responses - ✅ Fixed: safe query
    try:
        avg_score = db.query(func.avg(Response.score)).join(
            Interview, Response.interview_id == Interview.id
        ).filter(
            Interview.user_id == current_user.id,
            Response.score.isnot(None)
        ).scalar()
        average_score = round(float(avg_score), 2) if avg_score else 0.0
    except Exception:
        average_score = 0.0

    # Best score across all responses - ✅ Fixed: safe query
    try:
        best = db.query(func.max(Response.score)).join(
            Interview, Response.interview_id == Interview.id
        ).filter(
            Interview.user_id == current_user.id,
            Response.score.isnot(None)
        ).scalar()
        best_score = round(float(best), 2) if best else 0.0
    except Exception:
        best_score = 0.0

    # Total questions answered - ✅ Fixed: safe query
    try:
        total_questions_answered = db.query(func.count(Response.id)).join(
            Interview, Response.interview_id == Interview.id
        ).filter(
            Interview.user_id == current_user.id
        ).scalar() or 0
    except Exception:
        total_questions_answered = 0

    return UserStatsResponse(
        total_interviews=total_interviews,
        completed_interviews=completed_interviews,
        average_score=average_score,
        best_score=best_score,
        total_questions_answered=total_questions_answered,
        member_since=current_user.created_at,
        account_status="active" if current_user.is_active else "inactive"
    )