"""Pytest configuration and fixtures."""
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from database import Base, get_db
from server import app
from models import User, Donor, DonorCategory, DonorTier
from auth import get_password_hash

# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/studentsupport_test"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True
)

# Create test session factory
test_session_maker = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function", autouse=False)
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database for each test."""
    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async with test_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
    
    # Drop all tables after test
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client with database dependency override."""
    from httpx import ASGITransport
    
    async def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(test_db: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        email="testuser@example.com",
        password_hash=get_password_hash("testpassword123"),
        display_name="Test User",
        role="SEEKER",
        city="San Francisco",
        state="CA",
        zip_code="94102",
        country="USA",
        email_verified=True,
        verification_status="VERIFIED",
        preferences=["Vegetarian", "Gluten Free"],
        languages=["English", "Spanish"]
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    return user


@pytest.fixture
async def test_donor_user(test_db: AsyncSession) -> User:
    """Create a test donor user."""
    donor = User(
        email="donor@example.com",
        password_hash=get_password_hash("donorpassword123"),
        display_name="Test Donor",
        role="DONOR",
        city="San Francisco",
        state="CA",
        zip_code="94102",
        country="USA",
        email_verified=True,
        verification_status="VERIFIED",
        languages=["English"]
    )
    test_db.add(donor)
    await test_db.commit()
    await test_db.refresh(donor)
    return donor


@pytest.fixture
async def test_admin_user(test_db: AsyncSession) -> User:
    """Create a test admin user."""
    admin = User(
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword123"),
        display_name="Test Admin",
        role="ADMIN",
        city="San Francisco",
        state="CA",
        zip_code="94102",
        country="USA",
        email_verified=True,
        verification_status="VERIFIED",
        languages=["English"]
    )
    test_db.add(admin)
    await test_db.commit()
    await test_db.refresh(admin)
    return admin


@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: User) -> dict:
    """Get authentication headers for test user."""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def donor_auth_headers(client: AsyncClient, test_donor_user: User) -> dict:
    """Get authentication headers for donor user."""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "donor@example.com",
            "password": "donorpassword123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def seed_donors(test_db: AsyncSession):
    """Seed test donors."""
    donors = [
        Donor(
            id="d1",
            name="Test Foundation",
            category=DonorCategory.NON_PROFIT,
            tier=DonorTier.PLATINUM,
            total_contribution_display="$15,000+",
            is_anonymous=False,
            location="Chicago, IL",
            since="2023"
        ),
        Donor(
            id="d2",
            name="Test Temple",
            category=DonorCategory.RELIGIOUS,
            tier=DonorTier.GOLD,
            total_contribution_display="10,000 Meals",
            is_anonymous=False,
            location="Cary, NC",
            since="2024"
        )
    ]
    
    for donor in donors:
        test_db.add(donor)
    
    await test_db.commit()
    return donors
