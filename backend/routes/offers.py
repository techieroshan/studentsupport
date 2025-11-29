"""Meal offer routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from database import get_db
from models import User, MealOffer
from schemas import MealOfferCreate, MealOfferResponse
from auth import get_current_user, get_optional_current_user

router = APIRouter(prefix="/offers", tags=["offers"])


@router.get("", response_model=List[MealOfferResponse])
async def get_offers(
    status: Optional[str] = None,
    city: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user()),
    db: AsyncSession = Depends(get_db)
):
    """Get meal offers."""
    query = select(MealOffer).join(User, MealOffer.donor_id == User.id)
    
    # Filter by status
    if status:
        query = query.where(MealOffer.status == status)
    else:
        # Default to showing available offers
        query = query.where(MealOffer.status == "AVAILABLE")
    
    # Filter by city
    if city:
        query = query.where(MealOffer.city == city)
    
    result = await db.execute(query)
    offers = result.scalars().all()
    
    # Convert to response format
    response_data = []
    for offer in offers:
        # Get donor info
        donor_result = await db.execute(select(User).where(User.id == offer.donor_id))
        donor = donor_result.scalar_one()
        
        donor_name = "Anonymous Helper" if offer.is_anonymous else donor.display_name
        
        response_data.append({
            "id": offer.id,
            "donor_id": offer.donor_id,
            "donor_name": donor_name,
            "donor_avatar_id": donor.avatar_id,
            "donor_verification_status": donor.verification_status.value,
            "donor_languages": donor.languages or [],
            "city": offer.city,
            "state": offer.state,
            "zip_code": offer.zip_code,
            "country": offer.country,
            "latitude": offer.latitude,
            "longitude": offer.longitude,
            "description": offer.description,
            "dietary_tags": offer.dietary_tags or [],
            "medical_tags": offer.medical_tags or [],
            "logistics": offer.logistics or [],
            "availability": offer.availability,
            "frequency": offer.frequency.value,
            "available_until": offer.available_until,
            "is_anonymous": offer.is_anonymous,
            "status": offer.status.value,
            "posted_at": offer.posted_at,
            "image_url": offer.image_url
        })
    
    return response_data


@router.post("", response_model=MealOfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    offer_data: MealOfferCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new meal offer."""
    if current_user.role != "DONOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only donors can create meal offers"
        )
    
    # Create offer
    new_offer = MealOffer(
        donor_id=current_user.id,
        city=current_user.city,
        state=current_user.state,
        zip_code=current_user.zip_code,
        country=current_user.country,
        latitude=current_user.latitude,
        longitude=current_user.longitude,
        description=offer_data.description,
        dietary_tags=offer_data.dietary_tags,
        medical_tags=offer_data.medical_tags,
        logistics=offer_data.logistics,
        availability=offer_data.availability,
        frequency=offer_data.frequency,
        available_until=offer_data.available_until,
        is_anonymous=offer_data.is_anonymous,
        image_url=offer_data.image_url
    )
    
    db.add(new_offer)
    await db.commit()
    await db.refresh(new_offer)
    
    donor_name = "Anonymous Helper" if new_offer.is_anonymous else current_user.display_name
    
    # Return formatted response
    return {
        "id": new_offer.id,
        "donor_id": current_user.id,
        "donor_name": donor_name,
        "donor_avatar_id": current_user.avatar_id,
        "donor_verification_status": current_user.verification_status.value,
        "donor_languages": current_user.languages or [],
        "city": new_offer.city,
        "state": new_offer.state,
        "zip_code": new_offer.zip_code,
        "country": new_offer.country,
        "latitude": new_offer.latitude,
        "longitude": new_offer.longitude,
        "description": new_offer.description,
        "dietary_tags": new_offer.dietary_tags or [],
        "medical_tags": new_offer.medical_tags or [],
        "logistics": new_offer.logistics or [],
        "availability": new_offer.availability,
        "frequency": new_offer.frequency.value,
        "available_until": new_offer.available_until,
        "is_anonymous": new_offer.is_anonymous,
        "status": new_offer.status.value,
        "posted_at": new_offer.posted_at,
        "image_url": new_offer.image_url
    }


@router.get("/my-offers", response_model=List[MealOfferResponse])
async def get_my_offers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's meal offers."""
    result = await db.execute(
        select(MealOffer)
        .where(MealOffer.donor_id == current_user.id)
        .order_by(MealOffer.posted_at.desc())
    )
    offers = result.scalars().all()
    
    # Convert to response format
    response_data = []
    for offer in offers:
        donor_name = "Anonymous Helper" if offer.is_anonymous else current_user.display_name
        
        response_data.append({
            "id": offer.id,
            "donor_id": current_user.id,
            "donor_name": donor_name,
            "donor_avatar_id": current_user.avatar_id,
            "donor_verification_status": current_user.verification_status.value,
            "donor_languages": current_user.languages or [],
            "city": offer.city,
            "state": offer.state,
            "zip_code": offer.zip_code,
            "country": offer.country,
            "latitude": offer.latitude,
            "longitude": offer.longitude,
            "description": offer.description,
            "dietary_tags": offer.dietary_tags or [],
            "medical_tags": offer.medical_tags or [],
            "logistics": offer.logistics or [],
            "availability": offer.availability,
            "frequency": offer.frequency.value,
            "available_until": offer.available_until,
            "is_anonymous": offer.is_anonymous,
            "status": offer.status.value,
            "posted_at": offer.posted_at,
            "image_url": offer.image_url
        })
    
    return response_data
