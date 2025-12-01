from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Rating
from app.schemas import RatingCreate, RatingResponse
from app.auth import get_current_active_user
from typing import List
import uuid

router = APIRouter(prefix="/ratings", tags=["ratings"])


def enrich_rating_response(db: Session, rating: Rating) -> RatingResponse:
    """Enrich rating with reviewer info"""
    from_user = db.query(User).filter(User.id == rating.from_user_id).first()
    to_user = db.query(User).filter(User.id == rating.to_user_id).first()
    
    if not from_user or not to_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return RatingResponse(
        id=rating.id,
        from_user_id=rating.from_user_id,
        reviewer_name=from_user.display_name,
        reviewer_avatar_id=from_user.avatar_id,
        reviewer_role=from_user.role,
        reviewer_location=f"{from_user.city}, {from_user.state}",
        to_user_id=rating.to_user_id,
        transaction_id=rating.transaction_id,
        stars=rating.stars,
        comment=rating.comment,
        timestamp=rating.timestamp,
        is_public=rating.is_public
    )


@router.post("", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
def create_rating(
    rating_data: RatingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a rating"""
    # Verify to_user exists
    to_user = db.query(User).filter(User.id == rating_data.to_user_id).first()
    if not to_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_rating = Rating(
        id=str(uuid.uuid4()),
        from_user_id=current_user.id,
        to_user_id=rating_data.to_user_id,
        transaction_id=rating_data.transaction_id,
        stars=rating_data.stars,
        comment=rating_data.comment,
        is_public=rating_data.is_public
    )
    
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    
    return enrich_rating_response(db, new_rating)


@router.get("", response_model=List[RatingResponse])
def get_ratings(
    to_user_id: str = None,
    db: Session = Depends(get_db)
):
    """Get ratings (optionally filtered by user)"""
    query = db.query(Rating).filter(Rating.is_public == True)
    
    if to_user_id:
        query = query.filter(Rating.to_user_id == to_user_id)
    
    ratings = query.order_by(Rating.timestamp.desc()).all()
    return [enrich_rating_response(db, rating) for rating in ratings]

