from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import uuid


# ─── Request Schemas ────────────────────────────────────────────

class UserCreate(BaseModel):
    """Schema for user registration request"""
    email: EmailStr
    username: str
    password: str
    full_name: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 50:
            raise ValueError("Username must be less than 50 characters")
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, hyphens and underscores")
        return v

    @field_validator("password")
    @classmethod
    def password_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator("full_name")
    @classmethod
    def full_name_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v


class UserLogin(BaseModel):
    """Schema for user login request"""
    email: EmailStr
    password: str


# ─── Response Schemas ────────────────────────────────────────────

class UserResponse(BaseModel):
    """Schema for user response (never includes password)"""
    id: uuid.UUID
    email: str
    username: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Token Schemas ────────────────────────────────────────────

class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema for token payload data"""
    user_id: Optional[str] = None
    email: Optional[str] = None