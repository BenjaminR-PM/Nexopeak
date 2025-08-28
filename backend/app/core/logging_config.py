"""
Comprehensive logging system for Nexopeak application.
Provides structured logging with module tracking, level filtering, and monitoring capabilities.
"""

import logging
import logging.handlers
import json
import os
import sys
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional
from pathlib import Path

from pydantic import BaseModel


class LogLevel(str, Enum):
    """Log levels for the application."""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING" 
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class LogModule(str, Enum):
    """Main application modules for tracking."""
    # Core System
    STARTUP = "startup"
    DATABASE = "database"
    SECURITY = "security"
    CONFIG = "config"
    
    # Authentication & User Management
    AUTH = "auth"
    USER_MGMT = "user_mgmt"
    ORGANIZATION = "organization"
    DEMO_SYSTEM = "demo_system"
    
    # Analytics & Data
    ANALYTICS = "analytics"
    GA4_INTEGRATION = "ga4_integration"
    SEARCH_CONSOLE = "search_console"
    DATA_PROCESSING = "data_processing"
    ETL = "etl"
    
    # Campaign Management
    CAMPAIGN_ANALYZER = "campaign_analyzer"
    CAMPAIGN_GENERATOR = "campaign_generator"
    INSIGHTS_ENGINE = "insights_engine"
    
    # External Integrations
    GOOGLE_APIS = "google_apis"
    SENDGRID = "sendgrid"
    SLACK = "slack"
    
    # Background Services
    CELERY = "celery"
    SCHEDULER = "scheduler"
    
    # API & Frontend
    API = "api"
    FRONTEND = "frontend"
    
    # Monitoring
    HEALTH_CHECK = "health_check"
    PERFORMANCE = "performance"


class LogEntry(BaseModel):
    """Structured log entry model."""
    timestamp: datetime
    level: LogLevel
    module: LogModule
    message: str
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    request_id: Optional[str] = None
    additional_data: Optional[Dict[str, Any]] = None
    duration_ms: Optional[float] = None
    status_code: Optional[int] = None
    error_details: Optional[Dict[str, Any]] = None


