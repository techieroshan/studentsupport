from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserResponse, UserUpdate
from app.auth import require_seeker

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/me", response_model=UserResponse)
def get_student_profile(
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db)
):
    """Get current student's profile"""
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_student_profile(
    user_update: UserUpdate,
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db)
):
    """Update current student's profile"""
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

