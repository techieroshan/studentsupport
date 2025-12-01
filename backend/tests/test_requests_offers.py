"""
Tests for request and offer endpoints
"""
import pytest
from fastapi import status
from datetime import datetime, timedelta, timezone


def test_create_request(client, test_student_user):
    """Test creating a meal request"""
    token = test_student_user["token"]
    response = client.post(
        "/requests",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "dietary_needs": ["Vegan"],
            "medical_needs": ["None"],
            "logistics": ["Pickup (Student travels)"],
            "description": "Need a healthy vegan dinner",
            "availability": "Evenings after 6pm",
            "frequency": "One-time",
            "urgency": "NORMAL"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["description"] == "Need a healthy vegan dinner"
    assert data["status"] == "OPEN"
    assert "id" in data


def test_create_offer(client, test_donor_user):
    """Test creating a meal offer"""
    token = test_donor_user["token"]
    available_until = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    response = client.post(
        "/offers",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "description": "Homemade lasagna, vegetarian friendly",
            "dietary_tags": ["Vegetarian"],
            "medical_tags": ["None"],
            "available_until": available_until,
            "logistics": ["Pickup (Student travels)"],
            "availability": "Available tonight",
            "frequency": "One-time",
            "is_anonymous": False
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["description"] == "Homemade lasagna, vegetarian friendly"
    assert data["status"] == "AVAILABLE"
    assert "id" in data


def test_get_requests(client, test_student_user):
    """Test getting all requests"""
    token = test_student_user["token"]
    
    # Create a request first
    client.post(
        "/requests",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "dietary_needs": ["Vegan"],
            "medical_needs": ["None"],
            "logistics": ["Pickup (Student travels)"],
            "description": "Test request",
            "availability": "Evenings",
            "frequency": "One-time",
            "urgency": "NORMAL"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Get all requests
    response = client.get(
        "/requests",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_my_requests(client, test_student_user):
    """Test getting student's own requests"""
    token = test_student_user["token"]
    
    # Create a request
    client.post(
        "/requests",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "dietary_needs": ["Vegan"],
            "medical_needs": ["None"],
            "logistics": ["Pickup (Student travels)"],
            "description": "My request",
            "availability": "Evenings",
            "frequency": "One-time",
            "urgency": "NORMAL"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Get my requests
    response = client.get(
        "/requests/mine",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["description"] == "My request"


def test_update_request_status(client, test_student_user):
    """Test updating request status (pause/resume)"""
    token = test_student_user["token"]
    
    # Create a request
    create_response = client.post(
        "/requests",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "dietary_needs": ["Vegan"],
            "medical_needs": ["None"],
            "logistics": ["Pickup (Student travels)"],
            "description": "Test request",
            "availability": "Evenings",
            "frequency": "One-time",
            "urgency": "NORMAL"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    request_id = create_response.json()["id"]
    
    # Update status to PAUSED
    response = client.patch(
        f"/requests/{request_id}",
        json={"status": "PAUSED"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "PAUSED"
    
    # Resume it
    response = client.patch(
        f"/requests/{request_id}",
        json={"status": "OPEN"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "OPEN"


def test_delete_request(client, test_student_user):
    """Test deleting a request"""
    token = test_student_user["token"]
    
    # Create a request
    create_response = client.post(
        "/requests",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "dietary_needs": ["Vegan"],
            "medical_needs": ["None"],
            "logistics": ["Pickup (Student travels)"],
            "description": "To be deleted",
            "availability": "Evenings",
            "frequency": "One-time",
            "urgency": "NORMAL"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    request_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(
        f"/requests/{request_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's gone
    response = client.get(
        f"/requests/{request_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

