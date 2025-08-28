"""
Admin panel API endpoints for system administration.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
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
from app.services.logging_service import get_logging_service
from app.core.logging_config import LogModule
from app.schemas.auth import UserResponse


router = APIRouter()
logging_service = get_logging_service()


class AdminStats(BaseModel):
    """Admin dashboard statistics."""
    total_users: int
    total_organizations: int
    total_connections: int
    total_campaigns: int
    active_users_today: int
    new_users_this_week: int
    users_by_role: Dict[str, int]
    organizations_by_status: Dict[str, int]
    system_health: Dict[str, Any]


class UserUpdate(BaseModel):
    """Model for updating user information."""
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class OrganizationStats(BaseModel):
    """Organization statistics model."""
    id: str
    name: str
    domain: str
    user_count: int
    connection_count: int
    campaign_count: int
    created_at: datetime
    last_activity: Optional[datetime]


class SystemHealth(BaseModel):
    """System health status model."""
    database_status: str
    redis_status: str
    logging_status: str
    external_apis_status: Dict[str, str]
    disk_usage: Dict[str, Any]
    memory_usage: Dict[str, Any]


async def get_current_admin_user(
    token: str = Depends(verify_token),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current admin user."""
    user = AuthService.get_user_by_email(db, token.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_admin:
        logging_service.log_security_event(
            "unauthorized_admin_access",
            severity="high",
            user_id=user.id,
            details={"attempted_endpoint": "admin_panel"}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics."""
    try:
        logging_service.logger.info(
            LogModule.API,
            "Admin stats requested",
            user_id=current_user.id
        )
        
        # Basic counts
        total_users = db.query(User).count()
        total_orgs = db.query(Organization).count()
        total_connections = db.query(Connection).count()
        total_campaigns = db.query(Campaign).count()
        
        # Active users today
        today = datetime.now().date()
        active_users_today = db.query(User).filter(
            func.date(User.last_login_at) == today
        ).count()
        
        # New users this week
        week_ago = datetime.now() - timedelta(days=7)
        new_users_this_week = db.query(User).filter(
            User.created_at >= week_ago
        ).count()
        
        # Users by role
        role_counts = db.query(
            User.role, func.count(User.id)
        ).group_by(User.role).all()
        users_by_role = {role: count for role, count in role_counts}
        
        # Organizations by status (active/inactive based on recent activity)
        active_orgs = db.query(Organization).join(User).filter(
            User.last_login_at >= week_ago
        ).distinct().count()
        
        organizations_by_status = {
            "active": active_orgs,
            "inactive": total_orgs - active_orgs
        }
        
        # System health (basic check)
        system_health = {
            "database": "healthy",
            "api": "healthy",
            "logging": "healthy"
        }
        
        return AdminStats(
            total_users=total_users,
            total_organizations=total_orgs,
            total_connections=total_connections,
            total_campaigns=total_campaigns,
            active_users_today=active_users_today,
            new_users_this_week=new_users_this_week,
            users_by_role=users_by_role,
            organizations_by_status=organizations_by_status,
            system_health=system_health
        )
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "get_admin_stats", "user_id": current_user.id}
        )
        raise HTTPException(status_code=500, detail=f"Error getting admin stats: {str(e)}")


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, description="Number of users to skip"),
    limit: int = Query(100, description="Maximum number of users to return"),
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name or email")
):
    """Get all users with filtering options."""
    try:
        logging_service.logger.info(
            LogModule.USER_MGMT,
            "Admin user list requested",
            user_id=current_user.id,
            additional_data={"filters": {"role": role, "is_active": is_active, "search": search}}
        )
        
        query = db.query(User)
        
        # Apply filters
        if role:
            query = query.filter(User.role == role)
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (User.name.ilike(search_term)) | 
                (User.email.ilike(search_term))
            )
        
        # Apply pagination
        users = query.offset(skip).limit(limit).all()
        
        return [
            UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                role=user.role,
                org_id=user.org_id
            )
            for user in users
        ]
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "get_all_users", "user_id": current_user.id}
        )
        raise HTTPException(status_code=500, detail=f"Error getting users: {str(e)}")


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a user's information."""
    try:
        # Get the user to update
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Log the update attempt
        logging_service.logger.info(
            LogModule.USER_MGMT,
            f"Admin updating user {user_id}",
            user_id=current_user.id,
            additional_data={"target_user": user_id, "updates": user_update.dict(exclude_unset=True)}
        )
        
        # Apply updates
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        logging_service.log_security_event(
            "user_updated_by_admin",
            severity="medium",
            user_id=current_user.id,
            details={"target_user": user_id, "updated_fields": list(update_data.keys())}
        )
        
        return {"message": "User updated successfully", "user_id": user_id}
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "update_user", "user_id": current_user.id, "target_user": user_id}
        )
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (soft delete by deactivating)."""
    try:
        # Get the user to delete
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent self-deletion
        if user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        # Soft delete by deactivating
        user.is_active = False
        db.commit()
        
        logging_service.log_security_event(
            "user_deleted_by_admin",
            severity="high",
            user_id=current_user.id,
            details={"target_user": user_id, "target_email": user.email}
        )
        
        return {"message": "User deactivated successfully", "user_id": user_id}
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "delete_user", "user_id": current_user.id, "target_user": user_id}
        )
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")


@router.get("/organizations", response_model=List[OrganizationStats])
async def get_organization_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get statistics for all organizations."""
    try:
        logging_service.logger.info(
            LogModule.API,
            "Admin organization stats requested",
            user_id=current_user.id
        )
        
        # Get organizations with user counts
        orgs_with_counts = db.query(
            Organization,
            func.count(User.id).label('user_count'),
            func.count(Connection.id).label('connection_count'),
            func.count(Campaign.id).label('campaign_count'),
            func.max(User.last_login_at).label('last_activity')
        ).outerjoin(User).outerjoin(Connection).outerjoin(Campaign)\
         .group_by(Organization.id).all()
        
        org_stats = []
        for org, user_count, conn_count, camp_count, last_activity in orgs_with_counts:
            org_stats.append(OrganizationStats(
                id=org.id,
                name=org.name,
                domain=org.domain,
                user_count=user_count or 0,
                connection_count=conn_count or 0,
                campaign_count=camp_count or 0,
                created_at=org.created_at,
                last_activity=last_activity
            ))
        
        return org_stats
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "get_organization_stats", "user_id": current_user.id}
        )
        raise HTTPException(status_code=500, detail=f"Error getting organization stats: {str(e)}")


