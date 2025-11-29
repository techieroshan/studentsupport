"""Tests for user endpoints."""
import pytest
from httpx import AsyncClient
from models import User


class TestUserProfile:
    """Test user profile endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_profile_authenticated(self, client: AsyncClient, auth_headers: dict):
        """Test getting profile for authenticated user."""
        response = await client.get("/api/users/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "testuser@example.com"
        assert data["display_name"] == "Test User"
        assert data["role"] == "SEEKER"
    
    @pytest.mark.asyncio
    async def test_get_profile_unauthenticated(self, client: AsyncClient):
        """Test getting profile without authentication fails."""
        response = await client.get("/api/users/profile")
        
        assert response.status_code == 403  # No authorization header
    
    @pytest.mark.asyncio
    async def test_update_profile(self, client: AsyncClient, auth_headers: dict):
        """Test updating user profile."""
        response = await client.put(
            "/api/users/profile",
            headers=auth_headers,
            json={
                "display_name": "Updated Name",
                "city": "Los Angeles",
                "preferences": ["Vegan", "Halal"]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Updated Name"
        assert data["city"] == "Los Angeles"
        assert "Vegan" in data["preferences"]


class TestUserStats:
    """Test user statistics endpoint."""
    
    @pytest.mark.asyncio
    async def test_get_stats(self, client: AsyncClient):
        """Test getting platform statistics."""
        response = await client.get("/api/users/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert "total_meals" in data
        assert "active_students" in data
        assert "active_donors" in data
        assert "cities_covered" in data
        assert isinstance(data["total_meals"], int)
        assert isinstance(data["active_students"], int)
        assert isinstance(data["active_donors"], int)
        assert isinstance(data["cities_covered"], int)
