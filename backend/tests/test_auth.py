"""Tests for authentication endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import User, VerificationCode


class TestRegistration:
    """Test user registration."""
    
    @pytest.mark.asyncio
    async def test_register_new_user(self, client: AsyncClient, test_db: AsyncSession):
        """Test registering a new user."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "securepassword123",
                "display_name": "New User",
                "role": "SEEKER",
                "city": "New York",
                "state": "NY",
                "zip_code": "10001",
                "country": "USA"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["display_name"] == "New User"
        assert data["role"] == "SEEKER"
        assert data["email_verified"] is False
        assert "id" in data
        
        # Verify user was created in database
        result = await test_db.execute(
            select(User).where(User.email == "newuser@example.com")
        )
        user = result.scalar_one_or_none()
        assert user is not None
        
        # Verify verification code was created
        result = await test_db.execute(
            select(VerificationCode).where(VerificationCode.user_id == user.id)
        )
        code = result.scalar_one_or_none()
        assert code is not None
        assert code.code_type == "email"
    
    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, test_user: User):
        """Test registering with duplicate email fails."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "testuser@example.com",
                "password": "password123",
                "display_name": "Duplicate User",
                "city": "Boston",
                "state": "MA",
                "zip_code": "02101",
                "country": "USA"
            }
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client: AsyncClient):
        """Test registering with invalid email fails."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "notanemail",
                "password": "password123",
                "display_name": "Invalid Email User",
                "city": "Boston",
                "state": "MA",
                "zip_code": "02101",
                "country": "USA"
            }
        )
        
        assert response.status_code == 422  # Validation error


class TestEmailVerification:
    """Test email verification."""
    
    @pytest.mark.asyncio
    async def test_verify_email_success(self, client: AsyncClient, test_db: AsyncSession):
        """Test successful email verification."""
        # Register user first
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "verify@example.com",
                "password": "password123",
                "display_name": "Verify User",
                "city": "Austin",
                "state": "TX",
                "zip_code": "78701",
                "country": "USA"
            }
        )
        assert response.status_code == 201
        
        # Get verification code from database
        result = await test_db.execute(
            select(User).where(User.email == "verify@example.com")
        )
        user = result.scalar_one()
        
        result = await test_db.execute(
            select(VerificationCode)
            .where(VerificationCode.user_id == user.id)
            .order_by(VerificationCode.created_at.desc())
        )
        code_obj = result.scalar_one()
        
        # Verify email
        response = await client.post(
            "/api/auth/verify-email",
            json={
                "email": "verify@example.com",
                "code": code_obj.code
            }
        )
        
        assert response.status_code == 200
        assert "verified successfully" in response.json()["message"].lower()
        
        # Check user is verified
        await test_db.refresh(user)
        assert user.email_verified is True
    
    @pytest.mark.asyncio
    async def test_verify_email_invalid_code(self, client: AsyncClient, test_user: User):
        """Test email verification with invalid code fails."""
        response = await client.post(
            "/api/auth/verify-email",
            json={
                "email": "testuser@example.com",
                "code": "000000"
            }
        )
        
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_verify_email_nonexistent_user(self, client: AsyncClient):
        """Test email verification for nonexistent user fails."""
        response = await client.post(
            "/api/auth/verify-email",
            json={
                "email": "nonexistent@example.com",
                "code": "123456"
            }
        )
        
        assert response.status_code == 404


class TestLogin:
    """Test user login."""
    
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_user: User):
        """Test successful login."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == "testuser@example.com"
    
    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        """Test login with wrong password fails."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login with nonexistent user fails."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 401


class TestResendOTP:
    """Test OTP resend functionality."""
    
    @pytest.mark.asyncio
    async def test_resend_otp_success(self, client: AsyncClient, test_db: AsyncSession):
        """Test resending OTP code."""
        # Register user first
        await client.post(
            "/api/auth/register",
            json={
                "email": "resend@example.com",
                "password": "password123",
                "display_name": "Resend User",
                "city": "Seattle",
                "state": "WA",
                "zip_code": "98101",
                "country": "USA"
            }
        )
        
        # Resend OTP
        response = await client.post(
            "/api/auth/resend-otp",
            json={
                "email": "resend@example.com",
                "code_type": "email"
            }
        )
        
        assert response.status_code == 200
        assert "sent" in response.json()["message"].lower()
        
        # Verify new code was created
        result = await test_db.execute(
            select(User).where(User.email == "resend@example.com")
        )
        user = result.scalar_one()
        
        result = await test_db.execute(
            select(VerificationCode)
            .where(VerificationCode.user_id == user.id)
            .order_by(VerificationCode.created_at.desc())
        )
        codes = result.scalars().all()
        assert len(codes) >= 2  # Should have multiple codes
