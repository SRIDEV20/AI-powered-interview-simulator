from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ─── Register ────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with:
    - **email**: valid email address (must be unique)
    - **username**: 3-50 chars, alphanumeric (must be unique)
    - **password**: min 8 chars, 1 uppercase, 1 number
    - **full_name**: your display name
    """

    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Hash the password
    hashed_password = hash_password(user_data.password)

    # Create new user
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        is_active=True
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user