"""Main FastAPI application for Student Support."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Import database and models
from database import init_db
from routes import auth, users, requests, offers, donors, seo

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown."""
    # Startup
    logger.info("Starting up Student Support API...")
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Student Support API...")


# Create FastAPI app
app = FastAPI(
    title="Student Support API",
    description="Global community-driven platform for student food assistance",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.getenv('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(requests.router, prefix="/api")
app.include_router(offers.router, prefix="/api")
app.include_router(donors.router, prefix="/api")
app.include_router(seo.router)  # SEO routes at root level


# Root endpoint
@app.get("/api")
async def root():
    """Root API endpoint."""
    return {
        "message": "Student Support API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/api/docs"
    }


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Student Support API"
    }


# Custom 404 handler
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    """Custom 404 error handler."""
    # If it's an API request, return JSON
    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=404,
            content={
                "detail": "Not found",
                "path": request.url.path
            }
        )
    
    # For non-API requests, return HTML 404 page
    app_domain = os.getenv("APP_DOMAIN", "studentsupport.newabilities.org")
    org_name = os.getenv("ORG_NAME", "New Abilities Foundation")
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Page Not Found | Student Support</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1f2937;
            }}
            .container {{
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 600px;
                text-align: center;
            }}
            h1 {{
                font-size: 6rem;
                color: #0d9488;
                margin-bottom: 1rem;
                font-weight: 800;
            }}
            h2 {{
                font-size: 1.5rem;
                color: #374151;
                margin-bottom: 1rem;
            }}
            p {{
                color: #6b7280;
                line-height: 1.6;
                margin-bottom: 2rem;
            }}
            .links {{
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }}
            a {{
                display: inline-block;
                padding: 0.75rem 1.5rem;
                background: #0d9488;
                color: white;
                text-decoration: none;
                border-radius: 0.5rem;
                font-weight: 600;
                transition: all 0.3s ease;
            }}
            a:hover {{
                background: #0f766e;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4);
            }}
            a.secondary {{
                background: #e5e7eb;
                color: #374151;
            }}
            a.secondary:hover {{
                background: #d1d5db;
            }}
            .icon {{
                font-size: 5rem;
                margin-bottom: 1rem;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🍽️</div>
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>Sorry, we couldn't find the page you're looking for. The link might be broken or the page may have been moved.</p>
            <div class="links">
                <a href="https://{app_domain}">Go Home</a>
                <a href="https://{app_domain}/browse" class="secondary">Browse Meals</a>
                <a href="https://{app_domain}/how-it-works" class="secondary">How It Works</a>
            </div>
            <p style="margin-top: 2rem; font-size: 0.875rem; color: #9ca3af;">
                {org_name}
            </p>
        </div>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content, status_code=404)


# Custom 500 handler
@app.exception_handler(500)
async def custom_500_handler(request: Request, exc):
    """Custom 500 error handler."""
    logger.error(f"Internal server error: {exc}")
    
    org_contact_url = os.getenv("ORG_CONTACT_URL", "https://newabilities.org/contact")
    org_name = os.getenv("ORG_NAME", "New Abilities Foundation")
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>500 - Server Error | Student Support</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1f2937;
            }}
            .container {{
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 600px;
                text-align: center;
            }}
            h1 {{
                font-size: 6rem;
                color: #ef4444;
                margin-bottom: 1rem;
                font-weight: 800;
            }}
            h2 {{
                font-size: 1.5rem;
                color: #374151;
                margin-bottom: 1rem;
            }}
            p {{
                color: #6b7280;
                line-height: 1.6;
                margin-bottom: 2rem;
            }}
            a {{
                display: inline-block;
                padding: 0.75rem 1.5rem;
                background: #0d9488;
                color: white;
                text-decoration: none;
                border-radius: 0.5rem;
                font-weight: 600;
                transition: all 0.3s ease;
                margin: 0.5rem;
            }}
            a:hover {{
                background: #0f766e;
                transform: translateY(-2px);
            }}
            .icon {{
                font-size: 5rem;
                margin-bottom: 1rem;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">⚠️</div>
            <h1>500</h1>
            <h2>Internal Server Error</h2>
            <p>We're sorry, but something went wrong on our end. Our team has been notified and is working to fix the issue.</p>
            <p>Please try again in a few moments. If the problem persists, please contact our support team.</p>
            <a href="{org_contact_url}">Contact Support</a>
            <p style="margin-top: 2rem; font-size: 0.875rem; color: #9ca3af;">
                {org_name}
            </p>
        </div>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content, status_code=500)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
