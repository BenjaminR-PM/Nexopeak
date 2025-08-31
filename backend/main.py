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
from app.core.logging_config import setup_request_logging, LogModule
from app.services.logging_service import get_logging_service
from app.api.v1.api import api_router
from app.core.security import verify_token

# Load environment variables
load_dotenv()

# Initialize logging
logging_service = get_logging_service()

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logging_service.log_system_startup("Nexopeak API", "1.0.0")
    logging_service.log_database_connection("PostgreSQL", "initializing")
    
    # Create database tables
    create_tables()
    
    logging_service.log_system_startup("Database tables", "created")
    yield
    
    # Shutdown
    logging_service.log_system_shutdown("Nexopeak API")

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

# Request logging middleware
app.add_middleware(setup_request_logging())

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