@router.get("/system/health", response_model=SystemHealth)
async def get_system_health(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive system health status."""
    try:
        logging_service.logger.info(
            LogModule.HEALTH_CHECK,
            "Admin system health check requested",
            user_id=current_user.id
        )
        
        # Database health
        try:
            db.execute("SELECT 1")
            db_status = "healthy"
        except Exception:
            db_status = "unhealthy"
        
        # Redis health (if using Redis)
        redis_status = "not_configured"  # Update when Redis is implemented
        
        # Logging system health
        import os
        from pathlib import Path
        logs_dir = Path("logs")
        logging_status = "healthy" if logs_dir.exists() else "unhealthy"
        
        # External APIs status (placeholder)
        external_apis_status = {
            "google_analytics": "unknown",
            "search_console": "unknown",
            "sendgrid": "unknown"
        }
        
        # Disk usage
        import shutil
        disk_usage = {}
        try:
            total, used, free = shutil.disk_usage("/")
            disk_usage = {
                "total_gb": total // (1024**3),
                "used_gb": used // (1024**3),
                "free_gb": free // (1024**3),
                "usage_percent": (used / total) * 100
            }
        except Exception:
            disk_usage = {"error": "Unable to get disk usage"}
        
        # Memory usage (basic - simplified without psutil)
        memory_usage = {"status": "monitoring_not_available"}
        
        return SystemHealth(
            database_status=db_status,
            redis_status=redis_status,
            logging_status=logging_status,
            external_apis_status=external_apis_status,
            disk_usage=disk_usage,
            memory_usage=memory_usage
        )
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "get_system_health", "user_id": current_user.id}
        )
        raise HTTPException(status_code=500, detail=f"Error getting system health: {str(e)}")


@router.post("/system/maintenance")
async def perform_maintenance(
    action: str = Query(..., description="Maintenance action to perform"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Perform system maintenance tasks."""
    try:
        logging_service.log_security_event(
            "admin_maintenance_action",
            severity="medium",
            user_id=current_user.id,
            details={"action": action}
        )
        
        result = {"action": action, "status": "completed"}
        
        if action == "cleanup_logs":
            # Clean up old logs
            from pathlib import Path
            logs_dir = Path("logs")
            deleted_count = 0
            
            if logs_dir.exists():
                cutoff_date = datetime.now() - timedelta(days=30)
                for log_file in logs_dir.glob("*.log*"):
                    if log_file.stat().st_mtime < cutoff_date.timestamp():
                        log_file.unlink()
                        deleted_count += 1
            
            result["details"] = {"deleted_files": deleted_count}
            
        elif action == "cleanup_inactive_users":
            # Deactivate users who haven't logged in for 90 days
            cutoff_date = datetime.now() - timedelta(days=90)
            inactive_users = db.query(User).filter(
                and_(
                    User.last_login_at < cutoff_date,
                    User.is_active == True,
                    User.role != "admin"  # Don't deactivate admins
                )
            ).all()
            
            deactivated_count = 0
            for user in inactive_users:
                user.is_active = False
                deactivated_count += 1
            
            db.commit()
            result["details"] = {"deactivated_users": deactivated_count}
            
        elif action == "generate_report":
            # Generate system report
            result["details"] = {
                "report_url": "/api/v1/admin/reports/system",
                "generated_at": datetime.now().isoformat()
            }
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown maintenance action: {action}"
            )
        
        logging_service.logger.info(
            LogModule.API,
            f"Maintenance action completed: {action}",
            user_id=current_user.id,
            additional_data=result
        )
        
        return result
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "perform_maintenance", "user_id": current_user.id, "action": action}
        )
        raise HTTPException(status_code=500, detail=f"Error performing maintenance: {str(e)}")


