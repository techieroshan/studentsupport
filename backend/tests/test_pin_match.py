"""
Tests for match acceptance and PIN verification workflow
"""
import pytest
from fastapi import status
from datetime import datetime, timedelta, timezone


def test_accept_match_offer(client, test_student_user, test_donor_user):
    """Test student accepting a donor's offer"""
    student_token = test_student_user["token"]
    donor_token = test_donor_user["token"]
    
    # Donor creates an offer
    available_until = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    create_response = client.post(
        "/offers",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "description": "Test offer for matching",
            "dietary_tags": ["Vegetarian"],
            "medical_tags": ["None"],
            "available_until": available_until,
            "logistics": ["Pickup (Student travels)"],
            "availability": "Available",
            "frequency": "One-time",
            "is_anonymous": False
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    offer_id = create_response.json()["id"]
    
    # Student accepts the match
    accept_response = client.post(
        f"/chats/matches/{offer_id}/accept",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert accept_response.status_code == status.HTTP_200_OK
    accept_data = accept_response.json()
    assert "thread_id" in accept_data
    assert "completion_pin" in accept_data
    assert len(accept_data["completion_pin"]) == 4
    assert accept_data["status"] == "IN_PROGRESS"
    
    # Verify offer status is IN_PROGRESS
    get_response = client.get(
        f"/offers/{offer_id}",
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    assert get_response.json()["status"] == "IN_PROGRESS"
    assert get_response.json()["completion_pin"] == accept_data["completion_pin"]


def test_verify_pin_success(client, test_student_user, test_donor_user):
    """Test successful PIN verification"""
    student_token = test_student_user["token"]
    donor_token = test_donor_user["token"]
    
    # Create offer and accept match
    available_until = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    create_response = client.post(
        "/offers",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "description": "Offer for PIN test",
            "dietary_tags": ["Vegetarian"],
            "medical_tags": ["None"],
            "available_until": available_until,
            "logistics": ["Pickup (Student travels)"],
            "availability": "Available",
            "frequency": "One-time",
            "is_anonymous": False
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    offer_id = create_response.json()["id"]
    
    accept_response = client.post(
        f"/chats/matches/{offer_id}/accept",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    completion_pin = accept_response.json()["completion_pin"]
    
    # Donor verifies the PIN
    verify_response = client.post(
        f"/chats/matches/{offer_id}/verify-pin",
        json={"pin": completion_pin},
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    verify_data = verify_response.json()
    assert verify_data["success"] is True
    
    # Verify offer status is CLAIMED
    get_response = client.get(
        f"/offers/{offer_id}",
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    assert get_response.json()["status"] == "CLAIMED"


def test_verify_pin_wrong(client, test_student_user, test_donor_user):
    """Test PIN verification with wrong PIN"""
    student_token = test_student_user["token"]
    donor_token = test_donor_user["token"]
    
    # Create offer and accept match
    available_until = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    create_response = client.post(
        "/offers",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "description": "Offer for wrong PIN test",
            "dietary_tags": ["Vegetarian"],
            "medical_tags": ["None"],
            "available_until": available_until,
            "logistics": ["Pickup (Student travels)"],
            "availability": "Available",
            "frequency": "One-time",
            "is_anonymous": False
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    offer_id = create_response.json()["id"]
    
    client.post(
        f"/chats/matches/{offer_id}/accept",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    # Try to verify with wrong PIN
    verify_response = client.post(
        f"/chats/matches/{offer_id}/verify-pin",
        json={"pin": "9999"},
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    verify_data = verify_response.json()
    assert verify_data["success"] is False
    assert "Invalid PIN" in verify_data["message"]


def test_chat_thread_creation_on_accept(client, test_student_user, test_donor_user):
    """Test that accepting a match creates a chat thread"""
    student_token = test_student_user["token"]
    donor_token = test_donor_user["token"]
    
    # Create offer
    available_until = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    create_response = client.post(
        "/offers",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "description": "Offer for chat test",
            "dietary_tags": ["Vegetarian"],
            "medical_tags": ["None"],
            "available_until": available_until,
            "logistics": ["Pickup (Student travels)"],
            "availability": "Available",
            "frequency": "One-time",
            "is_anonymous": False
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    offer_id = create_response.json()["id"]
    
    # Accept match
    accept_response = client.post(
        f"/chats/matches/{offer_id}/accept",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    thread_id = accept_response.json()["thread_id"]
    
    # Get chat thread
    thread_response = client.get(
        f"/chats/{thread_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert thread_response.status_code == status.HTTP_200_OK
    thread_data = thread_response.json()
    assert thread_data["id"] == thread_id
    assert thread_data["item_id"] == offer_id
    assert thread_data["item_type"] == "OFFER"
    assert thread_data["status"] == "IN_PROGRESS"


def test_send_message(client, test_student_user, test_donor_user):
    """Test sending a message in a chat thread"""
    student_token = test_student_user["token"]
    donor_token = test_donor_user["token"]
    
    # Create offer and accept match
    available_until = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    create_response = client.post(
        "/offers",
        json={
            "city": "San Jose",
            "state": "CA",
            "zip": "95112",
            "country": "United States",
            "description": "Offer for messaging",
            "dietary_tags": ["Vegetarian"],
            "medical_tags": ["None"],
            "available_until": available_until,
            "logistics": ["Pickup (Student travels)"],
            "availability": "Available",
            "frequency": "One-time",
            "is_anonymous": False
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    offer_id = create_response.json()["id"]
    
    accept_response = client.post(
        f"/chats/matches/{offer_id}/accept",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    thread_id = accept_response.json()["thread_id"]
    
    # Send a message
    message_response = client.post(
        f"/chats/{thread_id}/messages",
        json={"text": "Hello, when can I pick this up?"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert message_response.status_code == status.HTTP_201_CREATED
    message_data = message_response.json()
    assert message_data["text"] == "Hello, when can I pick this up?"
    assert "id" in message_data
    assert "timestamp" in message_data

