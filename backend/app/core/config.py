from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Nexopeak API"
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 240  # 4 hours instead of 30 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30     # 30 days for refresh tokens
    REMEMBER_ME_EXPIRE_DAYS: int = 90       # 90 days for "Remember Me" option
    SESSION_ACTIVITY_TIMEOUT_MINUTES: int = 60  # Extend session by 1 hour with activity
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/nexopeak"
    
    # Google APIs
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"
    
    # Google Cloud
    GOOGLE_CLOUD_PROJECT: str = ""
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    
    # BigQuery
    BIGQUERY_DATASET: str = "nexopeak"
    BIGQUERY_LOCATION: str = "US"
    
    # Redis (for Celery)
    REDIS_URL: str = "redis://localhost:6379"
    
    # Email
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@nexopeak.com"
    
    # Slack
    SLACK_BOT_TOKEN: str = ""
    SLACK_SIGNING_SECRET: str = ""
    
    # ETL Settings
    ETL_BATCH_SIZE: int = 1000
    ETL_MAX_RETRIES: int = 3
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Override with environment variables if they exist
if os.getenv("SECRET_KEY"):
    settings.SECRET_KEY = os.getenv("SECRET_KEY")
if os.getenv("DATABASE_URL"):
    settings.DATABASE_URL = os.getenv("DATABASE_URL")
if os.getenv("GOOGLE_CLIENT_ID"):
    settings.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
if os.getenv("GOOGLE_CLIENT_SECRET"):
    settings.GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
if os.getenv("GOOGLE_CLOUD_PROJECT"):
    settings.GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
if os.getenv("REDIS_URL"):
    settings.REDIS_URL = os.getenv("REDIS_URL")
if os.getenv("SENDGRID_API_KEY"):
    settings.SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
if os.getenv("SLACK_BOT_TOKEN"):
    settings.SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
