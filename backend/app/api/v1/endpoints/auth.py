from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, verify_token, get_password_hash, verify_password
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse, GoogleOAuthRequest
from app.services.auth_service import AuthService
from app.services.logging_service import get_logging_service
from app.core.logging_config import LogModule
from typing import Optional
import os

# Google OAuth imports
try:
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token
    from google_auth_oauthlib.flow import Flow
    import secrets
    GOOGLE_OAUTH_AVAILABLE = True
except ImportError:
    GOOGLE_OAUTH_AVAILABLE = False

router = APIRouter()
security = HTTPBearer()
logging_service = get_logging_service()

@router.post("/register", response_model=UserResponse)
async def register(user_create: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        logging_service.logger.info(
            LogModule.AUTH,
            f"Registration attempt for email: {user_create.email}"
        )
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

@router.post("/login", response_model=TokenResponse)
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

@router.post("/demo", response_model=TokenResponse)
async def create_demo_account(db: Session = Depends(get_db)):
    """Create a demo account for testing purposes"""
    try:
        logging_service.log_demo_access()
        logging_service.logger.info(LogModule.DEMO_SYSTEM, "Demo account creation requested")
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

@router.get("/google/config")
async def google_oauth_config():
    """Check Google OAuth configuration"""
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    return {
        "google_oauth_available": GOOGLE_OAUTH_AVAILABLE,
        "client_id_configured": bool(google_client_id),
        "client_secret_configured": bool(google_client_secret),
        "client_id_preview": google_client_id[:10] + "..." if google_client_id else None,
        "redirect_uri": f"{os.getenv('BACKEND_URL', 'https://nexopeak-backend-54c8631fe608.herokuapp.com')}/api/v1/auth/google/callback"
    }

@router.get("/google")
async def google_oauth_redirect():
    """Redirect to Google OAuth authorization URL"""
    try:
        # Check if Google OAuth is available
        if not GOOGLE_OAUTH_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth dependencies not available"
            )
        
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        
        if not google_client_id or not google_client_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )
        
        # For now, create a simple manual Google OAuth URL
        redirect_uri = f"{os.getenv('BACKEND_URL', 'https://nexopeak-backend-54c8631fe608.herokuapp.com')}/api/v1/auth/google/callback"
        
        # Manual Google OAuth URL construction
        authorization_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={google_client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"scope=openid email profile&"
            f"response_type=code&"
            f"access_type=offline&"
            f"include_granted_scopes=true"
        )
        
        # Store state in session (for production, use Redis or database)
        # For now, we'll include it in the redirect
        
        return RedirectResponse(url=authorization_url)
        
    except Exception as e:
        logging_service.logger.error(
            LogModule.AUTH,
            f"Google OAuth redirect error: {str(e)}"
        )
        # Redirect to frontend with error
        frontend_url = os.getenv('FRONTEND_URL', 'https://nexopeak-frontend-d38117672e4d.herokuapp.com')
        return RedirectResponse(url=f"{frontend_url}/auth/login?error=oauth_error")

@router.get("/google/callback")
async def google_oauth_callback(code: str, state: str = None, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        # Check if Google OAuth is available
        if not GOOGLE_OAUTH_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth dependencies not available"
            )
        
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        
        if not google_client_id or not google_client_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )
        
        # Exchange authorization code for access token
        import requests
        
        redirect_uri = f"{os.getenv('BACKEND_URL', 'https://nexopeak-backend-54c8631fe608.herokuapp.com')}/api/v1/auth/google/callback"
        
        # Exchange code for access token
        token_response = requests.post('https://oauth2.googleapis.com/token', data={
            'client_id': google_client_id,
            'client_secret': google_client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        })
        
        if not token_response.ok:
            frontend_url = os.getenv('FRONTEND_URL', 'https://nexopeak-frontend-d38117672e4d.herokuapp.com')
            return RedirectResponse(url=f"{frontend_url}/auth/login?error=token_exchange_failed")
        
        token_data = token_response.json()
        access_token = token_data.get('access_token')
        
        # Get user info from Google
        user_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if not user_response.ok:
            frontend_url = os.getenv('FRONTEND_URL', 'https://nexopeak-frontend-d38117672e4d.herokuapp.com')
            return RedirectResponse(url=f"{frontend_url}/auth/login?error=user_info_failed")
        
        user_info = user_response.json()
        
        # Extract user info
        user_email = user_info.get('email')
        user_name = user_info.get('name', 'Google User')
        
        if not user_email:
            frontend_url = os.getenv('FRONTEND_URL', 'https://nexopeak-frontend-d38117672e4d.herokuapp.com')
            return RedirectResponse(url=f"{frontend_url}/auth/login?error=no_email")
        
        # Check if user exists
        existing_user = AuthService.get_user_by_email(db, user_email)
        
        if existing_user:
            # Generate token for existing user
            access_token = AuthService.create_user_token(existing_user)
        else:
            # Create new user
            # Create organization first
            org = Organization(
                name=f"{user_name}'s Organization",
                domain=user_email.split('@')[1] if '@' in user_email else "gmail.com"
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            
            # Create user
            new_user = User(
                email=user_email,
                name=user_name,
                password_hash="",  # No password for OAuth users
                role="user",
                is_active=True,
                org_id=org.id
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            # Generate token for new user
            access_token = AuthService.create_user_token(new_user)
        
        # Redirect to frontend with token
        frontend_url = os.getenv('FRONTEND_URL', 'https://nexopeak-frontend-d38117672e4d.herokuapp.com')
        return RedirectResponse(url=f"{frontend_url}/auth/login?token={access_token}")
        
    except Exception as e:
        logging_service.logger.error(
            LogModule.AUTH,
            f"Google OAuth callback error: {str(e)}"
        )
        # Redirect to frontend with error
        frontend_url = os.getenv('FRONTEND_URL', 'https://nexopeak-frontend-d38117672e4d.herokuapp.com')
        return RedirectResponse(url=f"{frontend_url}/auth/login?error=oauth_callback_error")

@router.post("/google", response_model=TokenResponse)
async def google_oauth(oauth_request: GoogleOAuthRequest, db: Session = Depends(get_db)):
    """Handle Google OAuth sign-in"""
    try:
        # Check if Google OAuth is available
        if not GOOGLE_OAUTH_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth dependencies not available"
            )
        
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not google_client_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )
        
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                oauth_request.id_token, 
                google_requests.Request(), 
                google_client_id
            )
            
            # Extract user info from verified token
            user_email = idinfo.get('email')
            user_name = idinfo.get('name', 'Google User')
            
            if not user_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email not provided by Google"
                )
            
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

@router.get("/me", response_model=UserResponse)
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
