"""
Database seeding script for demo users and initial data
Run with: python -m app.seed
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, MealRequest, MealOffer, DonorPartner, UserRole, VerificationStatus, DietaryPreference, MedicalPreference, FulfillmentOption, Frequency, RequestStatus, OfferStatus, DonorCategory, DonorTier
import bcrypt

def get_password_hash(password: str) -> str:
    # Hash password using bcrypt directly
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')
from datetime import datetime, timedelta
import uuid

# Create tables
Base.metadata.create_all(bind=engine)

def seed_database():
    db: Session = SessionLocal()
    try:
        # Check if users already exist
        existing_admin = db.query(User).filter(User.email == "admin@newabilities.org").first()
        if existing_admin:
            print("Database already seeded. Skipping...")
            return

        # Create Admin User
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@newabilities.org",
            password_hash=get_password_hash("password"),
            role=UserRole.ADMIN,
            display_name="System Admin",
            avatar_id=0,
            email_verified=True,
            city="San Jose",
            state="CA",
            zip="95112",
            country="United States",
            verification_status=VerificationStatus.VERIFIED,
            verification_steps={"emailCheck": True, "phoneCheck": True, "identityCheck": True},
            languages=["English"]
        )
        db.add(admin)

        # Create Demo Student User
        student = User(
            id="s-1",
            email="student@university.edu",
            password_hash=get_password_hash("password"),
            role=UserRole.SEEKER,
            display_name="Studious Owl",
            avatar_id=1,
            email_verified=True,
            city="San Jose",
            state="CA",
            zip="95112",
            country="United States",
            latitude=37.3382,
            longitude=-121.8863,
            verification_status=VerificationStatus.VERIFIED,
            verification_steps={"emailCheck": True, "phoneCheck": True, "identityCheck": True},
            languages=["English", "Spanish"],
            preferences=[DietaryPreference.VEGAN]
        )
        db.add(student)

        # Create Demo Donor User
        donor = User(
            id="d-1",
            email="donor@gmail.com",
            password_hash=get_password_hash("password"),
            role=UserRole.DONOR,
            display_name="Kind Neighbor",
            avatar_id=5,
            email_verified=True,
            city="San Jose",
            state="CA",
            zip="95112",
            country="United States",
            latitude=37.33,
            longitude=-121.89,
            verification_status=VerificationStatus.VERIFIED,
            verification_steps={"emailCheck": True, "phoneCheck": True, "identityCheck": True},
            languages=["English"],
            weekly_meal_limit=5,
            current_weekly_meals=0,
            donor_category=DonorCategory.INDIVIDUAL
        )
        db.add(donor)

        # Create some sample requests
        request1 = MealRequest(
            id="req-1",
            seeker_id="s-1",
            city="San Jose",
            state="CA",
            zip="95112",
            country="United States",
            latitude=37.3382,
            longitude=-121.8863,
            dietary_needs=[DietaryPreference.VEGAN],
            medical_needs=[MedicalPreference.NONE],
            logistics=[FulfillmentOption.PICKUP, FulfillmentOption.DELIVERY],
            description="Finals week is crazy! Would love a healthy vegan dinner.",
            availability="Evenings after 6pm",
            frequency=Frequency.ONCE,
            urgency="NORMAL",
            status=RequestStatus.OPEN,
            posted_at=datetime.utcnow() - timedelta(hours=1)
        )
        db.add(request1)

        # Create some sample offers
        offer1 = MealOffer(
            id="off-1",
            donor_id="d-1",
            city="San Jose",
            state="CA",
            zip="95112",
            country="United States",
            latitude=37.33,
            longitude=-121.89,
            description="Made extra lasagna, vegetarian friendly!",
            dietary_tags=[DietaryPreference.VEGETARIAN],
            medical_tags=[MedicalPreference.NONE],
            available_until=datetime.utcnow() + timedelta(days=1),
            logistics=[FulfillmentOption.PICKUP],
            availability="Available tonight",
            frequency=Frequency.ONCE,
            is_anonymous=False,
            status=OfferStatus.AVAILABLE,
            created_at=datetime.utcnow()
        )
        db.add(offer1)

        # Create some donor partners
        partner1 = DonorPartner(
            id="d1",
            name="Zakat Foundation of America",
            category=DonorCategory.NON_PROFIT,
            tier=DonorTier.PLATINUM,
            logo_url="https://ui-avatars.com/api/?name=Zakat+Foundation&background=0d9488&color=fff&size=150&bold=true",
            total_contribution_display="$15,000+",
            is_anonymous=False,
            location="Chicago, IL",
            since="2023",
            quote="Feeding students is a core part of our domestic hunger relief mandate."
        )
        db.add(partner1)

        partner2 = DonorPartner(
            id="d2",
            name="Sri Venkateswara Temple",
            category=DonorCategory.RELIGIOUS,
            tier=DonorTier.PLATINUM,
            logo_url="https://ui-avatars.com/api/?name=SVT+Cary&background=ea580c&color=fff&size=150&bold=true",
            total_contribution_display="12,500 Meals",
            is_anonymous=False,
            location="Cary, NC",
            since="2024",
            is_recurring=True
        )
        db.add(partner2)

        partner3 = DonorPartner(
            id="d3",
            name="City of Fremont",
            category=DonorCategory.GOVERNMENT,
            tier=DonorTier.PLATINUM,
            logo_url="https://ui-avatars.com/api/?name=City+Fremont&background=2563eb&color=fff&size=150&bold=true",
            total_contribution_display="$250,000 Grant",
            is_anonymous=False,
            location="Fremont, CA",
            since="2025",
            quote="Supporting youth food security through the Community Development Block Grant."
        )
        db.add(partner3)

        db.commit()
        print("Database seeded successfully!")
        print("Demo users created:")
        print("  - Admin: admin@newabilities.org / password")
        print("  - Student: student@university.edu / password")
        print("  - Donor: donor@gmail.com / password")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

