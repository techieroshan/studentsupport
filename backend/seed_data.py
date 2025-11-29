"""Seed database with initial donor data."""
import asyncio
from database import async_session_maker
from models import Donor, DonorCategory, DonorTier

# Seed donor data
SEED_DONORS = [
    {
        "id": "d1",
        "name": "Zakat Foundation of America",
        "category": DonorCategory.NON_PROFIT,
        "tier": DonorTier.PLATINUM,
        "logo_url": "https://ui-avatars.com/api/?name=Zakat+Foundation&background=0d9488&color=fff&size=150&bold=true",
        "total_contribution_display": "$15,000+",
        "is_anonymous": False,
        "location": "Chicago, IL",
        "since": "2023",
        "quote": "Feeding students is a core part of our domestic hunger relief mandate."
    },
    {
        "id": "d2",
        "name": "Sri Venkateswara Temple",
        "category": DonorCategory.RELIGIOUS,
        "tier": DonorTier.PLATINUM,
        "logo_url": "https://ui-avatars.com/api/?name=SVT+Cary&background=ea580c&color=fff&size=150&bold=true",
        "total_contribution_display": "12,500 Meals",
        "is_anonymous": False,
        "location": "Cary, NC",
        "since": "2024",
        "is_recurring": True
    },
    {
        "id": "d3",
        "name": "City of Fremont",
        "category": DonorCategory.GOVERNMENT,
        "tier": DonorTier.PLATINUM,
        "logo_url": "https://ui-avatars.com/api/?name=City+Fremont&background=2563eb&color=fff&size=150&bold=true",
        "total_contribution_display": "$250,000 Grant",
        "is_anonymous": False,
        "location": "Fremont, CA",
        "since": "2025",
        "quote": "Supporting youth food security through the Community Development Block Grant."
    },
    {
        "id": "d4",
        "name": "Dr. Anand Patel",
        "category": DonorCategory.INDIVIDUAL,
        "tier": DonorTier.PLATINUM,
        "logo_url": "https://ui-avatars.com/api/?name=Dr+Anand+Patel&background=4f46e5&color=fff&size=150&bold=true",
        "total_contribution_display": "$25,000",
        "is_anonymous": False,
        "location": "Bay Area, CA",
        "since": "2024"
    },
    {
        "id": "d5",
        "name": "Anonymous",
        "anonymousName": "A Caring Sikh Family from Toronto",
        "category": DonorCategory.INDIVIDUAL,
        "tier": DonorTier.PLATINUM,
        "total_contribution_display": "18,000 Meals",
        "is_anonymous": True,
        "location": "Toronto, ON",
        "since": "2023",
        "is_recurring": True
    }
]


async def seed_donors():
    """Seed donor data into the database."""
    async with async_session_maker() as session:
        # Check if donors already exist
        from sqlalchemy import select
        result = await session.execute(select(Donor))
        existing_donors = result.scalars().all()
        
        if existing_donors:
            print(f"Donors already exist ({len(existing_donors)}). Skipping seed.")
            return
        
        # Add donors
        for donor_data in SEED_DONORS:
            donor = Donor(**donor_data)
            session.add(donor)
        
        await session.commit()
        print(f"Successfully seeded {len(SEED_DONORS)} donors.")


if __name__ == "__main__":
    asyncio.run(seed_donors())
