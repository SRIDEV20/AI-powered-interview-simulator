from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.api.deps import get_current_user                              # ✅ Day 7 - NEW import

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


# ─── Login ───────────────────────────────────────────────────────  ✅ Day 7 - NEW

@router.post(
    "/login",
    response_model=Token,
    summary="Login and get JWT token"
)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.
    Returns a JWT access token to use in protected routes.
    - **email**: registered email address
    - **password**: your password
    """

    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()

    # Check user exists and password matches
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Create JWT token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


# ─── Get Current User (Protected) ───────────────────────────────  ✅ Day 7 - NEW

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current logged in user"
)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile.
    Requires a valid JWT token in the Authorization header.
    - **Authorization**: Bearer <your_token>
    """
    return current_user


# ─── Logout ──────────────────────────────────────────────────────  ✅ Day 7 - NEW

@router.post(
    "/logout",
    summary="Logout user"
)
def logout():
    """
    Logout endpoint.
    JWT tokens are stateless - actual logout is handled client-side
    by deleting the token from storage.
    """
    return {"message": "Successfully logged out"}