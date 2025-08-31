from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from enum import Enum

# ============================================================================
# GA4 Connections Schemas
# ============================================================================

class ConnectionStatus(str, Enum):
    CONNECTED = "connected"
    ERROR = "error"
    WARNING = "warning"
    DISCONNECTED = "disconnected"

class DataQuality(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

class GA4ConnectionResponse(BaseModel):
    id: str
    organization_name: str
    organization_id: str
    property_id: str
    property_name: str
    status: ConnectionStatus
    last_sync: Optional[datetime]
    events_24h: int
    api_calls_today: int
    data_quality: DataQuality
    owner_email: str
    error_message: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class GA4ConnectionsListResponse(BaseModel):
    connections: List[GA4ConnectionResponse]
    total_count: int
    status_counts: Dict[str, int]

class GA4ConnectionUpdate(BaseModel):
    status: Optional[ConnectionStatus]
    property_name: Optional[str]

# ============================================================================
# Client Management Schemas
# ============================================================================

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    TRIAL = "trial"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class SubscriptionPlan(str, Enum):
    BASIC = "Basic"
    PROFESSIONAL = "Professional"
    ENTERPRISE = "Enterprise"

class ClientResponse(BaseModel):
    id: str
    name: str
    industry: Optional[str]
    plan: SubscriptionPlan
    users_count: int
    ga4_properties_count: int
    monthly_revenue: float
    join_date: datetime
    status: SubscriptionStatus
    primary_contact: str
    last_login: Optional[datetime]
    trial_end_date: Optional[datetime]
    next_billing_date: Optional[datetime]
    
    class Config:
        from_attributes = True

class ClientsListResponse(BaseModel):
    clients: List[ClientResponse]
    total_count: int
    total_revenue: float
    total_users: int
    total_properties: int

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    primary_contact_email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    plan: SubscriptionPlan
    initial_users: int = Field(1, ge=1, le=1000)

class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    status: Optional[SubscriptionStatus]
    plan: Optional[SubscriptionPlan]

# ============================================================================
# Billing & Revenue Schemas
# ============================================================================

class InvoiceStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    CANCELLED = "cancelled"

class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    client_name: str
    amount: float
    currency: str
    status: InvoiceStatus
    invoice_date: datetime
    due_date: datetime
    paid_at: Optional[datetime]
    period_start: datetime
    period_end: datetime
    is_overdue: bool
    
    class Config:
        from_attributes = True

class RevenueMetrics(BaseModel):
    monthly_recurring_revenue: float
    annual_recurring_revenue: float
    total_revenue_this_month: float
    total_revenue_this_year: float
    average_revenue_per_user: float
    churn_rate: float
    growth_rate: float

class BillingOverviewResponse(BaseModel):
    revenue_metrics: RevenueMetrics
    recent_invoices: List[InvoiceResponse]
    subscription_distribution: Dict[str, int]
    revenue_by_plan: Dict[str, float]

# ============================================================================
# Platform Settings Schemas
# ============================================================================

class SettingDataType(str, Enum):
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    JSON = "json"
    ARRAY = "array"

class PlatformSettingResponse(BaseModel):
    id: str
    category: str
    key: str
    value: Any
    description: Optional[str]
    data_type: SettingDataType
    min_value: Optional[float]
    max_value: Optional[float]
    allowed_values: Optional[List[Any]]
    is_sensitive: bool
    requires_restart: bool
    is_readonly: bool
    
    class Config:
        from_attributes = True

class PlatformSettingUpdate(BaseModel):
    value: Any
    
    @validator('value')
    def validate_value(cls, v):
        # Basic validation - more specific validation should be done in the service layer
        return v

class SettingsGroupResponse(BaseModel):
    category: str
    settings: List[PlatformSettingResponse]

class AllSettingsResponse(BaseModel):
    settings_groups: List[SettingsGroupResponse]

# ============================================================================
# System Metrics & Analytics Schemas
# ============================================================================

class SystemHealthResponse(BaseModel):
    database_status: str
    api_response_time: float
    active_connections: int
    memory_usage_percent: float
    cpu_usage_percent: float
    disk_usage_percent: float
    uptime_seconds: int
    last_backup: Optional[datetime]

class UsageMetrics(BaseModel):
    total_api_calls_today: int
    total_api_calls_this_month: int
    average_response_time: float
    error_rate_percent: float
    active_users_today: int
    active_users_this_month: int

class AdminDashboardResponse(BaseModel):
    system_health: SystemHealthResponse
    usage_metrics: UsageMetrics
    total_clients: int
    total_users: int
    total_connections: int
    monthly_revenue: float
    recent_signups: int
    alerts_count: int

# ============================================================================
# User Management Schemas (Enhanced)
# ============================================================================

class UserRole(str, Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"
    USER = "user"

class AdminUserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    organization_name: str
    organization_id: str
    is_active: bool
    is_verified: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminUsersListResponse(BaseModel):
    users: List[AdminUserResponse]
    total_count: int
    users_by_role: Dict[str, int]

class AdminUserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[UserRole]
    is_active: Optional[bool]

# ============================================================================
# Audit Log Schemas
# ============================================================================

class AuditLogResponse(BaseModel):
    id: str
    user_email: Optional[str]
    user_role: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    description: str
    changes: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    success: bool
    error_message: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

class AuditLogsListResponse(BaseModel):
    logs: List[AuditLogResponse]
    total_count: int

# ============================================================================
# General Response Schemas
# ============================================================================

class SuccessResponse(BaseModel):
    success: bool = True
    message: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[Dict[str, Any]] = None
