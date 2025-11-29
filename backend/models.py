"""SQLAlchemy models for Student Support application."""
from sqlalchemy import Column, String, Boolean, Integer, Text, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
import uuid


# Enums
class UserRole(str, enum.Enum):
    GUEST = "GUEST"
    SEEKER = "SEEKER"
    DONOR = "DONOR"
    ADMIN = "ADMIN"


class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"


class DietaryPreference(str, enum.Enum):
    VEGETARIAN = "Vegetarian"
    VEGAN = "Vegan"
    HINDU_VEG = "Hindu Veg (No Egg)"
    JAIN_VEG = "Jain Veg (No Root Veg)"
    HALAL = "Halal"
    KOSHER = "Kosher"
    GLUTEN_FREE = "Gluten Free"
    NUT_FREE = "Nut Free"
    NO_OIL = "No Oil"
    NONE = "No Restrictions"


class MedicalPreference(str, enum.Enum):
    NO_OIL = "No Oil"
    NO_SUGAR = "No Sugar"
    DAIRY_FREE = "Dairy Free"
    LOW_SODIUM = "Low Sodium"
    SOFT_FOOD = "Soft Food Only"
    NONE = "None"


class FulfillmentOption(str, enum.Enum):
    PICKUP = "Pickup (Student travels)"
    DELIVERY = "Delivery (Donor drops off)"
    DINE_IN = "Dine-in (Hosted by Donor)"
    MEET_UP = "Meet Up (Public Spot)"


class Frequency(str, enum.Enum):
    ONCE = "One-time"
    WEEKLY = "Weekly"
    DAILY = "Daily"
    AS_NEEDED = "As needed"


class DonorCategory(str, enum.Enum):
    GOVERNMENT = "Government & Public Bodies"
    RELIGIOUS = "Religious & Faith Organizations"
    NON_PROFIT = "Non-Profits & Foundations"
    FAMILY_OFFICE = "Family Offices"
    INDIVIDUAL = "Individual Philanthropists"
    BUSINESS = "Businesses & Corporate CSR"
    UNIVERSITY = "University & Student Groups"


class DonorTier(str, enum.Enum):
    PLATINUM = "Platinum Partner"
    GOLD = "Gold Partner"
    SILVER = "Silver Partner"
    BRONZE = "Bronze Partner"
    COMMUNITY = "Community Partner"


class RequestStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    FULFILLED = "FULFILLED"
    PAUSED = "PAUSED"
    EXPIRED = "EXPIRED"
    FLAGGED = "FLAGGED"


class OfferStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    IN_PROGRESS = "IN_PROGRESS"
    CLAIMED = "CLAIMED"
    FLAGGED = "FLAGGED"


# Models
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.SEEKER)
    
    # Profile information
    display_name = Column(String, nullable=False)
    avatar_id = Column(Integer, default=1)
    phone = Column(String)
    address = Column(Text)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    country = Column(String, nullable=False, default="USA")
    latitude = Column(Float)
    longitude = Column(Float)
    radius = Column(Integer, default=50)
    
    # Verification
    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED)
    
    # Preferences
    preferences = Column(JSON)  # List of dietary preferences
    languages = Column(JSON)  # List of languages
    is_anonymous = Column(Boolean, default=False)
    
    # Donor specific
    donor_category = Column(SQLEnum(DonorCategory), nullable=True)
    weekly_meal_limit = Column(Integer)
    current_weekly_meals = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    meal_requests = relationship("MealRequest", back_populates="seeker", foreign_keys="MealRequest.seeker_id")
    meal_offers = relationship("MealOffer", back_populates="donor", foreign_keys="MealOffer.donor_id")
    messages_sent = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    ratings_given = relationship("Rating", back_populates="reviewer", foreign_keys="Rating.from_user_id")
    ratings_received = relationship("Rating", back_populates="reviewed", foreign_keys="Rating.to_user_id")


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(6), nullable=False)
    code_type = Column(String, nullable=False)  # 'email' or 'phone'
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MealRequest(Base):
    __tablename__ = "meal_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    seeker_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Location
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    country = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Requirements
    dietary_needs = Column(JSON)  # List of DietaryPreference
    medical_needs = Column(JSON)  # List of MedicalPreference
    logistics = Column(JSON)  # List of FulfillmentOption
    description = Column(Text, nullable=False)
    availability = Column(String)  # "Weekends", "Evenings", etc.
    frequency = Column(SQLEnum(Frequency), nullable=False)
    urgency = Column(String, default="NORMAL")  # 'NORMAL' or 'URGENT'
    
    # Status
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.OPEN)
    completion_pin = Column(String(4))
    
    # Timestamps
    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    seeker = relationship("User", back_populates="meal_requests", foreign_keys=[seeker_id])
    messages = relationship("Message", back_populates="meal_request", cascade="all, delete-orphan")


class MealOffer(Base):
    __tablename__ = "meal_offers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    donor_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Location
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    country = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Offer details
    description = Column(Text, nullable=False)
    image_url = Column(String)
    dietary_tags = Column(JSON)  # List of DietaryPreference
    medical_tags = Column(JSON)  # List of MedicalPreference
    logistics = Column(JSON)  # List of FulfillmentOption
    availability = Column(String)  # "Weekends", "Evenings", etc.
    frequency = Column(SQLEnum(Frequency), nullable=False)
    available_until = Column(DateTime(timezone=True), nullable=False)
    is_anonymous = Column(Boolean, default=False)
    
    # Status
    status = Column(SQLEnum(OfferStatus), default=OfferStatus.AVAILABLE)
    completion_pin = Column(String(4))
    
    # Timestamps
    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    donor = relationship("User", back_populates="meal_offers", foreign_keys=[donor_id])
    messages = relationship("Message", back_populates="meal_offer", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    request_id = Column(String, ForeignKey("meal_requests.id", ondelete="CASCADE"), nullable=True)
    offer_id = Column(String, ForeignKey("meal_offers.id", ondelete="CASCADE"), nullable=True)
    
    text = Column(Text, nullable=False)
    is_system = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    sender = relationship("User", back_populates="messages_sent", foreign_keys=[sender_id])
    meal_request = relationship("MealRequest", back_populates="messages")
    meal_offer = relationship("MealOffer", back_populates="messages")


class Donor(Base):
    __tablename__ = "donors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    category = Column(SQLEnum(DonorCategory), nullable=False)
    tier = Column(SQLEnum(DonorTier), nullable=False)
    logo_url = Column(String)
    website_url = Column(String)
    total_contribution_display = Column(String)
    is_anonymous = Column(Boolean, default=False)
    anonymous_name = Column(String)
    quote = Column(Text)
    location = Column(String)
    since = Column(String)
    is_recurring = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    from_user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    to_user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    transaction_id = Column(String, nullable=False)
    stars = Column(Integer, nullable=False)
    comment = Column(Text)
    is_public = Column(Boolean, default=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    reviewer = relationship("User", back_populates="ratings_given", foreign_keys=[from_user_id])
    reviewed = relationship("User", back_populates="ratings_received", foreign_keys=[to_user_id])


class FlaggedContent(Base):
    __tablename__ = "flagged_content"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    item_id = Column(String, nullable=False)
    item_type = Column(String, nullable=False)  # 'REQUEST' or 'OFFER'
    reason = Column(String, nullable=False)
    description = Column(Text)
    flagged_by = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)
