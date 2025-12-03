from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, students, requests, offers, chats, admin, donor_partners, flags, ratings

app = FastAPI(title="StudentSupport API", version="0.1.0")

# CORS configuration - must be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(requests.router)
app.include_router(offers.router)
app.include_router(chats.router)
app.include_router(admin.router)
app.include_router(donor_partners.router)
app.include_router(flags.router)
app.include_router(ratings.router)


@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok"}


