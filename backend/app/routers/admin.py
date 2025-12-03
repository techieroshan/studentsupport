from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, FlaggedContent, MealRequest, MealOffer, RequestStatus, OfferStatus
from app.schemas import FlagResponse
from app.auth import require_admin
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/flags", response_model=List[FlagResponse])
def get_flagged_items(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all flagged items for moderation"""
    flags = db.query(FlaggedContent).filter(
        FlaggedContent.dismissed == False
    ).order_by(FlaggedContent.timestamp.desc()).all()
    
    return [FlagResponse(
        id=flag.id,
        item_id=flag.item_id,
        item_type=flag.item_type,
        reason=flag.reason,
        flagged_by=flag.flagged_by,
        description=flag.description,
        timestamp=flag.timestamp,
        dismissed=flag.dismissed
    ) for flag in flags]


@router.post("/flags/{flag_id}/dismiss", response_model=FlagResponse)
def dismiss_flag(
    flag_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Dismiss a flag (mark as reviewed, don't delete content)"""
    flag = db.query(FlaggedContent).filter(FlaggedContent.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")
    
    flag.dismissed = True
    
    # Restore item status to original state
    if flag.item_type == "REQUEST":
        item = db.query(MealRequest).filter(MealRequest.id == flag.item_id).first()
        if item:
            item.status = RequestStatus.OPEN
    else:
        item = db.query(MealOffer).filter(MealOffer.id == flag.item_id).first()
        if item:
            item.status = OfferStatus.AVAILABLE
    
    db.commit()
    db.refresh(flag)
    
    return FlagResponse(
        id=flag.id,
        item_id=flag.item_id,
        item_type=flag.item_type,
        reason=flag.reason,
        flagged_by=flag.flagged_by,
        description=flag.description,
        timestamp=flag.timestamp,
        dismissed=flag.dismissed
    )


@router.delete("/flags/{flag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flagged_content(
    flag_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete flagged content (permanently remove the request/offer)"""
    flag = db.query(FlaggedContent).filter(FlaggedContent.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")
    
    # Delete the underlying content
    if flag.item_type == "REQUEST":
        request = db.query(MealRequest).filter(MealRequest.id == flag.item_id).first()
        if request:
            db.delete(request)
    else:
        offer = db.query(MealOffer).filter(MealOffer.id == flag.item_id).first()
        if offer:
            db.delete(offer)
    
    # Delete the flag record
    db.delete(flag)
    db.commit()
    
    return None

