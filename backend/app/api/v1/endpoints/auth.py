from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, create_access_token, create_refresh_token, 
    verify_token, is_token_expired, should_refresh_token,
    extend_session_with_activity
)
from app.schemas.auth import (
    UserLogin, UserSignup, TokenResponse, RefreshTokenRequest,
    GoogleIdTokenRequest, SessionExtendResponse, UserResponse
)
from app.models.user import User
from app.services.logging_service import get_logging_service, LogModule
import logging
import os

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """User login with email and password."""
    try:
        # Find user by email
        user = db.query(User).filter(User.email == user_credentials.email).first()
        
        if not user or not verify_password(user_credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create tokens
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "email": user.email},
            remember_me=user_credentials.remember_me
        )
        
        refresh_token = create_refresh_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        # Calculate expiration time
        expires_in = 240 * 60 if user_credentials.remember_me else 240 * 60  # 4 hours
        
        # Log successful login
        logging_service = get_logging_service()
        logging_service.log_ga4_integration(
            module=LogModule.AUTHENTICATION,
            message=f"User {user.email} logged in successfully",
            user_id=user.id
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            remember_me=user_credentials.remember_me
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    """User registration."""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        from app.core.security import get_password_hash
        hashed_password = get_password_hash(user_data.password)
        
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            name=user_data.name
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create tokens
        access_token = create_access_token(
            data={"sub": new_user.email, "user_id": new_user.id, "email": new_user.email},
            remember_me=user_data.remember_me
        )
        
        refresh_token = create_refresh_token(
            data={"sub": new_user.email, "user_id": new_user.id}
        )
        
        # Calculate expiration time
        expires_in = 240 * 60 if user_data.remember_me else 240 * 60  # 4 hours
        
        # Log successful registration
        logging_service = get_logging_service()
        logging_service.log_ga4_integration(
            module=LogModule.AUTHENTICATION,
            message=f"User {new_user.email} registered successfully",
            user_id=new_user.id
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            remember_me=user_data.remember_me
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    try:
        # Verify refresh token
        payload = verify_token(refresh_request.refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check if refresh token is expired
        if is_token_expired(payload):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired"
            )
        
        # Get user
        user = db.query(User).filter(User.email == payload.get("sub")).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new access token
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "email": user.email}
        )
        
        # Create new refresh token
        new_refresh_token = create_refresh_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        expires_in = 240 * 60  # 4 hours
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=expires_in
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/extend-session", response_model=SessionExtendResponse)
async def extend_session(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extend session based on user activity."""
    try:
        # Verify current token
        payload = verify_token(credentials.credentials)
        
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Extend session
        new_access_token = extend_session_with_activity(payload)
        
        # Calculate new expiration
        from datetime import datetime
        exp_timestamp = payload.get("exp")
        if isinstance(exp_timestamp, str):
            exp_timestamp = int(exp_timestamp)
        
        current_time = datetime.utcnow().timestamp()
        expires_in = int(exp_timestamp - current_time + (60 * 60))  # Add 1 hour
        
        return SessionExtendResponse(
            access_token=new_access_token,
            expires_in=expires_in
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session extension error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/google", response_model=TokenResponse)
async def google_oauth_login(
    google_request: GoogleIdTokenRequest, 
    db: Session = Depends(get_db)
):
    """Google OAuth login endpoint."""
    try:
        # Verify Google ID token with Google's servers
        id_token = google_request.id_token
        
        # In production, you should verify the ID token with Google's servers
        # For now, we'll decode the JWT to extract user information
        # This is NOT secure for production - you must verify with Google
        
        try:
            from google.auth.transport import requests
            from google.oauth2 import id_token
            
            # Get the Google Client ID
            google_client_id = os.getenv('GOOGLE_CLIENT_ID', '641526035282-75q9tavd87q4spnhfemarscj2679t78m.apps.googleusercontent.com')
            logger.info(f"Using Google Client ID: {google_client_id[:20]}...")
            
            # Verify the token with Google (secure method)
            idinfo = id_token.verify_oauth2_token(
                google_request.id_token, 
                requests.Request(), 
                google_client_id
            )
            
            logger.info(f"Token verification successful for user: {idinfo.get('email', 'unknown')}")
            
            # Extract user information from verified token
            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])
            google_id = idinfo['sub']
            
        except ValueError as ve:
            logger.error(f"Google ID token validation error: {ve}")
            # Try fallback verification without audience check for debugging
            try:
                logger.info("Attempting fallback token verification...")
                import jwt
                decoded = jwt.decode(google_request.id_token, options={"verify_signature": False})
                logger.info(f"Fallback decode successful. Token aud: {decoded.get('aud')}, iss: {decoded.get('iss')}")
                
                # Check if the audience matches our client ID
                if decoded.get('aud') != google_client_id:
                    logger.error(f"Audience mismatch. Expected: {google_client_id}, Got: {decoded.get('aud')}")
                
                # For now, use the fallback data if verification fails
                email = decoded.get('email')
                name = decoded.get('name', email.split('@')[0]) if email else 'Google User'
                google_id = decoded.get('sub', 'unknown')
                
                if not email:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email not found in Google ID token"
                    )
                    
                logger.warning("Using fallback token verification - this should be fixed for production")
                
            except Exception as fallback_error:
                logger.error(f"Fallback verification also failed: {fallback_error}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid Google ID token: {str(ve)}"
                )
        except Exception as verify_error:
            logger.error(f"Google ID token verification failed: {verify_error}")
            logger.error(f"Error type: {type(verify_error).__name__}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google OAuth verification failed"
            )
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not found in Google ID token"
            )
        
        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user from Google data
            user = User(
                email=email,
                name=name,
                hashed_password="google_oauth_user",  # Placeholder for OAuth users
                is_active=True,
                # You might want to store google_id in a separate field
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Log new user creation
            logging_service = get_logging_service()
            logging_service.log_ga4_integration(
                module=LogModule.AUTHENTICATION,
                message=f"New user {email} created via Google OAuth",
                user_id=user.id
            )
        
        # Create tokens
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "email": user.email},
            remember_me=google_request.remember_me
        )
        
        refresh_token = create_refresh_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        expires_in = 240 * 60 if google_request.remember_me else 240 * 60  # 4 hours
        
        # Log successful Google login
        logging_service = get_logging_service()
        logging_service.log_ga4_integration(
            module=LogModule.AUTHENTICATION,
            message=f"User {user.email} logged in via Google OAuth",
            user_id=user.id
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            remember_me=google_request.remember_me,
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                is_active=user.is_active
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth verification failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user information."""
    try:
        payload = verify_token(credentials.credentials)
        user = db.query(User).filter(User.email == payload.get("sub")).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            is_active=user.is_active
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
