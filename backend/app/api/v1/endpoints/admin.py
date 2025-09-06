"""
Admin panel API endpoints for system administration.
Provides comprehensive admin functionality for managing the Nexopeak platform.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User
from app.models.organization import Organization
from app.models.connection import Connection
from app.models.campaign import Campaign
from app.services.auth_service import AuthService
from app.services.admin_service import AdminService
from app.services.logging_service import get_logging_service
from app.core.logging_config import LogModule
from app.schemas.auth import UserResponse
from app.schemas.admin import (
    GA4ConnectionsListResponse, GA4ConnectionUpdate,
    ClientsListResponse, ClientCreate, ClientUpdate,
    BillingOverviewResponse,
    AllSettingsResponse, PlatformSettingUpdate, PlatformSettingResponse,
    AdminDashboardResponse, SystemHealthResponse, UsageMetrics,
    AdminUsersListResponse, AdminUserUpdate,
    AuditLogsListResponse,
    SuccessResponse, ErrorResponse
)


router = APIRouter()
security = HTTPBearer()
logging_service = get_logging_service()


async def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current admin user and verify admin role."""
    try:
        payload = verify_token(credentials.credentials)
        user = AuthService.get_user_by_email(db, payload.get("sub"))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def log_admin_action(
    admin_service: AdminService,
    user: User,
    request: Request,
    action: str,
    resource_type: str,
    resource_id: Optional[str],
    description: str,
    changes: Optional[Dict[str, Any]] = None,
    success: bool = True,
    error_message: Optional[str] = None
):
    """Helper to log admin actions."""
    admin_service.log_admin_action(
        user_id=user.id,
        user_email=user.email,
        user_role=user.role,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        changes=changes,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("User-Agent"),
        success=success,
        error_message=error_message
    )


# ============================================================================
# Admin Dashboard
# ============================================================================

@router.get("/dashboard", response_model=AdminDashboardResponse)
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get comprehensive admin dashboard data."""
    admin_service = AdminService(db)
    return admin_service.get_admin_dashboard_data()


@router.get("/system-health", response_model=SystemHealthResponse)
async def get_system_health(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get current system health metrics."""
    admin_service = AdminService(db)
    return admin_service.get_system_health()


@router.get("/usage-metrics", response_model=UsageMetrics)
async def get_usage_metrics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get platform usage metrics."""
    admin_service = AdminService(db)
    return admin_service.get_usage_metrics()


# ============================================================================
# GA4 Connections Management
# ============================================================================

@router.get("/ga4-connections", response_model=GA4ConnectionsListResponse)
async def get_ga4_connections(
    search: Optional[str] = Query(None, description="Search connections by organization, property name, or owner email"),
    status: Optional[str] = Query(None, description="Filter by connection status"),
    limit: int = Query(100, ge=1, le=1000, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all GA4 connections with filtering and pagination."""
    admin_service = AdminService(db)
    return admin_service.get_ga4_connections(
        search=search,
        status_filter=status,
        limit=limit,
        offset=offset
    )


