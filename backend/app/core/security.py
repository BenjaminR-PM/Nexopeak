from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification failed: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Generate password hash."""
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing failed: {e}")
        raise

def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None, remember_me: bool = False
) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    
    if remember_me:
        # Use longer expiration for "Remember Me"
        expire = datetime.utcnow() + timedelta(days=settings.REMEMBER_ME_EXPIRE_DAYS)
    elif expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
        "remember_me": remember_me
    })
    
    try:
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        logger.error(f"Token creation failed: {e}")
        raise

def create_refresh_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT refresh token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    try:
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        logger.error(f"Refresh token creation failed: {e}")
        raise

def verify_token(token: str) -> dict:
    """Verify and decode JWT token."""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.error(f"Token verification failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {e}")
        raise

def is_token_expired(token_payload: dict) -> bool:
    """Check if token is expired."""
    if "exp" not in token_payload:
        return True
    
    exp_timestamp = token_payload["exp"]
    if isinstance(exp_timestamp, str):
        exp_timestamp = int(exp_timestamp)
    
    return datetime.utcnow().timestamp() > exp_timestamp

def should_refresh_token(token_payload: dict) -> bool:
    """Check if token should be refreshed (within 15 minutes of expiry)."""
    if "exp" not in token_payload:
        return True
    
    exp_timestamp = token_payload["exp"]
    if isinstance(exp_timestamp, str):
        exp_timestamp = int(exp_timestamp)
    
    # Refresh if within 15 minutes of expiry
    refresh_threshold = datetime.utcnow().timestamp() + (15 * 60)
    return refresh_threshold > exp_timestamp

def extend_session_with_activity(token_payload: dict) -> str:
    """Extend session by SESSION_ACTIVITY_TIMEOUT_MINUTES when user is active."""
    if "type" not in token_payload or token_payload["type"] != "access":
        raise ValueError("Can only extend access tokens")
    
    # Create new token with extended expiration
    new_data = {
        "sub": token_payload.get("sub"),
        "email": token_payload.get("email"),
        "user_id": token_payload.get("user_id"),
        "remember_me": token_payload.get("remember_me", False)
    }
    
    # Add activity extension time
    extension_minutes = settings.SESSION_ACTIVITY_TIMEOUT_MINUTES
    expires_delta = timedelta(minutes=extension_minutes)
    
    return create_access_token(new_data, expires_delta, token_payload.get("remember_me", False))

def generate_password_reset_token(email: str) -> str:
    """Generate password reset token."""
    delta = timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    now = datetime.utcnow()
    expires = now + delta
    
    to_encode = {
        "exp": expires,
        "sub": email,
        "type": "password_reset"
    }
    
    try:
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        logger.error(f"Password reset token creation failed: {e}")
        raise

def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify password reset token and return email."""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "password_reset":
            return None
            
        return email
    except JWTError:
        return None
    except Exception as e:
        logger.error(f"Password reset token verification failed: {e}")
        return None
