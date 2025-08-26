from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Organization(Base):
    __tablename__ = "orgs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    size = Column(String(50), nullable=True)  # small, medium, large
    is_active = Column(Boolean, default=True, nullable=False)
    settings = Column(JSON, default={}, nullable=False)  # Organization-specific settings
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    users = relationship("User", back_populates="organization")
    connections = relationship("Connection", back_populates="organization")
    campaigns = relationship("Campaign", back_populates="organization")

    def __repr__(self):
        return f"<Organization(id={self.id}, name='{self.name}', domain='{self.domain}')>"

    @property
    def user_count(self) -> int:
        return len(self.users) if self.users else 0

    @property
    def active_user_count(self) -> int:
        return len([u for u in self.users if u.is_active]) if self.users else 0

    def get_setting(self, key: str, default=None):
        """Get organization setting value."""
        return self.settings.get(key, default)

    def set_setting(self, key: str, value):
        """Set organization setting value."""
        if not self.settings:
            self.settings = {}
        self.settings[key] = value
