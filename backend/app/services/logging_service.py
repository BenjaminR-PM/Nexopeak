"""
Logging service with high-level functions for application components.
"""

import time
import functools
from typing import Any, Callable, Dict, Optional
from contextlib import contextmanager

from app.core.logging_config import LogModule, LogLevel, get_logger


class LoggingService:
    """Service for application-wide logging operations."""
    
    def __init__(self):
        self.logger = get_logger()
    
    # === AUTHENTICATION LOGGING ===
    
    def log_user_login(self, user_id: str, organization_id: str = None, 
                      method: str = "email", success: bool = True):
        """Log user login attempts."""
        self.logger.log_auth_event(
            "login",
            user_id=user_id,
            organization_id=organization_id,
            success=success,
            additional_data={"method": method}
        )
    
    def log_user_logout(self, user_id: str, organization_id: str = None):
        """Log user logout."""
        self.logger.log_auth_event(
            "logout",
            user_id=user_id,
            organization_id=organization_id,
            success=True
        )
    
    def log_demo_access(self, session_id: str = None):
        """Log demo account access."""
        self.logger.info(
            LogModule.DEMO_SYSTEM,
            "Demo account accessed",
            additional_data={"session_id": session_id}
        )
    
    def log_registration(self, user_id: str, organization_id: str = None, 
                        method: str = "email"):
        """Log new user registration."""
        self.logger.info(
            LogModule.USER_MGMT,
            f"New user registered: {user_id}",
            user_id=user_id,
            organization_id=organization_id,
            additional_data={"method": method}
        )
    
    # === ANALYTICS LOGGING ===
    
    def log_ga4_sync(self, organization_id: str, property_id: str, 
                    records_processed: int, success: bool = True):
        """Log GA4 data synchronization."""
        module = LogModule.GA4_INTEGRATION
        message = f"GA4 sync for property {property_id}: {records_processed} records"
        
        if success:
            self.logger.info(module, message, organization_id=organization_id,
                           additional_data={"property_id": property_id, "records": records_processed})
        else:
            self.logger.error(module, f"Failed - {message}", organization_id=organization_id,
                            additional_data={"property_id": property_id, "records": records_processed})
    
    def log_ga4_integration(self, module: LogModule, message: str, **kwargs):
        """Log GA4 integration events."""
        self.logger.info(module, message, **kwargs)
    
    def log_ga4_error(self, module: LogModule, message: str, error: str = None, **kwargs):
        """Log GA4 integration errors."""
        if error:
            self.logger.error(module, f"{message}: {error}", **kwargs)
        else:
            self.logger.error(module, message, **kwargs)
    
    def log_search_console_sync(self, organization_id: str, site_url: str, 
                               records_processed: int, success: bool = True):
        """Log Search Console data synchronization."""
        module = LogModule.SEARCH_CONSOLE
        message = f"Search Console sync for {site_url}: {records_processed} records"
        
        if success:
            self.logger.info(module, message, organization_id=organization_id,
                           additional_data={"site_url": site_url, "records": records_processed})
        else:
            self.logger.error(module, f"Failed - {message}", organization_id=organization_id,
                            additional_data={"site_url": site_url, "records": records_processed})
    
    def log_data_processing(self, job_type: str, organization_id: str = None, 
                           duration_ms: float = None, success: bool = True):
        """Log data processing operations."""
        message = f"Data processing job: {job_type}"
        
        if success:
            self.logger.info(LogModule.DATA_PROCESSING, message,
                           organization_id=organization_id, duration_ms=duration_ms,
                           additional_data={"job_type": job_type})
        else:
            self.logger.error(LogModule.DATA_PROCESSING, f"Failed - {message}",
                            organization_id=organization_id, duration_ms=duration_ms,
                            additional_data={"job_type": job_type})
    
    # === CAMPAIGN LOGGING ===
    
    def log_campaign_analysis(self, campaign_id: str, user_id: str = None, 
                             analysis_type: str = "standard", duration_ms: float = None):
        """Log campaign analysis operations."""
        self.logger.log_campaign_event(
            "analysis_completed",
            campaign_id=campaign_id,
            user_id=user_id,
            duration_ms=duration_ms,
            additional_data={"analysis_type": analysis_type}
        )
    
    def log_campaign_generation(self, user_id: str, campaign_type: str, 
                               success: bool = True, campaign_id: str = None):
        """Log AI campaign generation."""
        message = f"Campaign generation: {campaign_type}"
        module = LogModule.CAMPAIGN_GENERATOR
        
        if success:
            self.logger.info(module, f"Success - {message}", user_id=user_id,
                           additional_data={"campaign_type": campaign_type, "campaign_id": campaign_id})
        else:
            self.logger.error(module, f"Failed - {message}", user_id=user_id,
                            additional_data={"campaign_type": campaign_type})
    
    def log_insights_generation(self, organization_id: str, insights_count: int, 
                               data_sources: list, duration_ms: float = None):
        """Log insights engine operations."""
        self.logger.info(
            LogModule.INSIGHTS_ENGINE,
            f"Generated {insights_count} insights from {len(data_sources)} sources",
            organization_id=organization_id,
            duration_ms=duration_ms,
            additional_data={"insights_count": insights_count, "data_sources": data_sources}
        )
    
    # === EXTERNAL API LOGGING ===
    
    def log_google_api_call(self, api_name: str, endpoint: str, status_code: int, 
                           duration_ms: float, organization_id: str = None):
        """Log Google API calls."""
        self.logger.log_external_api(
            f"Google {api_name}",
            endpoint,
            status_code,
            duration_ms,
            organization_id=organization_id
        )
    
    def log_sendgrid_email(self, recipient: str, template: str, success: bool = True,
                          organization_id: str = None):
        """Log SendGrid email operations."""
        message = f"Email sent via SendGrid: {template} to {recipient}"
        module = LogModule.SENDGRID
        
        if success:
            self.logger.info(module, message, organization_id=organization_id,
                           additional_data={"recipient": recipient, "template": template})
        else:
            self.logger.error(module, f"Failed - {message}", organization_id=organization_id,
                            additional_data={"recipient": recipient, "template": template})
    
    def log_slack_notification(self, channel: str, message_type: str, success: bool = True,
                              organization_id: str = None):
        """Log Slack notifications."""
        message = f"Slack notification: {message_type} to {channel}"
        module = LogModule.SLACK
        
        if success:
            self.logger.info(module, message, organization_id=organization_id,
                           additional_data={"channel": channel, "message_type": message_type})
        else:
            self.logger.error(module, f"Failed - {message}", organization_id=organization_id,
                            additional_data={"channel": channel, "message_type": message_type})
    
    # === SYSTEM LOGGING ===
    
    def log_system_startup(self, component: str, version: str = None):
        """Log system component startup."""
        message = f"Starting {component}"
        if version:
            message += f" v{version}"
        
        self.logger.info(LogModule.STARTUP, message,
                        additional_data={"component": component, "version": version})
    
    def log_system_shutdown(self, component: str):
        """Log system component shutdown."""
        self.logger.info(LogModule.STARTUP, f"Shutting down {component}",
                        additional_data={"component": component})
    
    def log_database_connection(self, database_type: str, status: str, duration_ms: float = None):
        """Log database connection events."""
        message = f"Database connection: {database_type} - {status}"
        
        if status.lower() in ["connected", "success"]:
            self.logger.info(LogModule.DATABASE, message, duration_ms=duration_ms,
                           additional_data={"database_type": database_type, "status": status})
        else:
            self.logger.error(LogModule.DATABASE, message, duration_ms=duration_ms,
                            additional_data={"database_type": database_type, "status": status})
    
    def log_health_check(self, component: str, status: str, checks: Dict[str, bool] = None):
        """Log health check results."""
        message = f"Health check: {component} - {status}"
        
        if status.lower() == "healthy":
            self.logger.info(LogModule.HEALTH_CHECK, message,
                           additional_data={"component": component, "checks": checks})
        else:
            self.logger.warning(LogModule.HEALTH_CHECK, message,
                              additional_data={"component": component, "checks": checks})
    
    def log_performance_metric(self, metric_name: str, value: float, unit: str = "ms",
                             context: Dict[str, Any] = None):
        """Log performance metrics."""
        self.logger.info(
            LogModule.PERFORMANCE,
            f"Performance metric: {metric_name} = {value}{unit}",
            additional_data={"metric": metric_name, "value": value, "unit": unit, "context": context}
        )
    
    # === BACKGROUND TASKS LOGGING ===
    
    def log_celery_task(self, task_name: str, task_id: str, status: str, 
                       duration_ms: float = None, result: Any = None):
        """Log Celery task execution."""
        message = f"Celery task {task_name} [{task_id}]: {status}"
        
        if status.lower() in ["success", "completed"]:
            self.logger.info(LogModule.CELERY, message, duration_ms=duration_ms,
                           additional_data={"task_name": task_name, "task_id": task_id, "result": str(result)})
        else:
            self.logger.error(LogModule.CELERY, message, duration_ms=duration_ms,
                            additional_data={"task_name": task_name, "task_id": task_id})
    
    def log_scheduled_job(self, job_name: str, status: str, next_run: str = None,
                         duration_ms: float = None):
        """Log scheduled job execution."""
        message = f"Scheduled job {job_name}: {status}"
        
        if status.lower() in ["success", "completed"]:
            self.logger.info(LogModule.SCHEDULER, message, duration_ms=duration_ms,
                           additional_data={"job_name": job_name, "next_run": next_run})
        else:
            self.logger.error(LogModule.SCHEDULER, message, duration_ms=duration_ms,
                            additional_data={"job_name": job_name, "next_run": next_run})
    
    # === DECORATORS AND CONTEXT MANAGERS ===
    
    def log_function_call(self, module: LogModule):
        """Decorator to log function calls with execution time."""
        def decorator(func: Callable):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                function_name = f"{func.__module__}.{func.__name__}"
                
                self.logger.debug(module, f"Function called: {function_name}")
                
                try:
                    result = func(*args, **kwargs)
                    duration_ms = (time.time() - start_time) * 1000
                    
                    self.logger.debug(module, f"Function completed: {function_name}",
                                    duration_ms=duration_ms)
                    return result
                    
                except Exception as e:
                    duration_ms = (time.time() - start_time) * 1000
                    self.logger.log_error_with_context(
                        module, e,
                        context={"function": function_name, "duration_ms": duration_ms}
                    )
                    raise
                    
            return wrapper
        return decorator
    
    @contextmanager
    def log_operation(self, module: LogModule, operation_name: str, **context):
        """Context manager to log operations with timing."""
        start_time = time.time()
        self.logger.info(module, f"Starting operation: {operation_name}",
                        additional_data=context)
        
        try:
            yield
            duration_ms = (time.time() - start_time) * 1000
            self.logger.info(module, f"Completed operation: {operation_name}",
                           duration_ms=duration_ms, additional_data=context)
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            self.logger.log_error_with_context(
                module, e,
                context={**context, "operation": operation_name, "duration_ms": duration_ms}
            )
            raise
    
    # === ERROR LOGGING ===
    
    def log_validation_error(self, module: LogModule, field: str, value: Any, 
                           error_message: str, user_id: str = None):
        """Log validation errors."""
        self.logger.warning(
            module,
            f"Validation error in field '{field}': {error_message}",
            user_id=user_id,
            additional_data={"field": field, "value": str(value), "error": error_message}
        )
    
    def log_business_logic_error(self, module: LogModule, operation: str, 
                               error_message: str, context: Dict[str, Any] = None):
        """Log business logic errors."""
        self.logger.error(
            module,
            f"Business logic error in {operation}: {error_message}",
            additional_data={"operation": operation, "context": context}
        )
    
    def log_security_event(self, event_type: str, severity: str = "medium", 
                          user_id: str = None, details: Dict[str, Any] = None):
        """Log security-related events."""
        message = f"Security event: {event_type}"
        
        if severity.lower() in ["high", "critical"]:
            self.logger.critical(LogModule.SECURITY, message, user_id=user_id,
                               additional_data={"event_type": event_type, "severity": severity, "details": details})
        elif severity.lower() == "medium":
            self.logger.warning(LogModule.SECURITY, message, user_id=user_id,
                              additional_data={"event_type": event_type, "severity": severity, "details": details})
        else:
            self.logger.info(LogModule.SECURITY, message, user_id=user_id,
                           additional_data={"event_type": event_type, "severity": severity, "details": details})


# Global logging service instance
logging_service = LoggingService()


def get_logging_service() -> LoggingService:
    """Get the global logging service instance."""
    return logging_service
