from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, JSON, Text
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class PlatformSettings(Base):
    __tablename__ = "platform_settings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category = Column(String(50), nullable=False)  # api, security, features, notifications, performance
    key = Column(String(100), nullable=False)
    value = Column(JSON, nullable=False)  # Store any type of value as JSON
    description = Column(Text, nullable=True)
    data_type = Column(String(20), nullable=False)  # string, integer, float, boolean, json, array
    
    # Validation
    min_value = Column(Float, nullable=True)  # For numeric values
    max_value = Column(Float, nullable=True)  # For numeric values
    allowed_values = Column(JSON, nullable=True)  # For enum-like values
    
    # Metadata
    is_sensitive = Column(Boolean, default=False, nullable=False)  # Hide value in UI
    requires_restart = Column(Boolean, default=False, nullable=False)  # Requires app restart
    is_readonly = Column(Boolean, default=False, nullable=False)  # Cannot be modified via UI
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<PlatformSettings(category='{self.category}', key='{self.key}', value={self.value})>"

    @property
    def full_key(self) -> str:
        return f"{self.category}.{self.key}"

    def get_typed_value(self):
        """Return the value with proper type conversion."""
        if self.data_type == "boolean":
            return bool(self.value)
        elif self.data_type == "integer":
            return int(self.value)
        elif self.data_type == "float":
            return float(self.value)
        elif self.data_type == "string":
            return str(self.value)
        else:
            return self.value  # JSON or array, return as-is


class SystemMetrics(Base):
    __tablename__ = "system_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(20), nullable=True)  # requests, seconds, bytes, etc.
    
    # Categorization
    category = Column(String(50), nullable=False)  # api, database, performance, usage
    subcategory = Column(String(50), nullable=True)
    
    # Context
    tags = Column(JSON, default={}, nullable=False)  # Additional metadata
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Aggregation period (for pre-aggregated metrics)
    period = Column(String(20), nullable=True)  # minute, hour, day, week, month
    period_start = Column(DateTime(timezone=True), nullable=True)
    period_end = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<SystemMetrics(name='{self.metric_name}', value={self.metric_value}, timestamp={self.timestamp})>"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Who performed the action
    user_id = Column(String(36), nullable=True)  # Nullable for system actions
    user_email = Column(String(255), nullable=True)
    user_role = Column(String(20), nullable=True)
    
    # What action was performed
    action = Column(String(100), nullable=False)  # create, update, delete, login, etc.
    resource_type = Column(String(50), nullable=False)  # user, organization, connection, etc.
    resource_id = Column(String(36), nullable=True)
    
    # Action details
    description = Column(Text, nullable=False)
    changes = Column(JSON, nullable=True)  # Before/after values for updates
    action_metadata = Column(JSON, default={}, nullable=False)  # Additional context
    
    # Request context
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(Text, nullable=True)
    request_id = Column(String(36), nullable=True)
    
    # Result
    success = Column(Boolean, default=True, nullable=False)
    error_message = Column(Text, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<AuditLog(action='{self.action}', resource='{self.resource_type}', user='{self.user_email}', timestamp={self.timestamp})>"
