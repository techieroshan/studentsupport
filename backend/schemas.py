"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from models import (
    UserRole, VerificationStatus, DietaryPreference, MedicalPreference,
    FulfillmentOption, Frequency, DonorCategory, DonorTier,
    RequestStatus, OfferStatus
)


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    display_name: str
    city: str
    state: str
    zip_code: str
    country: str = "USA"


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.SEEKER
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    role: UserRole
    avatar_id: int
    email_verified: bool
    phone_verified: bool
    verification_status: VerificationStatus
    preferences: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    is_anonymous: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius: int = 50
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    preferences: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    radius: Optional[int] = None
    is_anonymous: Optional[bool] = None


# Verification Schemas
class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class VerifyPhoneRequest(BaseModel):
    phone: str
    code: str


class ResendOTPRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    code_type: str  # 'email' or 'phone'


# Meal Request Schemas
class MealRequestCreate(BaseModel):
    dietary_needs: List[str]
    medical_needs: List[str]
    logistics: List[str]
    description: str
    availability: str
    frequency: str
    urgency: str = "NORMAL"


class MealRequestResponse(BaseModel):
    id: str
    seeker_id: str
    seeker_name: str
    seeker_avatar_id: int
    seeker_verification_status: str
    seeker_languages: List[str]
    city: str
    state: str
    zip_code: str
    country: str
    latitude: Optional[float]
    longitude: Optional[float]
    dietary_needs: List[str]
    medical_needs: List[str]
    logistics: List[str]
    description: str
    availability: str
    frequency: str
    urgency: str
    status: str
    posted_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Meal Offer Schemas
class MealOfferCreate(BaseModel):
    description: str
    dietary_tags: List[str]
    medical_tags: List[str]
    logistics: List[str]
    availability: str
    frequency: str
    available_until: datetime
    is_anonymous: bool = False
    image_url: Optional[str] = None


class MealOfferResponse(BaseModel):
    id: str
    donor_id: str
    donor_name: str
    donor_avatar_id: int
    donor_verification_status: str
    donor_languages: List[str]
    city: str
    state: str
    zip_code: str
    country: str
    latitude: Optional[float]
    longitude: Optional[float]
    description: str
    dietary_tags: List[str]
    medical_tags: List[str]
    logistics: List[str]
    availability: str
    frequency: str
    available_until: datetime
    is_anonymous: bool
    status: str
    posted_at: datetime
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Message Schemas
class MessageCreate(BaseModel):
    text: str
    request_id: Optional[str] = None
    offer_id: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    text: str
    is_system: bool
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# Donor Schemas
class DonorResponse(BaseModel):
    id: str
    name: str
    category: str
    tier: str
    logo_url: Optional[str]
    website_url: Optional[str]
    total_contribution_display: str
    is_anonymous: bool
    anonymous_name: Optional[str]
    quote: Optional[str]
    location: Optional[str]
    since: str
    is_recurring: bool = False

    model_config = ConfigDict(from_attributes=True)


# Rating Schemas
class RatingCreate(BaseModel):
    to_user_id: Optional[str] = None
    transaction_id: str
    stars: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    is_public: bool = True


class RatingResponse(BaseModel):
    id: str
    from_user_id: str
    to_user_id: Optional[str]
    transaction_id: str
    stars: int
    comment: Optional[str]
    is_public: bool
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# Flagged Content Schemas
class FlagContentRequest(BaseModel):
    item_id: str
    item_type: str  # 'REQUEST' or 'OFFER'
    reason: str
    description: Optional[str] = None


class FlaggedContentResponse(BaseModel):
    id: str
    item_id: str
    item_type: str
    reason: str
    description: Optional[str]
    flagged_by: str
    timestamp: datetime
    resolved: bool

    model_config = ConfigDict(from_attributes=True)


# Transaction Schemas
class VerifyPinRequest(BaseModel):
    transaction_id: str
    pin: str


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Stats Schema
class StatsResponse(BaseModel):
    total_meals: int
    active_students: int
    active_donors: int
    cities_covered: int