@router.get("/audit-log")
async def get_audit_log(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, description="Number of log entries to return"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    action_type: Optional[str] = Query(None, description="Filter by action type")
):
    """Get audit log for admin review."""
    try:
        logging_service.logger.info(
            LogModule.API,
            "Admin audit log requested",
            user_id=current_user.id,
            additional_data={"filters": {"user_id": user_id, "action_type": action_type}}
        )
        
        # This would typically query a dedicated audit log table
        # For now, we'll return recent security events from logs
        
        from pathlib import Path
        import json
        
        audit_entries = []
        logs_dir = Path("logs")
        security_log = logs_dir / "security.log"
        
        if security_log.exists():
            try:
                # Read last N lines efficiently
                lines = []
                with open(security_log, 'r') as f:
                    lines = f.readlines()
                
                # Process last 'limit' lines
                for line in lines[-limit:]:
                    try:
                        log_entry = json.loads(line.strip())
                        if user_id and log_entry.get("user_id") != user_id:
                            continue
                        if action_type and action_type not in log_entry.get("message", ""):
                            continue
                        audit_entries.append(log_entry)
                    except json.JSONDecodeError:
                        continue
            except Exception:
                pass
        
        return {
            "audit_entries": audit_entries[-limit:],
            "total_count": len(audit_entries),
            "filters": {"user_id": user_id, "action_type": action_type}
        }
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "get_audit_log", "user_id": current_user.id}
        )
        raise HTTPException(status_code=500, detail=f"Error getting audit log: {str(e)}")
