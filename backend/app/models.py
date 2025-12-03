from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Text, JSON, and_
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


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


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.GUEST)
    avatar_id = Column(Integer, default=1)
    display_name = Column(String, nullable=False)
    email_verified = Column(Boolean, default=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=False, default="")
    state = Column(String, nullable=False, default="")
    zip = Column(String, nullable=False, default="")
    country = Column(String, nullable=False, default="United States")
    radius = Column(Float, default=10.0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED)
    verification_steps = Column(JSON, nullable=True)  # {emailCheck, phoneCheck, identityCheck}
    preferences = Column(JSON, nullable=True)  # Array of DietaryPreference
    languages = Column(JSON, nullable=False, default=[])  # Array of strings
    is_anonymous = Column(Boolean, default=False)
    weekly_meal_limit = Column(Integer, nullable=True)
    current_weekly_meals = Column(Integer, default=0)
    donor_category = Column(SQLEnum(DonorCategory), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    requests = relationship("MealRequest", back_populates="seeker", foreign_keys="MealRequest.seeker_id")
    offers = relationship("MealOffer", back_populates="donor", foreign_keys="MealOffer.donor_id")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    sent_ratings = relationship("Rating", back_populates="from_user", foreign_keys="Rating.from_user_id")
    received_ratings = relationship("Rating", back_populates="to_user", foreign_keys="Rating.to_user_id")
    flags_created = relationship("FlaggedContent", back_populates="flagged_by_user", foreign_keys="FlaggedContent.flagged_by")


class MealRequest(Base):
    __tablename__ = "meal_requests"

    id = Column(String, primary_key=True, index=True)
    seeker_id = Column(String, ForeignKey("users.id"), nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip = Column(String, nullable=False)
    country = Column(String, nullable=False, default="United States")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    dietary_needs = Column(JSON, nullable=False)  # Array of DietaryPreference
    medical_needs = Column(JSON, nullable=False)  # Array of MedicalPreference
    logistics = Column(JSON, nullable=False)  # Array of FulfillmentOption
    description = Column(Text, nullable=False)
    availability = Column(String, nullable=False)
    frequency = Column(SQLEnum(Frequency), nullable=False)
    urgency = Column(String, nullable=False, default="NORMAL")  # NORMAL or URGENT
    status = Column(SQLEnum(RequestStatus), nullable=False, default=RequestStatus.OPEN)
    completion_pin = Column(String, nullable=True)
    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    seeker = relationship("User", back_populates="requests", foreign_keys=[seeker_id])
    messages = relationship("Message", back_populates="request", foreign_keys="Message.request_id")


class MealOffer(Base):
    __tablename__ = "meal_offers"

    id = Column(String, primary_key=True, index=True)
    donor_id = Column(String, ForeignKey("users.id"), nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip = Column(String, nullable=False)
    country = Column(String, nullable=False, default="United States")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    dietary_tags = Column(JSON, nullable=False)  # Array of DietaryPreference
    medical_tags = Column(JSON, nullable=True)  # Array of MedicalPreference
    available_until = Column(DateTime(timezone=True), nullable=False)
    logistics = Column(JSON, nullable=False)  # Array of FulfillmentOption
    availability = Column(String, nullable=False)
    frequency = Column(SQLEnum(Frequency), nullable=False)
    is_anonymous = Column(Boolean, default=False)
    status = Column(SQLEnum(OfferStatus), nullable=False, default=OfferStatus.AVAILABLE)
    completion_pin = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    donor = relationship("User", back_populates="offers", foreign_keys=[donor_id])
    messages = relationship("Message", back_populates="offer", foreign_keys="Message.offer_id")


class ChatThread(Base):
    __tablename__ = "chat_threads"

    id = Column(String, primary_key=True, index=True)
    request_id = Column(String, ForeignKey("meal_requests.id"), nullable=True)
    offer_id = Column(String, ForeignKey("meal_offers.id"), nullable=True)
    item_type = Column(String, nullable=False)  # 'REQUEST' or 'OFFER'
    item_id = Column(String, nullable=False)  # The actual request/offer ID
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    donor_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="IN_PROGRESS")  # IN_PROGRESS, COMPLETED, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    messages = relationship("Message", back_populates="thread")
    request = relationship("MealRequest", foreign_keys=[request_id])
    offer = relationship("MealOffer", foreign_keys=[offer_id])


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    thread_id = Column(String, ForeignKey("chat_threads.id"), nullable=False)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_system = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Optional foreign keys for direct linking
    request_id = Column(String, ForeignKey("meal_requests.id"), nullable=True)
    offer_id = Column(String, ForeignKey("meal_offers.id"), nullable=True)

    # Relationships
    thread = relationship("ChatThread", back_populates="messages", foreign_keys=[thread_id])
    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])
    request = relationship("MealRequest", foreign_keys=[request_id])
    offer = relationship("MealOffer", foreign_keys=[offer_id])


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(String, primary_key=True, index=True)
    from_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    transaction_id = Column(String, nullable=False)  # The request/offer ID that was completed
    stars = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    is_public = Column(Boolean, default=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    from_user = relationship("User", back_populates="sent_ratings", foreign_keys=[from_user_id])
    to_user = relationship("User", back_populates="received_ratings", foreign_keys=[to_user_id])


class FlaggedContent(Base):
    __tablename__ = "flagged_content"

    id = Column(String, primary_key=True, index=True)
    item_id = Column(String, nullable=False)  # Request or Offer ID
    item_type = Column(String, nullable=False)  # 'REQUEST' or 'OFFER'
    reason = Column(String, nullable=False)
    flagged_by = Column(String, ForeignKey("users.id"), nullable=False)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    dismissed = Column(Boolean, default=False)

    # Relationships
    flagged_by_user = relationship("User", back_populates="flags_created", foreign_keys=[flagged_by])
    # Note: item_id can reference either MealRequest or MealOffer, but we don't define relationships
    # since there's no proper foreign key. Query flags separately when needed.


class DonorPartner(Base):
    __tablename__ = "donor_partners"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(SQLEnum(DonorCategory), nullable=False)
    tier = Column(SQLEnum(DonorTier), nullable=False)
    logo_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    total_contribution_display = Column(String, nullable=False)
    is_anonymous = Column(Boolean, default=False)
    anonymous_name = Column(String, nullable=True)
    quote = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    since = Column(String, nullable=False)
    is_recurring = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

