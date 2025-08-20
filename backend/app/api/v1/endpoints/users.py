from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate

router = APIRouter()

@router.get("/users/me")
async def get_current_user():
    """Get current user info"""
    return {"message": "Current user info"}

@router.post("/users")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    return {"message": "User created successfully"}
