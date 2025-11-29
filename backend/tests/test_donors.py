"""Tests for donor endpoints."""
import pytest
from httpx import AsyncClient


class TestDonors:
    """Test donor organization endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_all_donors(self, client: AsyncClient, seed_donors):
        """Test getting all donor organizations."""
        response = await client.get("/api/donors")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["name"] == "Test Foundation"
    
    @pytest.mark.asyncio
    async def test_filter_donors_by_category(self, client: AsyncClient, seed_donors):
        """Test filtering donors by category."""
        response = await client.get("/api/donors?category=Non-Profits & Foundations")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["category"] == "Non-Profits & Foundations"
    
    @pytest.mark.asyncio
    async def test_donors_public_access(self, client: AsyncClient, seed_donors):
        """Test that donor endpoint is publicly accessible."""
        # No authentication headers
        response = await client.get("/api/donors")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
