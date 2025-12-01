from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, MealRequest, RequestStatus
from app.schemas import RequestCreate, RequestResponse, RequestUpdate
from app.auth import get_current_active_user, require_seeker
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/requests", tags=["requests"])


def enrich_request_response(db: Session, request: MealRequest) -> RequestResponse:
    """Enrich request with seeker info for response"""
    seeker = db.query(User).filter(User.id == request.seeker_id).first()
    if not seeker:
        raise HTTPException(status_code=404, detail="Seeker not found")
    
    return RequestResponse(
        id=request.id,
        seeker_id=request.seeker_id,
        seeker_name=seeker.display_name,
        seeker_avatar_id=seeker.avatar_id,
        seeker_verification_status=seeker.verification_status,
        seeker_languages=seeker.languages or [],
        city=request.city,
        state=request.state,
        zip=request.zip,
        country=request.country,
        latitude=request.latitude,
        longitude=request.longitude,
        dietary_needs=request.dietary_needs,
        medical_needs=request.medical_needs,
        logistics=request.logistics,
        description=request.description,
        availability=request.availability,
        frequency=request.frequency,
        urgency=request.urgency,
        status=request.status,
        completion_pin=request.completion_pin,
        posted_at=request.posted_at
    )


@router.post("", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    request_data: RequestCreate,
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db)
):
    """Create a new meal request"""
    new_request = MealRequest(
        id=str(uuid.uuid4()),
        seeker_id=current_user.id,
        city=request_data.city,
        state=request_data.state,
        zip=request_data.zip,
        country=request_data.country,
        latitude=request_data.latitude,
        longitude=request_data.longitude,
        dietary_needs=request_data.dietary_needs,
        medical_needs=request_data.medical_needs,
        logistics=request_data.logistics,
        description=request_data.description,
        availability=request_data.availability,
        frequency=request_data.frequency,
        urgency=request_data.urgency,
        status=RequestStatus.OPEN
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return enrich_request_response(db, new_request)


@router.get("", response_model=List[RequestResponse])
def browse_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    diet: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Browse/filter meal requests"""
    query = db.query(MealRequest)
    
    if status_filter:
        try:
            status_enum = RequestStatus(status_filter)
            query = query.filter(MealRequest.status == status_enum)
        except ValueError:
            pass
    
    if city:
        query = query.filter(MealRequest.city.ilike(f"%{city}%"))
    
    if diet:
        # Filter by dietary needs (JSON array contains)
        query = query.filter(MealRequest.dietary_needs.contains([diet]))
    
    requests = query.order_by(MealRequest.posted_at.desc()).all()
    return [enrich_request_response(db, req) for req in requests]


@router.get("/mine", response_model=List[RequestResponse])
def get_my_requests(
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db)
):
    """Get current student's own requests"""
    requests = db.query(MealRequest).filter(
        MealRequest.seeker_id == current_user.id
    ).order_by(MealRequest.posted_at.desc()).all()
    
    return [enrich_request_response(db, req) for req in requests]


@router.get("/{request_id}", response_model=RequestResponse)
def get_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific request by ID"""
    request = db.query(MealRequest).filter(MealRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return enrich_request_response(db, request)


@router.patch("/{request_id}", response_model=RequestResponse)
def update_request(
    request_id: str,
    request_update: RequestUpdate,
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db)
):
    """Update a request (pause/resume/mark-fulfilled)"""
    request = db.query(MealRequest).filter(MealRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.seeker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this request")
    
    update_data = request_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(request, field, value)
    
    db.commit()
    db.refresh(request)
    
    return enrich_request_response(db, request)


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(
    request_id: str,
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db)
):
    """Delete a request"""
    request = db.query(MealRequest).filter(MealRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.seeker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this request")
    
    db.delete(request)
    db.commit()
    return None

