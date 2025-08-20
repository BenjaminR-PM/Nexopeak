from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
import logging
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth import UserCreate, UserLogin, Token, GoogleOAuthRequest
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()
auth_service = AuthService()

@router.post("/register", response_model=dict)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and organization."""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # Create organization
        org = Organization(
            name=user_data.organization_name,
            slug=user_data.organization_name.lower().replace(" ", "-"),
            industry=user_data.industry,
            size=user_data.size
        )
        db.add(org)
        db.flush()  # Get the org ID

        # Create user
        user = User(
            org_id=org.id,
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            password_hash=get_password_hash(user_data.password),
            role="admin"  # First user is admin
        )
        db.add(user)
        db.commit()

        logger.info(f"New user registered: {user.email} for organization: {org.name}")
        
        return {
            "message": "User registered successfully",
            "user_id": str(user.id),
            "org_id": str(org.id)
        }
    except Exception as e:
        db.rollback()
        logger.error(f"User registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with email and password."""
    try:
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )

        # Update last login
        user.last_login_at = func.now()
        db.commit()

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "org_id": str(user.org_id)}
        )

        logger.info(f"User logged in: {user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.full_name,
                "role": user.role,
                "org_id": str(user.org_id)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )

@router.post("/google/oauth")
async def google_oauth(request: GoogleOAuthRequest, db: Session = Depends(get_db)):
    """Handle Google OAuth authentication."""
    try:
        # Verify Google ID token
        user_info = await auth_service.verify_google_token(request.id_token)
        
        # Check if user exists
        user = db.query(User).filter(User.email == user_info["email"]).first()
        
        if not user:
            # Create new user and organization
            org = Organization(
                name=user_info.get("organization", "My Organization"),
                slug=user_info.get("organization", "my-organization").lower().replace(" ", "-")
            )
            db.add(org)
            db.flush()

            user = User(
                org_id=org.id,
                email=user_info["email"],
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", ""),
                role="admin",
                is_verified=True
            )
            db.add(user)
            db.commit()

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "org_id": str(user.org_id)}
        )

        logger.info(f"Google OAuth successful for user: {user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.full_name,
                "role": user.role,
                "org_id": str(user.org_id)
            }
        }
    except Exception as e:
        logger.error(f"Google OAuth failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google authentication failed"
        )

@router.post("/refresh")
async def refresh_token(request: Request, db: Session = Depends(get_db)):
    """Refresh access token."""
    try:
        # Extract token from request
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header"
            )
        
        token = auth_header.split(" ")[1]
        # TODO: Implement token refresh logic
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Token refresh not implemented yet"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)."""
    return {"message": "Successfully logged out"}
