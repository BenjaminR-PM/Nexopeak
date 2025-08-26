from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database engine
# For development, use SQLite by default
# Handle Heroku's postgres:// URL format
database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

if database_url.startswith("postgresql://"):
    try:
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False,  # Set to True for SQL query logging
        )
        # Test the connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("PostgreSQL database connection successful")
    except Exception as e:
        logger.error(f"PostgreSQL connection failed: {e}")
        logger.info("Falling back to SQLite for development")
        # Fallback to SQLite for development
        engine = create_engine(
            "sqlite:///./nexopeak.db",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
        logger.info("Using SQLite fallback database")
else:
    # Use SQLite or other databases directly
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
        poolclass=StaticPool if "sqlite" in settings.DATABASE_URL else None,
        echo=False,
    )
    logger.info(f"Database engine created for: {settings.DATABASE_URL}")

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test database connection
def test_db_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            logger.info("Database connection test successful")
            return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

# Create all tables
def create_tables():
    try:
        # Import models to ensure they're registered
        from app.models.user import User
        from app.models.organization import Organization
        from app.models.connection import Connection
        from app.models.campaign import Campaign, CampaignAnalysis
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        return False
