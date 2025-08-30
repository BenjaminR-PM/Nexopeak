from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc
import psutil
import time

from app.models.user import User
from app.models.organization import Organization
from app.models.connection import Connection
from app.models.campaign import Campaign
from app.models.subscription import Subscription, SubscriptionPlan, Invoice
from app.models.platform_settings import PlatformSettings, SystemMetrics, AuditLog
from app.schemas.admin import (
    GA4ConnectionResponse, GA4ConnectionsListResponse, ConnectionStatus, DataQuality,
    ClientResponse, ClientsListResponse, SubscriptionStatus,
    RevenueMetrics, BillingOverviewResponse, InvoiceResponse,
    PlatformSettingResponse, SettingsGroupResponse, AllSettingsResponse,
    SystemHealthResponse, UsageMetrics, AdminDashboardResponse,
    AdminUserResponse, AdminUsersListResponse,
    AuditLogResponse, AuditLogsListResponse
)

class AdminService:
    def __init__(self, db: Session):
        self.db = db

    # ============================================================================
    # GA4 Connections Management
    # ============================================================================

    def get_ga4_connections(
        self, 
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> GA4ConnectionsListResponse:
        """Get all GA4 connections with filtering and pagination."""
        
        query = self.db.query(Connection).join(Organization).join(User).filter(
            Connection.provider == "ga4"
        )
        
        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Organization.name.ilike(search_term),
                    Connection.name.ilike(search_term),
                    User.email.ilike(search_term)
                )
            )
        
        if status_filter and status_filter != "all":
            query = query.filter(Connection.status == status_filter)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        connections = query.order_by(desc(Connection.last_sync_at)).offset(offset).limit(limit).all()
        
        # Calculate status counts
        status_counts = {}
        status_query = self.db.query(
            Connection.status, func.count(Connection.id)
        ).filter(Connection.provider == "ga4").group_by(Connection.status)
        
        for status, count in status_query.all():
            status_counts[status] = count
        
        # Convert to response format
        connection_responses = []
        for conn in connections:
            # Mock some data for now - in real implementation, this would come from actual GA4 API
            events_24h = self._calculate_events_24h(conn)
            api_calls_today = self._calculate_api_calls_today(conn)
            data_quality = self._assess_data_quality(conn)
            
            connection_responses.append(GA4ConnectionResponse(
                id=conn.id,
                organization_name=conn.organization.name,
                organization_id=conn.org_id,
                property_id=conn.external_id or f"G-{conn.id[:8].upper()}",
                property_name=conn.name,
                status=ConnectionStatus(conn.status),
                last_sync=conn.last_sync_at,
                events_24h=events_24h,
                api_calls_today=api_calls_today,
                data_quality=data_quality,
                owner_email=conn.user.email,
                error_message=conn.error_message,
                created_at=conn.created_at
            ))
        
        return GA4ConnectionsListResponse(
            connections=connection_responses,
            total_count=total_count,
            status_counts=status_counts
        )

    def _calculate_events_24h(self, connection: Connection) -> int:
        """Calculate events in last 24 hours for a connection."""
        # Mock implementation - in real app, query from analytics data
        base_events = hash(connection.id) % 100000
        return base_events + (hash(str(datetime.now().date())) % 10000)

    def _calculate_api_calls_today(self, connection: Connection) -> int:
        """Calculate API calls today for a connection."""
        # Mock implementation - in real app, query from metrics
        return hash(connection.id + str(datetime.now().date())) % 5000

    def _assess_data_quality(self, connection: Connection) -> DataQuality:
        """Assess data quality for a connection."""
        if connection.status == "error":
            return DataQuality.POOR
        elif connection.status == "warning":
            return DataQuality.FAIR
        elif connection.last_sync_at and connection.last_sync_at > datetime.utcnow() - timedelta(hours=2):
            return DataQuality.EXCELLENT
        else:
            return DataQuality.GOOD

    # ============================================================================
    # Client Management
    # ============================================================================

    def get_clients(
        self,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> ClientsListResponse:
        """Get all client organizations with their subscription details."""
        
        query = self.db.query(Organization).options(
            joinedload(Organization.subscription).joinedload(Subscription.plan),
            joinedload(Organization.users)
        )
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Organization.name.ilike(search_term),
                    Organization.industry.ilike(search_term)
                )
            )
        
        total_count = query.count()
        organizations = query.order_by(desc(Organization.created_at)).offset(offset).limit(limit).all()
        
        clients = []
        total_revenue = 0
        total_users = 0
        total_properties = 0
        
        for org in organizations:
            # Get subscription details
            subscription = org.subscription
            plan_name = subscription.plan.name if subscription and subscription.plan else "No Plan"
            monthly_revenue = subscription.plan.price_monthly if subscription and subscription.plan else 0
            status = SubscriptionStatus(subscription.status) if subscription else SubscriptionStatus.SUSPENDED
            
            # Get user count
            users_count = len([u for u in org.users if u.is_active])
            
            # Get GA4 properties count
            ga4_properties_count = self.db.query(Connection).filter(
                Connection.org_id == org.id,
                Connection.provider == "ga4",
                Connection.status == "connected"
            ).count()
            
            # Get primary contact (first admin user)
            primary_contact = next(
                (u.email for u in org.users if u.role == "admin" and u.is_active),
                org.users[0].email if org.users else "No contact"
            )
            
            # Get last login
            last_login = None
            if org.users:
                last_login = max((u.last_login_at for u in org.users if u.last_login_at), default=None)
            
            clients.append(ClientResponse(
                id=org.id,
                name=org.name,
                industry=org.industry,
                plan=plan_name,
                users_count=users_count,
                ga4_properties_count=ga4_properties_count,
                monthly_revenue=monthly_revenue,
                join_date=org.created_at,
                status=status,
                primary_contact=primary_contact,
                last_login=last_login,
                trial_end_date=subscription.trial_end_date if subscription else None,
                next_billing_date=subscription.next_billing_date if subscription else None
            ))
            
            total_revenue += monthly_revenue
            total_users += users_count
            total_properties += ga4_properties_count
        
        return ClientsListResponse(
            clients=clients,
            total_count=total_count,
            total_revenue=total_revenue,
            total_users=total_users,
            total_properties=total_properties
        )

    # ============================================================================
    # Billing & Revenue
    # ============================================================================

    def get_billing_overview(self) -> BillingOverviewResponse:
        """Get comprehensive billing and revenue overview."""
        
        # Calculate revenue metrics
        now = datetime.utcnow()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get active subscriptions
        active_subscriptions = self.db.query(Subscription).filter(
            Subscription.status.in_(["active", "trial"])
        ).all()
        
        # Calculate MRR and ARR
        mrr = sum(sub.plan.price_monthly for sub in active_subscriptions if sub.plan)
        arr = mrr * 12
        
        # Get revenue this month and year
        revenue_this_month = self.db.query(func.sum(Invoice.amount)).filter(
            Invoice.status == "paid",
            Invoice.paid_at >= current_month_start
        ).scalar() or 0
        
        revenue_this_year = self.db.query(func.sum(Invoice.amount)).filter(
            Invoice.status == "paid",
            Invoice.paid_at >= current_year_start
        ).scalar() or 0
        
        # Calculate ARPU
        total_active_users = self.db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 1
        arpu = mrr / total_active_users if total_active_users > 0 else 0
        
        # Mock churn and growth rates (in real app, calculate from historical data)
        churn_rate = 0.05  # 5%
        growth_rate = 0.15  # 15%
        
        revenue_metrics = RevenueMetrics(
            monthly_recurring_revenue=mrr,
            annual_recurring_revenue=arr,
            total_revenue_this_month=revenue_this_month,
            total_revenue_this_year=revenue_this_year,
            average_revenue_per_user=arpu,
            churn_rate=churn_rate,
            growth_rate=growth_rate
        )
        
        # Get recent invoices
        recent_invoices_query = self.db.query(Invoice).join(Subscription).join(Organization).order_by(
            desc(Invoice.created_at)
        ).limit(10)
        
        recent_invoices = []
        for invoice in recent_invoices_query.all():
            recent_invoices.append(InvoiceResponse(
                id=invoice.id,
                invoice_number=invoice.invoice_number,
                client_name=invoice.subscription.organization.name,
                amount=invoice.amount,
                currency=invoice.currency,
                status=invoice.status,
                invoice_date=invoice.invoice_date,
                due_date=invoice.due_date,
                paid_at=invoice.paid_at,
                period_start=invoice.period_start,
                period_end=invoice.period_end,
                is_overdue=invoice.is_overdue
            ))
        
        # Get subscription distribution
        subscription_distribution = {}
        plan_revenue = {}
        
        for sub in active_subscriptions:
            if sub.plan:
                plan_name = sub.plan.name
                subscription_distribution[plan_name] = subscription_distribution.get(plan_name, 0) + 1
                plan_revenue[plan_name] = plan_revenue.get(plan_name, 0) + sub.plan.price_monthly
        
        return BillingOverviewResponse(
            revenue_metrics=revenue_metrics,
            recent_invoices=recent_invoices,
            subscription_distribution=subscription_distribution,
            revenue_by_plan=plan_revenue
        )

    # ============================================================================
    # Platform Settings
    # ============================================================================

    def get_all_settings(self) -> AllSettingsResponse:
        """Get all platform settings grouped by category."""
        
        settings = self.db.query(PlatformSettings).order_by(
            PlatformSettings.category, PlatformSettings.key
        ).all()
        
        # Group by category
        settings_by_category = {}
        for setting in settings:
            if setting.category not in settings_by_category:
                settings_by_category[setting.category] = []
            
            settings_by_category[setting.category].append(PlatformSettingResponse(
                id=setting.id,
                category=setting.category,
                key=setting.key,
                value=setting.value,
                description=setting.description,
                data_type=setting.data_type,
                min_value=setting.min_value,
                max_value=setting.max_value,
                allowed_values=setting.allowed_values,
                is_sensitive=setting.is_sensitive,
                requires_restart=setting.requires_restart,
                is_readonly=setting.is_readonly
            ))
        
        settings_groups = [
            SettingsGroupResponse(category=category, settings=settings_list)
            for category, settings_list in settings_by_category.items()
        ]
        
        return AllSettingsResponse(settings_groups=settings_groups)

    def update_setting(self, setting_id: str, new_value: Any) -> PlatformSettingResponse:
        """Update a platform setting."""
        
        setting = self.db.query(PlatformSettings).filter(PlatformSettings.id == setting_id).first()
        if not setting:
            raise ValueError("Setting not found")
        
        if setting.is_readonly:
            raise ValueError("Setting is read-only")
        
        # Validate value based on constraints
        if setting.data_type == "integer" and not isinstance(new_value, int):
            try:
                new_value = int(new_value)
            except (ValueError, TypeError):
                raise ValueError("Value must be an integer")
        
        if setting.data_type == "float" and not isinstance(new_value, (int, float)):
            try:
                new_value = float(new_value)
            except (ValueError, TypeError):
                raise ValueError("Value must be a number")
        
        if setting.data_type == "boolean" and not isinstance(new_value, bool):
            if isinstance(new_value, str):
                new_value = new_value.lower() in ("true", "1", "yes", "on")
            else:
                new_value = bool(new_value)
        
        # Check min/max constraints
        if setting.min_value is not None and isinstance(new_value, (int, float)):
            if new_value < setting.min_value:
                raise ValueError(f"Value must be at least {setting.min_value}")
        
        if setting.max_value is not None and isinstance(new_value, (int, float)):
            if new_value > setting.max_value:
                raise ValueError(f"Value must be at most {setting.max_value}")
        
        # Check allowed values
        if setting.allowed_values and new_value not in setting.allowed_values:
            raise ValueError(f"Value must be one of: {setting.allowed_values}")
        
        # Update the setting
        setting.value = new_value
        setting.updated_at = datetime.utcnow()
        self.db.commit()
        
        return PlatformSettingResponse(
            id=setting.id,
            category=setting.category,
            key=setting.key,
            value=setting.value,
            description=setting.description,
            data_type=setting.data_type,
            min_value=setting.min_value,
            max_value=setting.max_value,
            allowed_values=setting.allowed_values,
            is_sensitive=setting.is_sensitive,
            requires_restart=setting.requires_restart,
            is_readonly=setting.is_readonly
        )

    # ============================================================================
    # System Health & Metrics
    # ============================================================================

    def get_system_health(self) -> SystemHealthResponse:
        """Get current system health metrics."""
        
        # Database status
        try:
            self.db.execute("SELECT 1")
            db_status = "healthy"
        except Exception:
            db_status = "error"
        
        # System metrics
        memory = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=1)
        disk = psutil.disk_usage('/')
        
        # API response time (mock - in real app, get from metrics)
        api_response_time = 0.15  # 150ms
        
        # Active connections count
        active_connections = self.db.query(Connection).filter(
            Connection.status == "connected"
        ).count()
        
        # Uptime (mock - in real app, track from app start)
        uptime_seconds = int(time.time() % 86400)  # Mock: seconds since midnight
        
        return SystemHealthResponse(
            database_status=db_status,
            api_response_time=api_response_time,
            active_connections=active_connections,
            memory_usage_percent=memory.percent,
            cpu_usage_percent=cpu_percent,
            disk_usage_percent=disk.percent,
            uptime_seconds=uptime_seconds,
            last_backup=datetime.utcnow() - timedelta(hours=6)  # Mock
        )

    def get_usage_metrics(self) -> UsageMetrics:
        """Get platform usage metrics."""
        
        today = datetime.utcnow().date()
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Mock API call metrics (in real app, get from metrics table)
        api_calls_today = 15420
        api_calls_month = 456789
        avg_response_time = 0.15
        error_rate = 0.02
        
        # Active users
        active_users_today = self.db.query(func.count(User.id.distinct())).filter(
            User.last_login_at >= datetime.combine(today, datetime.min.time()),
            User.is_active == True
        ).scalar() or 0
        
        active_users_month = self.db.query(func.count(User.id.distinct())).filter(
            User.last_login_at >= month_start,
            User.is_active == True
        ).scalar() or 0
        
        return UsageMetrics(
            total_api_calls_today=api_calls_today,
            total_api_calls_this_month=api_calls_month,
            average_response_time=avg_response_time,
            error_rate_percent=error_rate * 100,
            active_users_today=active_users_today,
            active_users_this_month=active_users_month
        )

    def get_admin_dashboard_data(self) -> AdminDashboardResponse:
        """Get comprehensive admin dashboard data."""
        
        system_health = self.get_system_health()
        usage_metrics = self.get_usage_metrics()
        
        # Basic counts
        total_clients = self.db.query(Organization).count()
        total_users = self.db.query(User).filter(User.is_active == True).count()
        total_connections = self.db.query(Connection).filter(Connection.status == "connected").count()
        
        # Monthly revenue
        active_subscriptions = self.db.query(Subscription).filter(
            Subscription.status.in_(["active", "trial"])
        ).all()
        monthly_revenue = sum(sub.plan.price_monthly for sub in active_subscriptions if sub.plan)
        
        # Recent signups (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_signups = self.db.query(User).filter(User.created_at >= week_ago).count()
        
        # Alerts count (mock - in real app, count actual alerts)
        alerts_count = 3
        
        return AdminDashboardResponse(
            system_health=system_health,
            usage_metrics=usage_metrics,
            total_clients=total_clients,
            total_users=total_users,
            total_connections=total_connections,
            monthly_revenue=monthly_revenue,
            recent_signups=recent_signups,
            alerts_count=alerts_count
        )

    # ============================================================================
    # User Management
    # ============================================================================

    def get_all_users(
        self,
        search: Optional[str] = None,
        role_filter: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> AdminUsersListResponse:
        """Get all users with admin details."""
        
        query = self.db.query(User).join(Organization)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.email.ilike(search_term),
                    User.name.ilike(search_term),
                    Organization.name.ilike(search_term)
                )
            )
        
        if role_filter and role_filter != "all":
            query = query.filter(User.role == role_filter)
        
        total_count = query.count()
        users = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()
        
        # Get user count by role
        users_by_role = {}
        role_query = self.db.query(User.role, func.count(User.id)).group_by(User.role)
        for role, count in role_query.all():
            users_by_role[role] = count
        
        user_responses = [
            AdminUserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                role=user.role,
                organization_name=user.organization.name,
                organization_id=user.org_id,
                is_active=user.is_active,
                is_verified=user.is_verified,
                last_login_at=user.last_login_at,
                created_at=user.created_at
            )
            for user in users
        ]
        
        return AdminUsersListResponse(
            users=user_responses,
            total_count=total_count,
            users_by_role=users_by_role
        )

    # ============================================================================
    # Audit Logging
    # ============================================================================

    def log_admin_action(
        self,
        user_id: Optional[str],
        user_email: Optional[str],
        user_role: Optional[str],
        action: str,
        resource_type: str,
        resource_id: Optional[str],
        description: str,
        changes: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None
    ):
        """Log an admin action to the audit trail."""
        
        audit_log = AuditLog(
            user_id=user_id,
            user_email=user_email,
            user_role=user_role,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
            changes=changes,
            action_metadata={},
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_message=error_message
        )
        
        self.db.add(audit_log)
        self.db.commit()

    def get_audit_logs(
        self,
        limit: int = 100,
        offset: int = 0,
        user_filter: Optional[str] = None,
        action_filter: Optional[str] = None,
        resource_filter: Optional[str] = None
    ) -> AuditLogsListResponse:
        """Get audit logs with filtering."""
        
        query = self.db.query(AuditLog)
        
        if user_filter:
            query = query.filter(AuditLog.user_email.ilike(f"%{user_filter}%"))
        
        if action_filter:
            query = query.filter(AuditLog.action.ilike(f"%{action_filter}%"))
        
        if resource_filter:
            query = query.filter(AuditLog.resource_type.ilike(f"%{resource_filter}%"))
        
        total_count = query.count()
        logs = query.order_by(desc(AuditLog.timestamp)).offset(offset).limit(limit).all()
        
        log_responses = [
            AuditLogResponse(
                id=log.id,
                user_email=log.user_email,
                user_role=log.user_role,
                action=log.action,
                resource_type=log.resource_type,
                resource_id=log.resource_id,
                description=log.description,
                changes=log.changes,
                ip_address=log.ip_address,
                success=log.success,
                error_message=log.error_message,
                timestamp=log.timestamp
            )
            for log in logs
        ]
        
        return AuditLogsListResponse(
            logs=log_responses,
            total_count=total_count
        )
