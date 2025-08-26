from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Connection(Base):
    __tablename__ = "connections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    provider = Column(String(50), nullable=False)  # ga4, gsc, youtube, etc.
    external_id = Column(String(255), nullable=True)  # External service ID
    name = Column(String(255), nullable=False)  # Display name for the connection
    scopes = Column(JSON, default=[], nullable=False)  # OAuth scopes
    status = Column(String(20), default="connected", nullable=False)  # connected, error, revoked
    connection_metadata = Column(JSON, default={}, nullable=False)  # Provider-specific metadata
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    last_sync_status = Column(String(20), nullable=True)  # success, error, pending
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="connections")
    user = relationship("User", back_populates="connections")

    def __repr__(self):
        return f"<Connection(id={self.id}, provider='{self.provider}', name='{self.name}', status='{self.status}')>"

    @property
    def is_active(self) -> bool:
        return self.status == "connected"

    @property
    def needs_sync(self) -> bool:
        """Check if connection needs to be synced."""
        if not self.last_sync_at:
            return True
        # TODO: Implement sync frequency logic based on provider
        return False

    def get_metadata(self, key: str, default=None):
        """Get connection metadata value."""
        return self.connection_metadata.get(key, default)

    def set_metadata(self, key: str, value):
        """Set connection metadata value."""
        if not self.connection_metadata:
            self.connection_metadata = {}
        self.connection_metadata[key] = value

    def update_sync_status(self, status: str, error_message: str = None):
        """Update sync status and timestamp."""
        self.last_sync_status = status
        self.last_sync_at = func.now()
        if error_message:
            self.error_message = error_message
        if status == "error":
            self.status = "error"
        elif status == "success":
            self.status = "connected"
