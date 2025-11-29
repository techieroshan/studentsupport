"""Tests for meal request endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from models import MealRequest, User


class TestMealRequests:
    """Test meal request endpoints."""
    
    @pytest.mark.asyncio
    async def test_create_request_as_seeker(self, client: AsyncClient, auth_headers: dict):
        """Test creating a meal request as a seeker."""
        response = await client.post(
            "/api/requests",
            headers=auth_headers,
            json={
                "dietary_needs": ["Vegetarian", "Gluten Free"],
                "medical_needs": ["No Oil"],
                "logistics": ["Pickup (Student travels)"],
                "description": "Looking for vegetarian meals near campus",
                "availability": "Weekdays after 5pm",
                "frequency": "Weekly",
                "urgency": "NORMAL"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["description"] == "Looking for vegetarian meals near campus"
        assert "Vegetarian" in data["dietary_needs"]
        assert data["status"] == "OPEN"
        assert "id" in data
    
    @pytest.mark.asyncio
    async def test_create_request_as_donor_fails(self, client: AsyncClient, donor_auth_headers: dict):
        """Test that donors cannot create meal requests."""
        response = await client.post(
            "/api/requests",
            headers=donor_auth_headers,
            json={
                "dietary_needs": ["Vegetarian"],
                "medical_needs": [],
                "logistics": ["Pickup (Student travels)"],
                "description": "Test request",
                "availability": "Weekdays",
                "frequency": "Once",
                "urgency": "NORMAL"
            }
        )
        
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_get_requests(self, client: AsyncClient, test_db: AsyncSession, test_user: User):
        """Test getting list of meal requests."""
        # Create test requests
        request1 = MealRequest(
            seeker_id=test_user.id,
            city=test_user.city,
            state=test_user.state,
            zip_code=test_user.zip_code,
            country=test_user.country,
            dietary_needs=["Vegan"],
            medical_needs=[],
            logistics=["Delivery (Donor drops off)"],
            description="Test request 1",
            availability="Anytime",
            frequency="Once",
            status="OPEN"
        )
        request2 = MealRequest(
            seeker_id=test_user.id,
            city=test_user.city,
            state=test_user.state,
            zip_code=test_user.zip_code,
            country=test_user.country,
            dietary_needs=["Halal"],
            medical_needs=[],
            logistics=["Pickup (Student travels)"],
            description="Test request 2",
            availability="Weekends",
            frequency="Weekly",
            status="OPEN"
        )
        
        test_db.add_all([request1, request2])
        await test_db.commit()
        
        # Get requests
        response = await client.get("/api/requests")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
    
    @pytest.mark.asyncio
    async def test_get_my_requests(self, client: AsyncClient, auth_headers: dict, test_db: AsyncSession, test_user: User):
        """Test getting current user's meal requests."""
        # Create test request
        request = MealRequest(
            seeker_id=test_user.id,
            city=test_user.city,
            state=test_user.state,
            zip_code=test_user.zip_code,
            country=test_user.country,
            dietary_needs=["Kosher"],
            medical_needs=[],
            logistics=["Meet Up (Public Spot)"],
            description="My test request",
            availability="Flexible",
            frequency="As needed",
            status="OPEN"
        )
        
        test_db.add(request)
        await test_db.commit()
        
        # Get my requests
        response = await client.get("/api/requests/my-requests", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["description"] == "My test request"
    
    @pytest.mark.asyncio
    async def test_filter_requests_by_city(self, client: AsyncClient, test_db: AsyncSession, test_user: User):
        """Test filtering requests by city."""
        # Create requests in different cities
        request1 = MealRequest(
            seeker_id=test_user.id,
            city="San Francisco",
            state="CA",
            zip_code="94102",
            country="USA",
            dietary_needs=["Vegan"],
            medical_needs=[],
            logistics=["Pickup (Student travels)"],
            description="SF request",
            availability="Anytime",
            frequency="Once",
            status="OPEN"
        )
        request2 = MealRequest(
            seeker_id=test_user.id,
            city="Los Angeles",
            state="CA",
            zip_code="90001",
            country="USA",
            dietary_needs=["Vegetarian"],
            medical_needs=[],
            logistics=["Pickup (Student travels)"],
            description="LA request",
            availability="Anytime",
            frequency="Once",
            status="OPEN"
        )
        
        test_db.add_all([request1, request2])
        await test_db.commit()
        
        # Filter by San Francisco
        response = await client.get("/api/requests?city=San Francisco")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["city"] == "San Francisco"
