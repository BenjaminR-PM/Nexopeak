from typing import Optional
from app.core.security import create_access_token, verify_password, get_password_hash
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin
from sqlalchemy.orm import Session


class AuthService:
    @staticmethod
    def create_user(db: Session, user_create: UserCreate) -> User:
        """Create a new user"""
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            name=user_create.name,
            hashed_password=hashed_password,
            role=user_create.role,
            org_id=user_create.org_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_user_token(user: User) -> str:
        """Create an access token for a user"""
        return create_access_token(data={"sub": user.email})

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get a user by email"""
        return db.query(User).filter(User.email == email).first()
