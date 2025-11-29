from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, FlaggedContent, MealRequest, MealOffer, RequestStatus, OfferStatus
from app.schemas import FlagCreate, FlagResponse
from app.auth import get_current_active_user
import uuid
from datetime import datetime

router = APIRouter(prefix="/flags", tags=["flags"])


@router.post("", response_model=FlagResponse, status_code=status.HTTP_201_CREATED)
def create_flag(
    flag_data: FlagCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Flag a request or offer"""
    # Verify the item exists
    if flag_data.item_type == "REQUEST":
        item = db.query(MealRequest).filter(MealRequest.id == flag_data.item_id).first()
    else:
        item = db.query(MealOffer).filter(MealOffer.id == flag_data.item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Check if already flagged by this user
    existing_flag = db.query(FlaggedContent).filter(
        FlaggedContent.item_id == flag_data.item_id,
        FlaggedContent.flagged_by == current_user.id,
        FlaggedContent.dismissed == False
    ).first()
    
    if existing_flag:
        raise HTTPException(status_code=400, detail="Item already flagged by you")
    
    # Create flag
    new_flag = FlaggedContent(
        id=str(uuid.uuid4()),
        item_id=flag_data.item_id,
        item_type=flag_data.item_type,
        reason=flag_data.reason,
        flagged_by=current_user.id,
        description=flag_data.description,
        dismissed=False
    )
    
    # Update item status to FLAGGED
    if flag_data.item_type == "REQUEST":
        item.status = RequestStatus.FLAGGED
    else:
        item.status = OfferStatus.FLAGGED
    
    db.add(new_flag)
    db.commit()
    db.refresh(new_flag)
    
    return FlagResponse(
        id=new_flag.id,
        item_id=new_flag.item_id,
        item_type=new_flag.item_type,
        reason=new_flag.reason,
        flagged_by=new_flag.flagged_by,
        description=new_flag.description,
        timestamp=new_flag.timestamp,
        dismissed=new_flag.dismissed
    )

