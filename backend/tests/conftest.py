"""
Pytest configuration and fixtures for API tests
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

from app.database import Base, get_db
from app.main import app

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with database override"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_student_user(client, db):
    """Create a test student user and return auth token"""
    from app.models import User
    from app.schemas import UserRole
    import uuid
    import bcrypt
    
    # Hash password using bcrypt directly
    password_bytes = "testpass123".encode('utf-8')
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    user = User(
        id=str(uuid.uuid4()),
        email="teststudent@university.edu",
        password_hash=password_hash,
        role=UserRole.SEEKER,
        display_name="Test Student",
        city="San Jose",
        state="CA",
        zip="95112",
        country="United States",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Login to get token
    response = client.post("/auth/login", json={
        "email": "teststudent@university.edu",
        "password": "testpass123"
    })
    token = response.json()["access_token"]
    return {"user": user, "token": token}


@pytest.fixture
def test_donor_user(client, db):
    """Create a test donor user and return auth token"""
    from app.models import User
    from app.schemas import UserRole
    import uuid
    import bcrypt
    
    # Hash password using bcrypt directly
    password_bytes = "testpass123".encode('utf-8')
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    user = User(
        id=str(uuid.uuid4()),
        email="testdonor@gmail.com",
        password_hash=password_hash,
        role=UserRole.DONOR,
        display_name="Test Donor",
        city="San Jose",
        state="CA",
        zip="95112",
        country="United States",
        email_verified=True,
        weekly_meal_limit=5,
        current_weekly_meals=0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Login to get token
    response = client.post("/auth/login", json={
        "email": "testdonor@gmail.com",
        "password": "testpass123"
    })
    token = response.json()["access_token"]
    return {"user": user, "token": token}


@pytest.fixture
def test_admin_user(client, db):
    """Create a test admin user and return auth token"""
    from app.models import User
    from app.schemas import UserRole
    import uuid
    import bcrypt
    
    # Hash password using bcrypt directly
    password_bytes = "adminpass123".encode('utf-8')
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    user = User(
        id=str(uuid.uuid4()),
        email="admin@test.org",
        password_hash=password_hash,
        role=UserRole.ADMIN,
        display_name="Admin User",
        city="San Jose",
        state="CA",
        zip="95112",
        country="United States",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Login to get token
    response = client.post("/auth/login", json={
        "email": "admin@test.org",
        "password": "adminpass123"
    })
    token = response.json()["access_token"]
    return {"user": user, "token": token}

