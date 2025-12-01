from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models import (
    UserRole, VerificationStatus, DietaryPreference, MedicalPreference,
    FulfillmentOption, Frequency, RequestStatus, OfferStatus,
    DonorCategory, DonorTier
)


# ============ Auth Schemas ============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    display_name: str
    city: Optional[str] = ""
    state: Optional[str] = ""
    zip: Optional[str] = ""
    country: Optional[str] = "United States"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


# ============ User Schemas ============
class UserBase(BaseModel):
    display_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: str
    state: str
    zip: str
    country: str
    radius: float = 10.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    languages: List[str] = []
    preferences: Optional[List[DietaryPreference]] = None
    weekly_meal_limit: Optional[int] = None
    is_anonymous: Optional[bool] = False
    donor_category: Optional[DonorCategory] = None


class UserPublic(BaseModel):
    id: str
    role: UserRole
    avatar_id: int
    display_name: str
    email_verified: bool
    city: str
    state: str
    zip: str
    country: str
    verification_status: VerificationStatus
    languages: List[str]
    is_anonymous: Optional[bool] = False
    donor_category: Optional[DonorCategory] = None

    class Config:
        from_attributes = True


class UserResponse(UserPublic):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    radius: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferences: Optional[List[DietaryPreference]] = None
    weekly_meal_limit: Optional[int] = None
    current_weekly_meals: int
    verification_steps: Optional[dict] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    country: Optional[str] = None
    radius: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    languages: Optional[List[str]] = None
    preferences: Optional[List[DietaryPreference]] = None
    weekly_meal_limit: Optional[int] = None
    is_anonymous: Optional[bool] = None
    donor_category: Optional[DonorCategory] = None


# ============ Request Schemas ============
class RequestCreate(BaseModel):
    city: str
    state: str
    zip: str
    country: str = "United States"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    dietary_needs: List[DietaryPreference]
    medical_needs: List[MedicalPreference]
    logistics: List[FulfillmentOption]
    description: str
    availability: str
    frequency: Frequency
    urgency: str = "NORMAL"  # NORMAL or URGENT


class RequestResponse(BaseModel):
    id: str
    seeker_id: str
    seeker_name: str
    seeker_avatar_id: int
    seeker_verification_status: VerificationStatus
    seeker_languages: List[str]
    city: str
    state: str
    zip: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    dietary_needs: List[DietaryPreference]
    medical_needs: List[MedicalPreference]
    logistics: List[FulfillmentOption]
    description: str
    availability: str
    frequency: Frequency
    urgency: str
    status: RequestStatus
    completion_pin: Optional[str] = None
    posted_at: datetime

    class Config:
        from_attributes = True


class RequestUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    description: Optional[str] = None
    availability: Optional[str] = None


# ============ Offer Schemas ============
class OfferCreate(BaseModel):
    city: str
    state: str
    zip: str
    country: str = "United States"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    image_url: Optional[str] = None
    dietary_tags: List[DietaryPreference]
    medical_tags: Optional[List[MedicalPreference]] = None
    available_until: datetime
    logistics: List[FulfillmentOption]
    availability: str
    frequency: Frequency
    is_anonymous: Optional[bool] = False


class OfferResponse(BaseModel):
    id: str
    donor_id: str
    donor_name: str
    donor_avatar_id: int
    donor_verification_status: VerificationStatus
    donor_languages: List[str]
    city: str
    state: str
    zip: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    image_url: Optional[str] = None
    dietary_tags: List[DietaryPreference]
    medical_tags: Optional[List[MedicalPreference]] = None
    available_until: datetime
    logistics: List[FulfillmentOption]
    availability: str
    frequency: Frequency
    is_anonymous: Optional[bool] = False
    status: OfferStatus
    completion_pin: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OfferUpdate(BaseModel):
    status: Optional[OfferStatus] = None
    description: Optional[str] = None
    availability: Optional[str] = None
    available_until: Optional[datetime] = None


# ============ Chat Schemas ============
class MessageCreate(BaseModel):
    text: str
    is_system: Optional[bool] = False


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    text: str
    timestamp: datetime
    is_system: bool = False

    class Config:
        from_attributes = True


class ChatThreadResponse(BaseModel):
    id: str
    item_type: str
    item_id: str
    student_id: str
    donor_id: str
    status: str
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


# ============ Match/PIN Schemas ============
class MatchAcceptResponse(BaseModel):
    thread_id: str
    completion_pin: str
    status: str


class PinVerify(BaseModel):
    pin: str


class PinVerifyResponse(BaseModel):
    success: bool
    status: str
    message: str


# ============ Rating Schemas ============
class RatingCreate(BaseModel):
    to_user_id: str
    transaction_id: str
    stars: int = Field(..., ge=1, le=5)
    comment: str
    is_public: Optional[bool] = True


class RatingResponse(BaseModel):
    id: str
    from_user_id: str
    reviewer_name: str
    reviewer_avatar_id: int
    reviewer_role: UserRole
    reviewer_location: str
    to_user_id: str
    transaction_id: str
    stars: int
    comment: str
    timestamp: datetime
    is_public: Optional[bool] = True

    class Config:
        from_attributes = True


# ============ Flag Schemas ============
class FlagCreate(BaseModel):
    item_id: str
    item_type: str  # 'REQUEST' or 'OFFER'
    reason: str
    description: Optional[str] = None


class FlagResponse(BaseModel):
    id: str
    item_id: str
    item_type: str
    reason: str
    flagged_by: str
    description: Optional[str] = None
    timestamp: datetime
    dismissed: bool

    class Config:
        from_attributes = True


# ============ Donor Partner Schemas ============
class DonorPartnerCreate(BaseModel):
    name: str
    category: DonorCategory
    tier: DonorTier
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    total_contribution_display: str
    is_anonymous: bool = False
    anonymous_name: Optional[str] = None
    quote: Optional[str] = None
    location: Optional[str] = None
    since: str
    is_recurring: bool = False


class DonorPartnerResponse(BaseModel):
    id: str
    name: str
    category: DonorCategory
    tier: DonorTier
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    total_contribution_display: str
    is_anonymous: bool
    anonymous_name: Optional[str] = None
    quote: Optional[str] = None
    location: Optional[str] = None
    since: str
    is_recurring: Optional[bool] = False

    class Config:
        from_attributes = True

