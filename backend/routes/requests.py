"""Meal request routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional

from database import get_db
from models import User, MealRequest
from schemas import MealRequestCreate, MealRequestResponse
from auth import get_current_user, get_optional_current_user

router = APIRouter(prefix="/requests", tags=["requests"])


@router.get("", response_model=List[MealRequestResponse])
async def get_requests(
    status: Optional[str] = None,
    city: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user()),
    db: AsyncSession = Depends(get_db)
):
    """Get meal requests."""
    query = select(MealRequest).join(User, MealRequest.seeker_id == User.id)
    
    # Filter by status
    if status:
        query = query.where(MealRequest.status == status)
    else:
        # Default to showing open requests
        query = query.where(MealRequest.status == "OPEN")
    
    # Filter by city
    if city:
        query = query.where(MealRequest.city == city)
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    # Convert to response format
    response_data = []
    for req in requests:
        # Get seeker info
        seeker_result = await db.execute(select(User).where(User.id == req.seeker_id))
        seeker = seeker_result.scalar_one()
        
        response_data.append({
            "id": req.id,
            "seeker_id": req.seeker_id,
            "seeker_name": seeker.display_name,
            "seeker_avatar_id": seeker.avatar_id,
            "seeker_verification_status": seeker.verification_status.value,
            "seeker_languages": seeker.languages or [],
            "city": req.city,
            "state": req.state,
            "zip_code": req.zip_code,
            "country": req.country,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "dietary_needs": req.dietary_needs or [],
            "medical_needs": req.medical_needs or [],
            "logistics": req.logistics or [],
            "description": req.description,
            "availability": req.availability,
            "frequency": req.frequency.value,
            "urgency": req.urgency,
            "status": req.status.value,
            "posted_at": req.posted_at
        })
    
    return response_data


@router.post("", response_model=MealRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_data: MealRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new meal request."""
    if current_user.role != "SEEKER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seekers can create meal requests"
        )
    
    # Create request
    new_request = MealRequest(
        seeker_id=current_user.id,
        city=current_user.city,
        state=current_user.state,
        zip_code=current_user.zip_code,
        country=current_user.country,
        latitude=current_user.latitude,
        longitude=current_user.longitude,
        dietary_needs=request_data.dietary_needs,
        medical_needs=request_data.medical_needs,
        logistics=request_data.logistics,
        description=request_data.description,
        availability=request_data.availability,
        frequency=request_data.frequency,
        urgency=request_data.urgency
    )
    
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    # Return formatted response
    return {
        "id": new_request.id,
        "seeker_id": current_user.id,
        "seeker_name": current_user.display_name,
        "seeker_avatar_id": current_user.avatar_id,
        "seeker_verification_status": current_user.verification_status.value,
        "seeker_languages": current_user.languages or [],
        "city": new_request.city,
        "state": new_request.state,
        "zip_code": new_request.zip_code,
        "country": new_request.country,
        "latitude": new_request.latitude,
        "longitude": new_request.longitude,
        "dietary_needs": new_request.dietary_needs or [],
        "medical_needs": new_request.medical_needs or [],
        "logistics": new_request.logistics or [],
        "description": new_request.description,
        "availability": new_request.availability,
        "frequency": new_request.frequency.value,
        "urgency": new_request.urgency,
        "status": new_request.status.value,
        "posted_at": new_request.posted_at
    }


@router.get("/my-requests", response_model=List[MealRequestResponse])
async def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's meal requests."""
    result = await db.execute(
        select(MealRequest)
        .where(MealRequest.seeker_id == current_user.id)
        .order_by(MealRequest.posted_at.desc())
    )
    requests = result.scalars().all()
    
    # Convert to response format
    response_data = []
    for req in requests:
        response_data.append({
            "id": req.id,
            "seeker_id": current_user.id,
            "seeker_name": current_user.display_name,
            "seeker_avatar_id": current_user.avatar_id,
            "seeker_verification_status": current_user.verification_status.value,
            "seeker_languages": current_user.languages or [],
            "city": req.city,
            "state": req.state,
            "zip_code": req.zip_code,
            "country": req.country,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "dietary_needs": req.dietary_needs or [],
            "medical_needs": req.medical_needs or [],
            "logistics": req.logistics or [],
            "description": req.description,
            "availability": req.availability,
            "frequency": req.frequency.value,
            "urgency": req.urgency,
            "status": req.status.value,
            "posted_at": req.posted_at
        })
    
    return response_data
