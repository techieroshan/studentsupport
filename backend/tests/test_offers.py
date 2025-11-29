"""Tests for meal offer endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from models import MealOffer, User


class TestMealOffers:
    """Test meal offer endpoints."""
    
    @pytest.mark.asyncio
    async def test_create_offer_as_donor(self, client: AsyncClient, donor_auth_headers: dict):
        """Test creating a meal offer as a donor."""
        available_until = (datetime.utcnow() + timedelta(days=7)).isoformat()
        
        response = await client.post(
            "/api/offers",
            headers=donor_auth_headers,
            json={
                "description": "Homemade vegetarian Indian food",
                "dietary_tags": ["Vegetarian", "Hindu Veg (No Egg)"],
                "medical_tags": ["No Oil"],
                "logistics": ["Pickup (Student travels)", "Delivery (Donor drops off)"],
                "availability": "Weekends",
                "frequency": "Weekly",
                "available_until": available_until,
                "is_anonymous": False
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["description"] == "Homemade vegetarian Indian food"
        assert "Vegetarian" in data["dietary_tags"]
        assert data["status"] == "AVAILABLE"
        assert "id" in data
    
    @pytest.mark.asyncio
    async def test_create_offer_as_seeker_fails(self, client: AsyncClient, auth_headers: dict):
        """Test that seekers cannot create meal offers."""
        available_until = (datetime.utcnow() + timedelta(days=7)).isoformat()
        
        response = await client.post(
            "/api/offers",
            headers=auth_headers,
            json={
                "description": "Test offer",
                "dietary_tags": ["Vegan"],
                "medical_tags": [],
                "logistics": ["Pickup (Student travels)"],
                "availability": "Anytime",
                "frequency": "Once",
                "available_until": available_until,
                "is_anonymous": False
            }
        )
        
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_create_anonymous_offer(self, client: AsyncClient, donor_auth_headers: dict):
        """Test creating an anonymous meal offer."""
        available_until = (datetime.utcnow() + timedelta(days=3)).isoformat()
        
        response = await client.post(
            "/api/offers",
            headers=donor_auth_headers,
            json={
                "description": "Anonymous meal offering",
                "dietary_tags": ["Halal"],
                "medical_tags": [],
                "logistics": ["Meet Up (Public Spot)"],
                "availability": "Evenings",
                "frequency": "Once",
                "available_until": available_until,
                "is_anonymous": True
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["is_anonymous"] is True
        assert data["donor_name"] == "Anonymous Helper"
    
    @pytest.mark.asyncio
    async def test_get_offers(self, client: AsyncClient, test_db: AsyncSession, test_donor_user: User):
        """Test getting list of meal offers."""
        # Create test offers
        available_until = datetime.utcnow() + timedelta(days=7)
        
        offer1 = MealOffer(
            donor_id=test_donor_user.id,
            city=test_donor_user.city,
            state=test_donor_user.state,
            zip_code=test_donor_user.zip_code,
            country=test_donor_user.country,
            description="Vegan meals available",
            dietary_tags=["Vegan"],
            medical_tags=[],
            logistics=["Pickup (Student travels)"],
            availability="Anytime",
            frequency="Once",
            available_until=available_until,
            status="AVAILABLE"
        )
        offer2 = MealOffer(
            donor_id=test_donor_user.id,
            city=test_donor_user.city,
            state=test_donor_user.state,
            zip_code=test_donor_user.zip_code,
            country=test_donor_user.country,
            description="Kosher meals",
            dietary_tags=["Kosher"],
            medical_tags=[],
            logistics=["Delivery (Donor drops off)"],
            availability="Weekdays",
            frequency="Weekly",
            available_until=available_until,
            status="AVAILABLE"
        )
        
        test_db.add_all([offer1, offer2])
        await test_db.commit()
        
        # Get offers
        response = await client.get("/api/offers")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
    
    @pytest.mark.asyncio
    async def test_get_my_offers(self, client: AsyncClient, donor_auth_headers: dict, test_db: AsyncSession, test_donor_user: User):
        """Test getting current donor's meal offers."""
        # Create test offer
        available_until = datetime.utcnow() + timedelta(days=5)
        
        offer = MealOffer(
            donor_id=test_donor_user.id,
            city=test_donor_user.city,
            state=test_donor_user.state,
            zip_code=test_donor_user.zip_code,
            country=test_donor_user.country,
            description="My gluten-free offering",
            dietary_tags=["Gluten Free"],
            medical_tags=["Low Sodium"],
            logistics=["Dine-in (Hosted by Donor)"],
            availability="Weekends only",
            frequency="Once",
            available_until=available_until,
            status="AVAILABLE"
        )
        
        test_db.add(offer)
        await test_db.commit()
        
        # Get my offers
        response = await client.get("/api/offers/my-offers", headers=donor_auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["description"] == "My gluten-free offering"
