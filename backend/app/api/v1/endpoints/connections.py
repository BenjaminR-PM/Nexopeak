from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import secrets
from urllib.parse import urlencode

from app.core.database import get_db
from app.models.user import User
from app.models.connection import Connection
from app.models.organization import Organization
from app.services.auth_service import AuthService
from app.core.security import verify_token
from app.core.logging_config import get_logging_service, LogModule

# Google Analytics imports
try:
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token
    from google_auth_oauthlib.flow import Flow
    import secrets
    GOOGLE_ANALYTICS_AVAILABLE = True
except ImportError:
    GOOGLE_ANALYTICS_AVAILABLE = False

router = APIRouter()
security = HTTPBearer()
logging_service = get_logging_service()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user."""
    try:
        payload = verify_token(credentials.credentials)
        user = AuthService.get_user_by_email(db, payload.get("sub"))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

@router.get("/connections")
async def get_connections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's connections"""
    try:
        connections = db.query(Connection).filter(
            Connection.user_id == current_user.id
        ).all()
        
        connection_list = []
        for conn in connections:
            connection_list.append({
                "id": conn.id,
                "name": conn.name,
                "provider": conn.provider,
                "status": conn.status,
                "external_id": conn.external_id,
                "created_at": conn.created_at,
                "last_sync": conn.last_sync,
                "next_sync": conn.next_sync
            })
        
        return {"connections": connection_list}
        
    except Exception as e:
        logging_service.log_error(
            module=LogModule.ANALYTICS,
            message=f"Failed to fetch connections for user {current_user.id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch connections"
        )

@router.get("/google-analytics/auth")
async def google_analytics_auth_redirect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Redirect to Google Analytics OAuth authorization URL"""
    try:
        # Check if Google Analytics is available
        if not GOOGLE_ANALYTICS_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google Analytics integration not available"
            )
        
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        
        if not google_client_id or not google_client_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google Analytics OAuth not configured"
            )
        
        # Create OAuth flow with Analytics scopes
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": google_client_id,
                    "client_secret": google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [f"{os.getenv('BACKEND_URL', 'https://nexopeak-backend-54c8631fe608.herokuapp.com')}/api/v1/connections/google-analytics/callback"]
                }
            },
            scopes=[
                'https://www.googleapis.com/auth/analytics.readonly',
                'https://www.googleapis.com/auth/analytics.manage.users.readonly',
                'openid',
                'email',
                'profile'
            ]
        )
        
        # Set redirect URI
        flow.redirect_uri = f"{os.getenv('BACKEND_URL', 'https://nexopeak-backend-54c8631fe608.herokuapp.com')}/api/v1/connections/google-analytics/callback"
        
        # Generate state parameter with user ID for security
        state = f"{current_user.id}:{secrets.token_urlsafe(32)}"
        
        # Generate authorization URL
        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=state
        )
        
        logging_service.log_info(
            module=LogModule.GA4_INTEGRATION,
            message=f"User {current_user.email} initiated Google Analytics OAuth",
            user_id=current_user.id
        )
        
        # Return JSON response with redirect URL instead of direct redirect
        return {
            "redirect_url": authorization_url,
            "message": "Google Analytics OAuth initiated successfully"
        }
        
    except Exception as e:
        logging_service.log_error(
            module=LogModule.GA4_INTEGRATION,
            message=f"Failed to initiate Google Analytics OAuth for user {current_user.id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate Google Analytics connection"
        )

@router.get("/google-analytics/callback")
async def google_analytics_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """Handle Google Analytics OAuth callback"""
    try:
        # Verify state parameter
        if ':' not in state:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid state parameter"
            )
        
        user_id, _ = state.split(':', 1)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user in state parameter"
            )
        
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        
        # Create OAuth flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": google_client_id,
                    "client_secret": google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [f"{os.getenv('BACKEND_URL', 'https://nexopeak-backend-54c8631fe608.herokuapp.com')}/api/v1/connections/google-analytics/callback"]
                }
            },
            scopes=[
                'https://www.googleapis.com/auth/analytics.readonly',
                'https://www.googleapis.com/auth/analytics.manage.users.readonly',
                'openid',
                'email',
                'profile'
            ]
        )
        
        # Set redirect URI
        flow.redirect_uri = f"{os.getenv('BACKEND_URL', 'https://nexopeak-backend-54c8631fe608.herokuapp.com')}/api/v1/connections/google-analytics/callback"
        
        # Exchange code for token
        flow.fetch_token(code=code)
        
        # Get user info from Google
        credentials = flow.credentials
        request = google_requests.Request()
        
        # Verify the ID token
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, request, google_client_id
        )
        
        google_email = id_info.get('email')
        google_name = id_info.get('name', 'Google Analytics User')
        
        # Create or update connection
        existing_connection = db.query(Connection).filter(
            Connection.user_id == user.id,
            Connection.provider == "ga4"
        ).first()
        
        if existing_connection:
            # Update existing connection
            existing_connection.status = "connected"
            existing_connection.access_token = credentials.token
            existing_connection.refresh_token = credentials.refresh_token
            existing_connection.token_expires_at = credentials.expiry
            existing_connection.external_id = google_email
            existing_connection.name = f"Google Analytics - {google_name}"
        else:
            # Create new connection
            connection = Connection(
                user_id=user.id,
                org_id=user.org_id,
                provider="ga4",
                external_id=google_email,
                name=f"Google Analytics - {google_name}",
                status="connected",
                access_token=credentials.token,
                refresh_token=credentials.refresh_token,
                token_expires_at=credentials.expiry,
                scopes=credentials.scopes
            )
            db.add(connection)
        
        db.commit()
        
        logging_service.log_info(
            module=LogModule.GA4_INTEGRATION,
            message=f"Successfully connected Google Analytics for user {user.email}",
            user_id=user.id
        )
        
        # Redirect to frontend with success
        frontend_url = os.getenv('FRONTEND_URL', 'https://nexopeak-frontend-d38117672e4d.herokuapp.com')
        return RedirectResponse(url=f"{frontend_url}/dashboard/connections?success=ga4_connected")
        
    except Exception as e:
        logging_service.log_error(
            module=LogModule.GA4_INTEGRATION,
            message=f"Failed to complete Google Analytics OAuth callback",
            error=str(e)
        )
        
        # Redirect to frontend with error
        frontend_url = os.getenv('FRONTEND_URL', 'https://nexopeak-frontend-d38117672e4d.herokuapp.com')
        return RedirectResponse(url=f"{frontend_url}/dashboard/connections?error=ga4_connection_failed")

@router.delete("/connections/{connection_id}")
async def delete_connection(
    connection_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a connection"""
    try:
        connection = db.query(Connection).filter(
            Connection.id == connection_id,
            Connection.user_id == current_user.id
        ).first()
        
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found"
            )
        
        db.delete(connection)
        db.commit()
        
        logging_service.log_info(
            module=LogModule.ANALYTICS,
            message=f"User {current_user.email} deleted connection {connection.name}",
            user_id=current_user.id
        )
        
        return {"message": "Connection deleted successfully"}
        
    except Exception as e:
        logging_service.log_error(
            module=LogModule.ANALYTICS,
            message=f"Failed to delete connection {connection_id} for user {current_user.id}",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete connection"
        )
