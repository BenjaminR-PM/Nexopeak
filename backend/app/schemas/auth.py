from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = "user"
    org_id: Optional[UUID] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    remember_me: Optional[bool] = False

class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    role: str
    is_active: bool = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    remember_me: bool = False
    user: Optional[UserResponse] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class GoogleIdTokenRequest(BaseModel):
    id_token: str
    remember_me: Optional[bool] = False

class SessionExtendResponse(BaseModel):
    access_token: str
    expires_in: int
    message: str = "Session extended successfully"
