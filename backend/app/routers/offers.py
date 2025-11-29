from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, MealOffer, OfferStatus
from app.schemas import OfferCreate, OfferResponse, OfferUpdate
from app.auth import get_current_active_user, require_donor
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/offers", tags=["offers"])


def enrich_offer_response(db: Session, offer: MealOffer) -> OfferResponse:
    """Enrich offer with donor info for response"""
    donor = db.query(User).filter(User.id == offer.donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    
    return OfferResponse(
        id=offer.id,
        donor_id=offer.donor_id,
        donor_name=donor.display_name if not offer.is_anonymous else "Anonymous Helper",
        donor_avatar_id=donor.avatar_id,
        donor_verification_status=donor.verification_status,
        donor_languages=donor.languages or [],
        city=offer.city,
        state=offer.state,
        zip=offer.zip,
        country=offer.country,
        latitude=offer.latitude,
        longitude=offer.longitude,
        description=offer.description,
        image_url=offer.image_url,
        dietary_tags=offer.dietary_tags,
        medical_tags=offer.medical_tags,
        available_until=offer.available_until,
        logistics=offer.logistics,
        availability=offer.availability,
        frequency=offer.frequency,
        is_anonymous=offer.is_anonymous,
        status=offer.status,
        completion_pin=offer.completion_pin,
        created_at=offer.created_at
    )


@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer(
    offer_data: OfferCreate,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    """Create a new meal offer"""
    # Check weekly capacity limit
    if current_user.weekly_meal_limit:
        current_week_count = db.query(func.count(MealOffer.id)).filter(
            MealOffer.donor_id == current_user.id,
            MealOffer.created_at >= func.date('now', '-7 days')
        ).scalar() or 0
        
        if current_week_count >= current_user.weekly_meal_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Weekly limit reached"
            )
    
    new_offer = MealOffer(
        id=str(uuid.uuid4()),
        donor_id=current_user.id,
        city=offer_data.city,
        state=offer_data.state,
        zip=offer_data.zip,
        country=offer_data.country,
        latitude=offer_data.latitude,
        longitude=offer_data.longitude,
        description=offer_data.description,
        image_url=offer_data.image_url,
        dietary_tags=offer_data.dietary_tags,
        medical_tags=offer_data.medical_tags,
        available_until=offer_data.available_until,
        logistics=offer_data.logistics,
        availability=offer_data.availability,
        frequency=offer_data.frequency,
        is_anonymous=offer_data.is_anonymous,
        status=OfferStatus.AVAILABLE
    )
    
    db.add(new_offer)
    db.commit()
    db.refresh(new_offer)
    
    return enrich_offer_response(db, new_offer)


@router.get("", response_model=List[OfferResponse])
def browse_offers(
    status_filter: Optional[str] = Query(None, alias="status"),
    diet: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Browse/filter meal offers"""
    query = db.query(MealOffer)
    
    if status_filter:
        try:
            status_enum = OfferStatus(status_filter)
            query = query.filter(MealOffer.status == status_enum)
        except ValueError:
            pass
    
    if city:
        query = query.filter(MealOffer.city.ilike(f"%{city}%"))
    
    if diet:
        query = query.filter(MealOffer.dietary_tags.contains([diet]))
    
    offers = query.order_by(MealOffer.created_at.desc()).all()
    return [enrich_offer_response(db, offer) for offer in offers]


@router.get("/mine", response_model=List[OfferResponse])
def get_my_offers(
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    """Get current donor's own offers"""
    offers = db.query(MealOffer).filter(
        MealOffer.donor_id == current_user.id
    ).order_by(MealOffer.created_at.desc()).all()
    
    return [enrich_offer_response(db, offer) for offer in offers]


@router.get("/{offer_id}", response_model=OfferResponse)
def get_offer(
    offer_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific offer by ID"""
    offer = db.query(MealOffer).filter(MealOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    return enrich_offer_response(db, offer)


@router.patch("/{offer_id}", response_model=OfferResponse)
def update_offer(
    offer_id: str,
    offer_update: OfferUpdate,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    """Update an offer (status, etc.)"""
    offer = db.query(MealOffer).filter(MealOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    if offer.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this offer")
    
    update_data = offer_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(offer, field, value)
    
    db.commit()
    db.refresh(offer)
    
    return enrich_offer_response(db, offer)


@router.delete("/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_offer(
    offer_id: str,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    """Delete an offer"""
    offer = db.query(MealOffer).filter(MealOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    if offer.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this offer")
    
    db.delete(offer)
    db.commit()
    return None