@router.put("/ga4-connections/{connection_id}", response_model=SuccessResponse)
async def update_ga4_connection(
    connection_id: str,
    update_data: GA4ConnectionUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update a GA4 connection."""
    admin_service = AdminService(db)
    
    try:
        # Get the connection
        connection = db.query(Connection).filter(Connection.id == connection_id).first()
        if not connection:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        # Track changes for audit log
        changes = {}
        if update_data.status and update_data.status != connection.status:
            changes["status"] = {"from": connection.status, "to": update_data.status}
            connection.status = update_data.status
        
        if update_data.property_name and update_data.property_name != connection.name:
            changes["property_name"] = {"from": connection.name, "to": update_data.property_name}
            connection.name = update_data.property_name
        
        db.commit()
        
        # Log the action
        log_admin_action(
            admin_service, current_admin, request,
            action="update",
            resource_type="ga4_connection",
            resource_id=connection_id,
            description=f"Updated GA4 connection {connection.name}",
            changes=changes
        )
        
        return SuccessResponse(message="GA4 connection updated successfully")
        
    except Exception as e:
        log_admin_action(
            admin_service, current_admin, request,
            action="update",
            resource_type="ga4_connection",
            resource_id=connection_id,
            description=f"Failed to update GA4 connection",
            success=False,
            error_message=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Client Management
# ============================================================================

@router.get("/clients", response_model=ClientsListResponse)
async def get_clients(
    search: Optional[str] = Query(None, description="Search clients by name or industry"),
    limit: int = Query(100, ge=1, le=1000, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all client organizations."""
    admin_service = AdminService(db)
    return admin_service.get_clients(
        search=search,
        limit=limit,
        offset=offset
    )


@router.post("/clients", response_model=SuccessResponse)
async def create_client(
    client_data: ClientCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Create a new client organization."""
    admin_service = AdminService(db)
    
    try:
        # Create organization
        organization = Organization(
            name=client_data.name,
            industry=client_data.industry
        )
        db.add(organization)
        db.flush()  # Get the ID
        
        # Create admin user for the organization
        auth_service = AuthService(db)
        
        # Generate a temporary password (in real app, send email invitation)
        temp_password = "TempPass123!"
        
        user = auth_service.create_user(
            email=client_data.primary_contact_email,
            password=temp_password,
            name=client_data.name + " Admin",
            org_id=organization.id,
            role="admin"
        )
        
        # Create subscription (simplified - in real app, integrate with payment provider)
        from app.models.subscription import Subscription, SubscriptionPlan
        
        # Get the plan
        plan = db.query(SubscriptionPlan).filter(
            SubscriptionPlan.name == client_data.plan
        ).first()
        
        if plan:
            subscription = Subscription(
                org_id=organization.id,
                plan_id=plan.id,
                status="trial",  # Start with trial
                trial_end_date=datetime.utcnow() + timedelta(days=14)
            )
            db.add(subscription)
        
        db.commit()
        
        # Log the action
        log_admin_action(
            admin_service, current_admin, request,
            action="create",
            resource_type="client",
            resource_id=organization.id,
            description=f"Created new client organization: {client_data.name}",
            changes={"organization": client_data.dict()}
        )
        
        return SuccessResponse(message=f"Client '{client_data.name}' created successfully")
        
    except Exception as e:
        db.rollback()
        log_admin_action(
            admin_service, current_admin, request,
            action="create",
            resource_type="client",
            resource_id=None,
            description=f"Failed to create client organization: {client_data.name}",
            success=False,
            error_message=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Billing & Revenue Management
# ============================================================================

@router.get("/billing", response_model=BillingOverviewResponse)
async def get_billing_overview(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get comprehensive billing and revenue overview."""
    admin_service = AdminService(db)
    return admin_service.get_billing_overview()


# ============================================================================
# Platform Settings Management
# ============================================================================

@router.get("/settings", response_model=AllSettingsResponse)
async def get_platform_settings(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all platform settings grouped by category."""
    admin_service = AdminService(db)
    return admin_service.get_all_settings()


@router.put("/settings/{setting_id}", response_model=PlatformSettingResponse)
async def update_platform_setting(
    setting_id: str,
    update_data: PlatformSettingUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update a platform setting."""
    admin_service = AdminService(db)
    
    try:
        # Get current value for audit log
        from app.models.platform_settings import PlatformSettings
        current_setting = db.query(PlatformSettings).filter(
            PlatformSettings.id == setting_id
        ).first()
        
        if not current_setting:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        old_value = current_setting.value
        
        # Update the setting
        updated_setting = admin_service.update_setting(setting_id, update_data.value)
        
        # Log the action
        log_admin_action(
            admin_service, current_admin, request,
            action="update",
            resource_type="platform_setting",
            resource_id=setting_id,
            description=f"Updated platform setting: {current_setting.category}.{current_setting.key}",
            changes={
                "setting": {
                    "from": old_value,
                    "to": update_data.value
                }
            }
        )
        
        return updated_setting
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log_admin_action(
            admin_service, current_admin, request,
            action="update",
            resource_type="platform_setting",
            resource_id=setting_id,
            description=f"Failed to update platform setting",
            success=False,
            error_message=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# User Management
# ============================================================================

@router.get("/users", response_model=AdminUsersListResponse)
async def get_all_users(
    search: Optional[str] = Query(None, description="Search users by email, name, or organization"),
    role: Optional[str] = Query(None, description="Filter by user role"),
    limit: int = Query(100, ge=1, le=1000, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all users with admin details."""
    admin_service = AdminService(db)
    return admin_service.get_all_users(
        search=search,
        role_filter=role,
        limit=limit,
        offset=offset
    )


@router.put("/users/{user_id}", response_model=SuccessResponse)
async def update_user(
    user_id: str,
    update_data: AdminUserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update a user."""
    admin_service = AdminService(db)
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        changes = {}
        
        if update_data.name and update_data.name != user.name:
            changes["name"] = {"from": user.name, "to": update_data.name}
            user.name = update_data.name
        
        if update_data.role and update_data.role != user.role:
            changes["role"] = {"from": user.role, "to": update_data.role}
            user.role = update_data.role
        
        if update_data.is_active is not None and update_data.is_active != user.is_active:
            changes["is_active"] = {"from": user.is_active, "to": update_data.is_active}
            user.is_active = update_data.is_active
            
            db.commit()
        
        log_admin_action(
            admin_service, current_admin, request,
            action="update",
            resource_type="user",
            resource_id=user_id,
            description=f"Updated user: {user.email}",
            changes=changes
        )
        
        return SuccessResponse(message="User updated successfully")
        
    except Exception as e:
        log_admin_action(
            admin_service, current_admin, request,
            action="update",
            resource_type="user",
            resource_id=user_id,
            description=f"Failed to update user",
            success=False,
            error_message=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Dashboard Statistics
# ============================================================================

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get comprehensive dashboard statistics for admin panel."""
    try:
        # Get total users
        total_users = db.query(User).count()
        
        # Get total connections
        total_connections = db.query(Connection).count()
        active_connections = db.query(Connection).filter(Connection.status == 'active').count()
        
        # Get total campaigns
        total_campaigns = db.query(Campaign).count()
        active_campaigns = db.query(Campaign).filter(Campaign.is_active == True).count()
        
        # Get total organizations
        total_organizations = db.query(Organization).count()
        
        # Calculate estimated events (campaigns * average events per campaign)
        total_events = total_campaigns * 1000  # Rough estimate
        
        # Revenue would come from billing system (placeholder for now)
        total_revenue = 0
        monthly_revenue = 0
        
        return {
            "total_users": total_users,
            "total_connections": total_connections,
            "active_connections": active_connections,
            "total_campaigns": total_campaigns,
            "active_campaigns": active_campaigns,
            "total_organizations": total_organizations,
            "total_events": total_events,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# User-Specific Data
# ============================================================================

@router.get("/users/{user_id}/campaigns")
async def get_user_campaigns(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get campaigns for a specific user."""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's campaigns
        campaigns = db.query(Campaign).filter(
            and_(Campaign.user_id == user_id, Campaign.org_id == user.org_id)
        ).all()
        
        return {"campaigns": campaigns}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/connections")
async def get_user_connections(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get connections for a specific user."""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's connections
        connections = db.query(Connection).filter(
            and_(Connection.user_id == user_id, Connection.org_id == user.org_id)
        ).all()
        
        return {"connections": connections}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Audit Logs
# ============================================================================

@router.get("/audit-logs", response_model=AuditLogsListResponse)
async def get_audit_logs(
    limit: int = Query(100, ge=1, le=1000, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    user: Optional[str] = Query(None, description="Filter by user email"),
    action: Optional[str] = Query(None, description="Filter by action"),
    resource: Optional[str] = Query(None, description="Filter by resource type"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get audit logs with filtering."""
    admin_service = AdminService(db)
    return admin_service.get_audit_logs(
        limit=limit,
        offset=offset,
        user_filter=user,
        action_filter=action,
        resource_filter=resource
    )