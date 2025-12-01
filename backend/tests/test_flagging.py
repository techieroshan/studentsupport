"""
Tests for flagging and moderation endpoints
"""
import pytest
from fastapi import status
from datetime import datetime, timedelta, timezone


def test_flag_request(client, test_student_user, test_donor_user):
    """Test flagging a request"""
    student_token = test_student_user["token"]
    donor_token = test_donor_user["token"]
    
    # Student creates a request
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
            "description": "Request to be flagged",
            "availability": "Evenings",
            "frequency": "One-time",
            "urgency": "NORMAL"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert create_response.status_code == status.HTTP_201_CREATED, f"Request creation failed: {create_response.text}"
    request_id = create_response.json()["id"]
    
    # Donor flags it
    flag_response = client.post(
        "/flags",
        json={
            "item_id": request_id,
            "item_type": "REQUEST",
            "reason": "Inappropriate content",
            "description": "This request contains inappropriate language"
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    assert flag_response.status_code == status.HTTP_201_CREATED
    flag_data = flag_response.json()
    assert flag_data["item_id"] == request_id
    assert flag_data["item_type"] == "REQUEST"
    assert flag_data["reason"] == "Inappropriate content"
    
    # Verify request status is now FLAGGED
    get_response = client.get(
        f"/requests/{request_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert get_response.json()["status"] == "FLAGGED"


def test_get_flagged_content(client, test_admin_user, test_student_user, test_donor_user):
    """Test admin getting flagged content"""
    admin_token = test_admin_user["token"]
    student_token = test_student_user["token"]
    donor_token = test_donor_user["token"]
    
    # Create and flag a request
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
            "description": "Flagged request",
            "availability": "Evenings",
            "frequency": "One-time",
            "urgency": "NORMAL"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    request_id = create_response.json()["id"]
    
    client.post(
        "/flags",
        json={
            "item_id": request_id,
            "item_type": "REQUEST",
            "reason": "Test flag",
            "description": "Testing flagging"
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    
    # Admin gets all flags
    response = client.get(
        "/admin/flags",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["item_id"] == request_id


def test_dismiss_flag(client, test_admin_user, test_student_user, test_donor_user):
    """Test admin dismissing a flag"""
    admin_token = test_admin_user["token"]
    student_token = test_student_user["token"]
    donor_token = test_donor_user["token"]
    
    # Create and flag a request
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
            "description": "Request to dismiss flag",
            "availability": "Evenings",
            "frequency": "One-time",
            "urgency": "NORMAL"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    request_id = create_response.json()["id"]
    
    flag_response = client.post(
        "/flags",
        json={
            "item_id": request_id,
            "item_type": "REQUEST",
            "reason": "False flag",
            "description": "This is fine"
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    flag_id = flag_response.json()["id"]
    
    # Admin dismisses the flag
    dismiss_response = client.post(
        f"/admin/flags/{flag_id}/dismiss",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert dismiss_response.status_code == status.HTTP_200_OK
    
    # Verify request status is restored to OPEN
    get_response = client.get(
        f"/requests/{request_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert get_response.json()["status"] == "OPEN"


def test_delete_flagged_content(client, test_admin_user, test_student_user, test_donor_user):
    """Test admin deleting flagged content"""
    admin_token = test_admin_user["token"]
    student_token = test_student_user["token"]
    donor_token = test_donor_user["token"]
    
    # Create and flag a request
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
            "description": "Request to be deleted",
            "availability": "Evenings",
            "frequency": "One-time",
            "urgency": "NORMAL"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    request_id = create_response.json()["id"]
    
    flag_response = client.post(
        "/flags",
        json={
            "item_id": request_id,
            "item_type": "REQUEST",
            "reason": "Severe violation",
            "description": "Delete this"
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    flag_id = flag_response.json()["id"]
    
    # Admin deletes the content
    delete_response = client.delete(
        f"/admin/flags/{flag_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify request is deleted
    get_response = client.get(
        f"/requests/{request_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

