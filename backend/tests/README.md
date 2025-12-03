# Backend API Tests

This directory contains pytest tests for the StudentSupport API backend.

## Running Tests

From the `backend/` directory:

```bash
# Activate virtual environment
source .venv/bin/activate

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run a specific test file
pytest tests/test_auth.py

# Run a specific test
pytest tests/test_auth.py::test_register_student

# Run with coverage (if pytest-cov is installed)
pytest --cov=app --cov-report=html
```

## Test Coverage

The test suite covers:

1. **Authentication** (`test_auth.py`):
   - User registration (student and donor)
   - Login and token generation
   - Getting current user info
   - Duplicate email handling
   - Unauthorized access

2. **Requests and Offers** (`test_requests_offers.py`):
   - Creating meal requests
   - Creating meal offers
   - Getting all requests/offers
   - Getting user's own requests/offers
   - Updating request status (pause/resume)
   - Deleting requests

3. **Flagging and Moderation** (`test_flagging.py`):
   - Flagging requests/offers
   - Admin viewing flagged content
   - Admin dismissing flags
   - Admin deleting flagged content

4. **Match and PIN Workflow** (`test_pin_match.py`):
   - Accepting matches
   - PIN generation
   - PIN verification (success and failure)
   - Chat thread creation on match acceptance
   - Sending messages in chat threads

## Test Fixtures

The `conftest.py` file provides:
- `client`: TestClient instance with database override
- `db`: Database session for each test
- `test_student_user`: Pre-created student user with auth token
- `test_donor_user`: Pre-created donor user with auth token
- `test_admin_user`: Pre-created admin user with auth token

## Test Database

Tests use an in-memory SQLite database that is created fresh for each test and torn down afterward. This ensures test isolation.