class NexopeakFormatter(logging.Formatter):
    """Custom formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        # Extract custom fields
        module = getattr(record, 'module', LogModule.API)
        user_id = getattr(record, 'user_id', None)
        org_id = getattr(record, 'organization_id', None)
        request_id = getattr(record, 'request_id', None)
        additional_data = getattr(record, 'additional_data', None)
        duration_ms = getattr(record, 'duration_ms', None)
        status_code = getattr(record, 'status_code', None)
        error_details = getattr(record, 'error_details', None)
        
        log_entry = LogEntry(
            timestamp=datetime.fromtimestamp(record.created),
            level=LogLevel(record.levelname),
            module=module,
            message=record.getMessage(),
            user_id=user_id,
            organization_id=org_id,
            request_id=request_id,
            additional_data=additional_data,
            duration_ms=duration_ms,
            status_code=status_code,
            error_details=error_details
        )
        
        return json.dumps(log_entry.dict(), default=str, ensure_ascii=False)


class NexopeakLogger:
    """Main logger class for the Nexopeak application."""
    
    def __init__(self, name: str = "nexopeak"):
        self.logger = logging.getLogger(name)
        self.setup_logger()
    
    def setup_logger(self):
        """Configure the logger with handlers and formatters."""
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Set base level
        self.logger.setLevel(logging.DEBUG)
        
        # Create logs directory
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        # Console handler with simple format for development
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - [%(module)s] - %(message)s'
        )
        console_handler.setFormatter(console_format)
        
        # File handler with JSON format for structured logging
        file_handler = logging.handlers.RotatingFileHandler(
            log_dir / "nexopeak.jsonl",
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(NexopeakFormatter())
        
        # Module-specific file handlers
        module_handlers = {}
        for module in LogModule:
            handler = logging.handlers.RotatingFileHandler(
                log_dir / f"{module.value}.log",
                maxBytes=5*1024*1024,  # 5MB
                backupCount=3
            )
            handler.setLevel(logging.INFO)
            handler.setFormatter(NexopeakFormatter())
            module_handlers[module] = handler
        
        # Add handlers
        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)
        for handler in module_handlers.values():
            self.logger.addHandler(handler)
        
        self.module_handlers = module_handlers
    
    def _log(self, level: str, module: LogModule, message: str, **kwargs):
        """Internal logging method."""
        extra = {
            'module': module,
            **kwargs
        }
        
        # Log to main logger
        getattr(self.logger, level.lower())(message, extra=extra)
        
        # Log to module-specific handler if it exists
        if module in self.module_handlers:
            module_logger = logging.getLogger(f"nexopeak.{module.value}")
            module_logger.handlers = [self.module_handlers[module]]
            module_logger.setLevel(logging.INFO)
            getattr(module_logger, level.lower())(message, extra=extra)
    
    def debug(self, module: LogModule, message: str, **kwargs):
        """Log debug message."""
        self._log("DEBUG", module, message, **kwargs)
    
    def info(self, module: LogModule, message: str, **kwargs):
        """Log info message."""
        self._log("INFO", module, message, **kwargs)
    
    def warning(self, module: LogModule, message: str, **kwargs):
        """Log warning message."""
        self._log("WARNING", module, message, **kwargs)
    
    def error(self, module: LogModule, message: str, **kwargs):
        """Log error message."""
        self._log("ERROR", module, message, **kwargs)
    
    def critical(self, module: LogModule, message: str, **kwargs):
        """Log critical message."""
        self._log("CRITICAL", module, message, **kwargs)
    
    def log_request(self, module: LogModule, method: str, path: str, 
                   status_code: int, duration_ms: float, **kwargs):
        """Log HTTP request."""
        message = f"{method} {path} - {status_code}"
        self.info(
            module,
            message,
            status_code=status_code,
            duration_ms=duration_ms,
            additional_data={"method": method, "path": path},
            **kwargs
        )
    
    def log_auth_event(self, event_type: str, user_id: str = None, 
                      success: bool = True, **kwargs):
        """Log authentication events."""
        message = f"Auth event: {event_type} - {'SUCCESS' if success else 'FAILED'}"
        level = "info" if success else "warning"
        getattr(self, level)(
            LogModule.AUTH,
            message,
            user_id=user_id,
            additional_data={"event_type": event_type, "success": success},
            **kwargs
        )
    
    def log_db_operation(self, operation: str, table: str, duration_ms: float = None, **kwargs):
        """Log database operations."""
        message = f"DB {operation}: {table}"
        if duration_ms:
            message += f" ({duration_ms:.2f}ms)"
        
        self.info(
            LogModule.DATABASE,
            message,
            duration_ms=duration_ms,
            additional_data={"operation": operation, "table": table},
            **kwargs
        )
    
    def log_external_api(self, service: str, endpoint: str, status_code: int, 
                        duration_ms: float, **kwargs):
        """Log external API calls."""
        message = f"External API: {service} {endpoint} - {status_code}"
        level = "info" if 200 <= status_code < 400 else "warning"
        
        getattr(self, level)(
            LogModule.GOOGLE_APIS if "google" in service.lower() else LogModule.API,
            message,
            status_code=status_code,
            duration_ms=duration_ms,
            additional_data={"service": service, "endpoint": endpoint},
            **kwargs
        )
    
    def log_campaign_event(self, event_type: str, campaign_id: str = None, **kwargs):
        """Log campaign-related events."""
        message = f"Campaign {event_type}"
        if campaign_id:
            message += f": {campaign_id}"
        
        self.info(
            LogModule.CAMPAIGN_ANALYZER,
            message,
            additional_data={"event_type": event_type, "campaign_id": campaign_id},
            **kwargs
        )
    
    def log_error_with_context(self, module: LogModule, error: Exception, 
                              context: Dict[str, Any] = None, **kwargs):
        """Log errors with full context."""
        error_details = {
            "type": type(error).__name__,
            "message": str(error),
            "traceback": logging.traceback.format_exc() if hasattr(logging, 'traceback') else None
        }
        
        self.error(
            module,
            f"Error in {module.value}: {str(error)}",
            error_details=error_details,
            additional_data=context,
            **kwargs
        )


# Global logger instance
logger = NexopeakLogger()


def get_logger() -> NexopeakLogger:
    """Get the global logger instance."""
    return logger


def setup_request_logging():
    """Setup request logging middleware."""
    import uuid
    import time
    from fastapi import Request
    from starlette.middleware.base import BaseHTTPMiddleware
    
    class RequestLoggingMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            # Generate request ID
            request_id = str(uuid.uuid4())
            request.state.request_id = request_id
            
            # Log request start
            start_time = time.time()
            logger.info(
                LogModule.API,
                f"Request started: {request.method} {request.url.path}",
                request_id=request_id,
                additional_data={
                    "method": request.method,
                    "path": str(request.url.path),
                    "query_params": dict(request.query_params),
                    "headers": dict(request.headers)
                }
            )
            
            # Process request
            try:
                response = await call_next(request)
                duration_ms = (time.time() - start_time) * 1000
                
                # Log successful request
                logger.log_request(
                    LogModule.API,
                    request.method,
                    request.url.path,
                    response.status_code,
                    duration_ms,
                    request_id=request_id
                )
                
                return response
                
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                
                # Log failed request
                logger.log_error_with_context(
                    LogModule.API,
                    e,
                    context={
                        "method": request.method,
                        "path": str(request.url.path),
                        "duration_ms": duration_ms
                    },
                    request_id=request_id
                )
                raise
    
    return RequestLoggingMiddleware
