# StudentSupport Backend

FastAPI backend for the StudentSupport application.

## Setup

1. Create virtual environment (if not already created):
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run database migrations:
   ```bash
   alembic upgrade head
   ```

4. Seed the database with demo users:
   ```bash
   python -m app.seed
   ```

## Running the Server

```bash
# Option 1: Use the startup script
./run.sh

# Option 2: Use uvicorn directly
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`

## Demo Users

After seeding, you can use these accounts:

- **Admin**: `admin@newabilities.org` / `password`
- **Student**: `student@university.edu` / `password`
- **Donor**: `donor@gmail.com` / `password`

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./studentsupport.db
SECRET_KEY=your-secret-key-change-in-production-min-32-chars
```

For PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost/studentsupport
```

## Database

By default, the app uses SQLite (`studentsupport.db`). For production, use PostgreSQL by setting the `DATABASE_URL` environment variable.

