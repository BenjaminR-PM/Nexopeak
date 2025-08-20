from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    organization_name: str
    industry: Optional[str] = None
    size: Optional[str] = None

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

    @validator('organization_name')
    def validate_org_name(cls, v):
        if len(v) < 2:
            raise ValueError('Organization name must be at least 2 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleOAuthRequest(BaseModel):
    id_token: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    org_id: str
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True
