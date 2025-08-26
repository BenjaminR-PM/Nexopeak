from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv
import os
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine, Base, get_db, create_tables
from app.api.v1.api import api_router
from app.core.security import verify_token

# Load environment variables
load_dotenv()

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Nexopeak API...")
    # Create database tables
    create_tables()
    yield
    # Shutdown
    print("Shutting down Nexopeak API...")

app = FastAPI(
    title="Nexopeak API",
    description="Digital Marketing Analytics Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency for authentication
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = verify_token(credentials.credentials)
        return payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Nexopeak API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Nexopeak API is running"
    }

@app.get("/test-db")
async def test_database():
    from app.core.database import test_db_connection
    db_status = test_db_connection()
    if db_status:
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Database connection successful"
        }
    else:
        return {
            "status": "unhealthy",
            "database": "error",
            "message": "Database connection failed"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
