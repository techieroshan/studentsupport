"""
Tests for authentication endpoints: registration and login
"""
import pytest
from fastapi import status


def test_register_student(client):
    """Test student registration"""
    response = client.post("/auth/register", json={
        "email": "newstudent@university.edu",
        "password": "securepass123",
        "role": "SEEKER",
        "display_name": "New Student",
        "city": "San Jose",
        "state": "CA",
        "zip": "95112",
        "country": "United States"
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_donor(client):
    """Test donor registration"""
    response = client.post("/auth/register", json={
        "email": "newdonor@example.com",
        "password": "securepass123",
        "role": "DONOR",
        "display_name": "New Donor",
        "city": "San Jose",
        "state": "CA",
        "zip": "95112",
        "country": "United States",
        "weekly_meal_limit": 10
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data


def test_register_duplicate_email(client):
    """Test that duplicate email registration fails"""
    # First registration
    client.post("/auth/register", json={
        "email": "duplicate@test.com",
        "password": "pass123",
        "role": "SEEKER",
        "display_name": "First",
        "city": "San Jose",
        "state": "CA",
        "zip": "95112",
        "country": "United States"
    })
    
    # Second registration with same email
    response = client.post("/auth/register", json={
        "email": "duplicate@test.com",
        "password": "pass123",
        "role": "SEEKER",
        "display_name": "Second",
        "city": "San Jose",
        "state": "CA",
        "zip": "95112",
        "country": "United States"
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_login_success(client, test_student_user):
    """Test successful login"""
    response = client.post("/auth/login", json={
        "email": "teststudent@university.edu",
        "password": "testpass123"
    })
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_student_user):
    """Test login with wrong password"""
    response = client.post("/auth/login", json={
        "email": "teststudent@university.edu",
        "password": "wrongpassword"
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user(client, test_student_user):
    """Test getting current user info"""
    token = test_student_user["token"]
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "teststudent@university.edu"
    assert data["display_name"] == "Test Student"
    assert data["role"] == "SEEKER"


def test_get_current_user_unauthorized(client):
    """Test getting current user without token"""
    response = client.get("/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

