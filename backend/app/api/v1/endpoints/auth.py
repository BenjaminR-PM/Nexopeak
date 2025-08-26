from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, verify_token, get_password_hash, verify_password
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import AuthService
from typing import Optional

router = APIRouter()
security = HTTPBearer()

@router.post("/auth/register", response_model=UserResponse)
async def register(user_create: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = AuthService.get_user_by_email(db, user_create.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create organization if org_id is not provided
        if not user_create.org_id:
            org = Organization(
                name=f"{user_create.name}'s Organization",
                domain=user_create.email.split('@')[1] if '@' in user_create.email else "demo.com"
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            user_create.org_id = org.id
        
        # Create user
        user = AuthService.create_user(db, user_create)
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            org_id=user.org_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/auth/login", response_model=TokenResponse)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    try:
        user = AuthService.authenticate_user(db, user_login.email, user_login.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        access_token = AuthService.create_user_token(user)
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                role=user.role,
                org_id=user.org_id
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/auth/demo", response_model=TokenResponse)
async def create_demo_account(db: Session = Depends(get_db)):
    """Create a demo account for testing purposes"""
    try:
        # Check if demo user already exists
        demo_email = "demo@nexopeak.com"
        existing_user = AuthService.get_user_by_email(db, demo_email)
        
        if existing_user:
            # Return existing demo user token
            access_token = AuthService.create_user_token(existing_user)
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse(
                    id=existing_user.id,
                    email=existing_user.email,
                    name=existing_user.name,
                    role=existing_user.role,
                    org_id=existing_user.org_id
                )
            )
        
        # Create demo organization
        demo_org = Organization(
            name="Demo Organization",
            domain="nexopeak.com"
        )
        db.add(demo_org)
        db.commit()
        db.refresh(demo_org)
        
        # Create demo user
        demo_user = User(
            email=demo_email,
            name="Demo User",
            hashed_password=get_password_hash("demo123"),
            role="admin",
            org_id=demo_org.id
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        # Return demo user token
        access_token = AuthService.create_user_token(demo_user)
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=demo_user.id,
                email=demo_user.email,
                name=demo_user.name,
                role=demo_user.role,
                org_id=demo_user.org_id
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Demo account creation failed: {str(e)}"
        )

@router.post("/auth/google", response_model=TokenResponse)
async def google_oauth(oauth_request: GoogleOAuthRequest, db: Session = Depends(get_db)):
    """Handle Google OAuth sign-in"""
    try:
        # For demo purposes, we'll extract basic info from a mock token
        # In production, you'd verify the Google ID token
        import base64
        import json
        
        # Mock token validation - in production use google.auth.transport.requests
        try:
            # For demo, we'll create a user based on a simple pattern
            user_email = f"google.user+{oauth_request.id_token[:8]}@gmail.com"
            user_name = f"Google User {oauth_request.id_token[:8]}"
            
            # Check if user exists
            existing_user = AuthService.get_user_by_email(db, user_email)
            
            if existing_user:
                # Return existing user token
                access_token = AuthService.create_user_token(existing_user)
                return TokenResponse(
                    access_token=access_token,
                    token_type="bearer",
                    user=UserResponse(
                        id=existing_user.id,
                        email=existing_user.email,
                        name=existing_user.name,
                        role=existing_user.role,
                        org_id=existing_user.org_id
                    )
                )
            
            # Create new organization for Google user
            org = Organization(
                name=f"{user_name}'s Organization",
                domain="gmail.com"
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            
            # Create new Google user (no password needed)
            google_user = User(
                email=user_email,
                name=user_name,
                hashed_password=None,  # No password for OAuth users
                role="user",
                org_id=org.id,
                is_verified=True  # Google users are pre-verified
            )
            db.add(google_user)
            db.commit()
            db.refresh(google_user)
            
            access_token = AuthService.create_user_token(google_user)
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse(
                    id=google_user.id,
                    email=google_user.email,
                    name=google_user.name,
                    role=google_user.role,
                    org_id=google_user.org_id
                )
            )
            
        except Exception as token_error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google token"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth failed: {str(e)}"
        )

@router.get("/auth/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user information"""
    try:
        payload = verify_token(credentials.credentials)
        user = AuthService.get_user_by_email(db, payload.get("sub"))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            org_id=user.org_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
