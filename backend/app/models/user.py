from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    role = Column(String(20), default="user", nullable=False)  # admin, analyst, viewer
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    connections = relationship("Connection", back_populates="user")
    campaigns = relationship("Campaign", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}', role='{self.role}')>"

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    @property
    def can_edit(self) -> bool:
        return self.role in ["admin", "analyst"]

    @property
    def can_view(self) -> bool:
        return self.role in ["admin", "analyst", "viewer"]
