from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ChatThread, Message, MealRequest, MealOffer, RequestStatus, OfferStatus
from app.schemas import MessageCreate, MessageResponse, ChatThreadResponse, MatchAcceptResponse, PinVerify, PinVerifyResponse
from app.auth import get_current_active_user, require_seeker_or_donor
from typing import List
import uuid
import random
from datetime import datetime

router = APIRouter(prefix="/chats", tags=["chats"])


@router.get("", response_model=List[ChatThreadResponse])
def get_chat_threads(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all chat threads for current user"""
    threads = db.query(ChatThread).filter(
        (ChatThread.student_id == current_user.id) | (ChatThread.donor_id == current_user.id)
    ).order_by(ChatThread.updated_at.desc()).all()
    
    result = []
    for thread in threads:
        messages = db.query(Message).filter(Message.thread_id == thread.id).order_by(Message.timestamp).all()
        result.append(ChatThreadResponse(
            id=thread.id,
            item_type=thread.item_type,
            item_id=thread.item_id,
            student_id=thread.student_id,
            donor_id=thread.donor_id,
            status=thread.status,
            created_at=thread.created_at,
            messages=[MessageResponse(
                id=msg.id,
                sender_id=msg.sender_id,
                text=msg.text,
                timestamp=msg.timestamp,
                is_system=msg.is_system
            ) for msg in messages]
        ))
    
    return result


@router.get("/{thread_id}", response_model=ChatThreadResponse)
def get_chat_thread(
    thread_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific chat thread with messages"""
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    
    if thread.student_id != current_user.id and thread.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    
    messages = db.query(Message).filter(Message.thread_id == thread_id).order_by(Message.timestamp).all()
    
    return ChatThreadResponse(
        id=thread.id,
        item_type=thread.item_type,
        item_id=thread.item_id,
        student_id=thread.student_id,
        donor_id=thread.donor_id,
        status=thread.status,
        created_at=thread.created_at,
        messages=[MessageResponse(
            id=msg.id,
            sender_id=msg.sender_id,
            text=msg.text,
            timestamp=msg.timestamp,
            is_system=msg.is_system
        ) for msg in messages]
    )


@router.post("/{thread_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    thread_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a message in a chat thread"""
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    
    if thread.student_id != current_user.id and thread.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to send messages in this chat")
    
    # Determine request_id or offer_id
    request_id = None
    offer_id = None
    if thread.item_type == "REQUEST":
        request_id = thread.item_id
    else:
        offer_id = thread.item_id
    
    new_message = Message(
        id=str(uuid.uuid4()),
        thread_id=thread_id,
        sender_id=current_user.id,
        text=message_data.text,
        is_system=message_data.is_system,
        request_id=request_id,
        offer_id=offer_id
    )
    
    db.add(new_message)
    thread.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(new_message)
    
    return MessageResponse(
        id=new_message.id,
        sender_id=new_message.sender_id,
        text=new_message.text,
        timestamp=new_message.timestamp,
        is_system=new_message.is_system
    )


@router.post("/matches/{item_id}/accept", response_model=MatchAcceptResponse)
def accept_match(
    item_id: str,
    current_user: User = Depends(require_seeker_or_donor),
    db: Session = Depends(get_db)
):
    """Accept a match and generate a completion PIN"""
    # Find the item (request or offer)
    request = db.query(MealRequest).filter(MealRequest.id == item_id).first()
    offer = None
    if not request:
        offer = db.query(MealOffer).filter(MealOffer.id == item_id).first()
    
    if not request and not offer:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Determine item type and get the other party
    if request:
        item_type = "REQUEST"
        other_user_id = request.seeker_id
        if current_user.id == request.seeker_id:
            # Student accepting - need to find donor from offer
            raise HTTPException(status_code=400, detail="Students accept via offers, not requests")
    else:
        item_type = "OFFER"
        other_user_id = offer.donor_id
        if current_user.id == offer.donor_id:
            raise HTTPException(status_code=400, detail="Donors don't accept their own offers")
    
    # Find or create chat thread
    if item_type == "OFFER":
        thread = db.query(ChatThread).filter(
            ChatThread.offer_id == item_id,
            ChatThread.student_id == current_user.id,
            ChatThread.donor_id == other_user_id
        ).first()
    else:
        thread = db.query(ChatThread).filter(
            ChatThread.request_id == item_id,
            ChatThread.student_id == current_user.id,
            ChatThread.donor_id == other_user_id
        ).first()
    
    if not thread:
        # Create new thread
        thread = ChatThread(
            id=str(uuid.uuid4()),
            item_type=item_type,
            item_id=item_id,
            student_id=current_user.id if item_type == "OFFER" else other_user_id,
            donor_id=other_user_id if item_type == "OFFER" else current_user.id,
            request_id=item_id if item_type == "REQUEST" else None,
            offer_id=item_id if item_type == "OFFER" else None,
            status="IN_PROGRESS"
        )
        db.add(thread)
    
    # Generate 4-digit PIN
    completion_pin = f"{random.randint(1000, 9999)}"
    
    # Update item status and PIN
    if request:
        request.status = RequestStatus.IN_PROGRESS
        request.completion_pin = completion_pin
    else:
        offer.status = OfferStatus.IN_PROGRESS
        offer.completion_pin = completion_pin
    
    thread.status = "IN_PROGRESS"
    db.commit()
    db.refresh(thread)
    
    return MatchAcceptResponse(
        thread_id=thread.id,
        completion_pin=completion_pin,
        status="IN_PROGRESS"
    )


@router.post("/matches/{item_id}/verify-pin", response_model=PinVerifyResponse)
def verify_pin(
    item_id: str,
    pin_data: PinVerify,
    current_user: User = Depends(require_seeker_or_donor),
    db: Session = Depends(get_db)
):
    """Verify completion PIN and mark transaction as complete"""
    request = db.query(MealRequest).filter(MealRequest.id == item_id).first()
    offer = None
    if not request:
        offer = db.query(MealOffer).filter(MealOffer.id == item_id).first()
    
    if not request and not offer:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Verify PIN
    stored_pin = request.completion_pin if request else offer.completion_pin
    if stored_pin != pin_data.pin:
        return PinVerifyResponse(
            success=False,
            status=request.status.value if request else offer.status.value,
            message="Invalid PIN"
        )
    
    # Update status
    if request:
        request.status = RequestStatus.FULFILLED
        request.completion_pin = None
    else:
        offer.status = OfferStatus.CLAIMED
        offer.completion_pin = None
    
    # Update thread status
    thread = db.query(ChatThread).filter(
        (ChatThread.request_id == item_id) | (ChatThread.offer_id == item_id)
    ).first()
    if thread:
        thread.status = "COMPLETED"
    
    db.commit()
    
    return PinVerifyResponse(
        success=True,
        status="FULFILLED" if request else "CLAIMED",
        message="Transaction completed successfully"
    )

