"""User routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import User, MealRequest, MealOffer
from schemas import UserResponse, UserUpdate, StatsResponse
from auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile."""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile."""
    # Update fields
    if user_data.display_name:
        current_user.display_name = user_data.display_name
    if user_data.city:
        current_user.city = user_data.city
    if user_data.state:
        current_user.state = user_data.state
    if user_data.zip_code:
        current_user.zip_code = user_data.zip_code
    if user_data.phone:
        current_user.phone = user_data.phone
    if user_data.preferences is not None:
        current_user.preferences = user_data.preferences
    if user_data.languages is not None:
        current_user.languages = user_data.languages
    if user_data.radius is not None:
        current_user.radius = user_data.radius
    if user_data.is_anonymous is not None:
        current_user.is_anonymous = user_data.is_anonymous
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get platform statistics."""
    # Count total fulfilled requests (meals served)
    result = await db.execute(
        select(func.count(MealRequest.id))
        .where(MealRequest.status == "FULFILLED")
    )
    total_meals = result.scalar() or 0
    
    # Count active students (seekers with verified email)
    result = await db.execute(
        select(func.count(User.id))
        .where(User.role == "SEEKER", User.email_verified == True)
    )
    active_students = result.scalar() or 0
    
    # Count active donors
    result = await db.execute(
        select(func.count(User.id))
        .where(User.role == "DONOR", User.email_verified == True)
    )
    active_donors = result.scalar() or 0
    
    # Count unique cities
    result = await db.execute(
        select(func.count(func.distinct(User.city)))
    )
    cities_covered = result.scalar() or 0
    
    return {
        "total_meals": total_meals,
        "active_students": active_students,
        "active_donors": active_donors,
        "cities_covered": cities_covered
    }
