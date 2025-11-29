"""Tests for SEO endpoints."""
import pytest
from httpx import AsyncClient


class TestSEOEndpoints:
    """Test SEO and metadata endpoints."""
    
    @pytest.mark.asyncio
    async def test_sitemap_xml(self, client: AsyncClient):
        """Test sitemap.xml generation."""
        response = await client.get("/sitemap.xml")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/xml"
        content = response.text
        assert "<?xml version" in content
        assert "<urlset" in content
        assert "studentsupport.newabilities.org" in content
        assert "<loc>" in content
        assert "<priority>" in content
    
    @pytest.mark.asyncio
    async def test_robots_txt(self, client: AsyncClient):
        """Test robots.txt generation."""
        response = await client.get("/robots.txt")
        
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/plain")
        content = response.text
        assert "User-agent:" in content
        assert "Allow:" in content
        assert "Sitemap:" in content
        assert "GPTBot" in content
        assert "ChatGPT-User" in content
    
    @pytest.mark.asyncio
    async def test_llms_txt(self, client: AsyncClient):
        """Test llms.txt generation."""
        response = await client.get("/llms.txt")
        
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/plain")
        content = response.text
        assert "Student Support" in content
        assert "New Abilities Foundation" in content
        assert "dietary" in content.lower()
        assert "studentsupport.newabilities.org" in content
    
    @pytest.mark.asyncio
    async def test_organization_schema(self, client: AsyncClient):
        """Test Schema.org Organization structured data."""
        response = await client.get("/schema.org/organization")
        
        assert response.status_code == 200
        data = response.json()
        assert data["@context"] == "https://schema.org"
        assert data["@type"] == "Organization"
        assert data["name"] == "New Abilities Foundation"
        assert "address" in data
        assert data["address"]["@type"] == "PostalAddress"
    
    @pytest.mark.asyncio
    async def test_faq_schema(self, client: AsyncClient):
        """Test Schema.org FAQPage structured data."""
        response = await client.get("/schema.org/faq")
        
        assert response.status_code == 200
        data = response.json()
        assert data["@context"] == "https://schema.org"
        assert data["@type"] == "FAQPage"
        assert "mainEntity" in data
        assert isinstance(data["mainEntity"], list)
        assert len(data["mainEntity"]) > 0
        
        # Check first FAQ item
        faq = data["mainEntity"][0]
        assert faq["@type"] == "Question"
        assert "name" in faq
        assert "acceptedAnswer" in faq


class TestHealthCheck:
    """Test health check endpoint."""
    
    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """Test health check endpoint."""
        response = await client.get("/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: AsyncClient):
        """Test root API endpoint."""
        response = await client.get("/api")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Student Support API"
        assert data["status"] == "operational"
        assert "version" in data
