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

class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    role: str
    org_id: UUID

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class GoogleOAuthRequest(BaseModel):
    id_token: str
