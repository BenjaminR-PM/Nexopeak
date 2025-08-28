"""
Log viewer API endpoints for system monitoring and debugging.
"""

import os
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.logging_config import LogModule, LogLevel, LogEntry
from app.services.logging_service import get_logging_service


router = APIRouter()
logging_service = get_logging_service()


class LogQueryParams(BaseModel):
    """Parameters for log queries."""
    module: Optional[LogModule] = None
    level: Optional[LogLevel] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    search_text: Optional[str] = None
    limit: int = 100
    offset: int = 0


class LogSearchResponse(BaseModel):
    """Response model for log search."""
    logs: List[LogEntry]
    total_count: int
    query_params: LogQueryParams


class LogStatsResponse(BaseModel):
    """Response model for log statistics."""
    total_logs: int
    logs_by_level: Dict[str, int]
    logs_by_module: Dict[str, int]
    error_rate: float
    recent_errors: List[LogEntry]


@router.get("/search", response_model=LogSearchResponse)
async def search_logs(
    module: Optional[LogModule] = Query(None, description="Filter by module"),
    level: Optional[LogLevel] = Query(None, description="Filter by log level"),
    start_time: Optional[datetime] = Query(None, description="Start time for filtering"),
    end_time: Optional[datetime] = Query(None, description="End time for filtering"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    organization_id: Optional[str] = Query(None, description="Filter by organization ID"),
    search_text: Optional[str] = Query(None, description="Search in log messages"),
    limit: int = Query(100, description="Maximum number of logs to return"),
    offset: int = Query(0, description="Offset for pagination"),
):
    """Search and filter application logs."""
    try:
        query_params = LogQueryParams(
            module=module,
            level=level,
            start_time=start_time,
            end_time=end_time,
            user_id=user_id,
            organization_id=organization_id,
            search_text=search_text,
            limit=limit,
            offset=offset
        )
        
        # Read logs from file
        logs_dir = Path("logs")
        log_file = logs_dir / "nexopeak.jsonl"
        
        if not log_file.exists():
            return LogSearchResponse(
                logs=[],
                total_count=0,
                query_params=query_params
            )
        
        filtered_logs = []
        total_count = 0
        
        with open(log_file, 'r') as f:
            for line in f:
                try:
                    log_data = json.loads(line.strip())
                    log_entry = LogEntry(**log_data)
                    
                    # Apply filters
                    if module and log_entry.module != module:
                        continue
                    
                    if level and log_entry.level != level:
                        continue
                    
                    if start_time and log_entry.timestamp < start_time:
                        continue
                    
                    if end_time and log_entry.timestamp > end_time:
                        continue
                    
                    if user_id and log_entry.user_id != user_id:
                        continue
                    
                    if organization_id and log_entry.organization_id != organization_id:
                        continue
                    
                    if search_text and search_text.lower() not in log_entry.message.lower():
                        continue
                    
                    total_count += 1
                    
                    # Apply pagination
                    if total_count > offset and len(filtered_logs) < limit:
                        filtered_logs.append(log_entry)
                        
                except json.JSONDecodeError:
                    continue
                except Exception:
                    continue
        
        logging_service.logger.info(
            LogModule.API,
            f"Log search performed: {len(filtered_logs)} results",
            additional_data={"query_params": query_params.dict()}
        )
        
        return LogSearchResponse(
            logs=filtered_logs,
            total_count=total_count,
            query_params=query_params
        )
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "search_logs", "params": query_params.dict() if 'query_params' in locals() else {}}
        )
        raise HTTPException(status_code=500, detail=f"Error searching logs: {str(e)}")


@router.get("/stats", response_model=LogStatsResponse)
async def get_log_stats(
    hours: int = Query(24, description="Number of hours to analyze")
):
    """Get log statistics and analytics."""
    try:
        logs_dir = Path("logs")
        log_file = logs_dir / "nexopeak.jsonl"
        
        if not log_file.exists():
            return LogStatsResponse(
                total_logs=0,
                logs_by_level={},
                logs_by_module={},
                error_rate=0.0,
                recent_errors=[]
            )
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        total_logs = 0
        logs_by_level = {}
        logs_by_module = {}
        recent_errors = []
        error_count = 0
        
        with open(log_file, 'r') as f:
            for line in f:
                try:
                    log_data = json.loads(line.strip())
                    log_entry = LogEntry(**log_data)
                    
                    # Only analyze recent logs
                    if log_entry.timestamp < cutoff_time:
                        continue
                    
                    total_logs += 1
                    
                    # Count by level
                    level_str = log_entry.level.value
                    logs_by_level[level_str] = logs_by_level.get(level_str, 0) + 1
                    
                    # Count by module
                    module_str = log_entry.module.value
                    logs_by_module[module_str] = logs_by_module.get(module_str, 0) + 1
                    
                    # Collect errors
                    if log_entry.level in [LogLevel.ERROR, LogLevel.CRITICAL]:
                        error_count += 1
                        if len(recent_errors) < 10:
                            recent_errors.append(log_entry)
                            
                except json.JSONDecodeError:
                    continue
                except Exception:
                    continue
        
        error_rate = (error_count / total_logs * 100) if total_logs > 0 else 0.0
        
        logging_service.logger.info(
            LogModule.API,
            f"Log stats generated: {total_logs} logs analyzed",
            additional_data={"hours": hours, "error_rate": error_rate}
        )
        
        return LogStatsResponse(
            total_logs=total_logs,
            logs_by_level=logs_by_level,
            logs_by_module=logs_by_module,
            error_rate=error_rate,
            recent_errors=recent_errors
        )
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "get_log_stats", "hours": hours}
        )
        raise HTTPException(status_code=500, detail=f"Error getting log stats: {str(e)}")


@router.get("/modules")
async def get_log_modules():
    """Get list of available log modules."""
    try:
        modules = [{"value": module.value, "name": module.value.replace("_", " ").title()} 
                  for module in LogModule]
        
        return {"modules": modules}
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "get_log_modules"}
        )
        raise HTTPException(status_code=500, detail=f"Error getting modules: {str(e)}")


@router.get("/levels")
async def get_log_levels():
    """Get list of available log levels."""
    try:
        levels = [{"value": level.value, "name": level.value.title()} 
                 for level in LogLevel]
        
        return {"levels": levels}
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "get_log_levels"}
        )
        raise HTTPException(status_code=500, detail=f"Error getting levels: {str(e)}")


@router.delete("/cleanup")
async def cleanup_old_logs(
    days: int = Query(30, description="Delete logs older than this many days")
):
    """Clean up old log files."""
    try:
        logs_dir = Path("logs")
        cutoff_time = datetime.now() - timedelta(days=days)
        
        deleted_files = []
        total_size_freed = 0
        
        if logs_dir.exists():
            for log_file in logs_dir.glob("*.log*"):
                try:
                    file_mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
                    if file_mtime < cutoff_time:
                        file_size = log_file.stat().st_size
                        log_file.unlink()
                        deleted_files.append(str(log_file))
                        total_size_freed += file_size
                        
                except Exception:
                    continue
        
        logging_service.logger.info(
            LogModule.API,
            f"Log cleanup completed: {len(deleted_files)} files deleted",
            additional_data={
                "days": days,
                "files_deleted": len(deleted_files),
                "size_freed_mb": total_size_freed / (1024 * 1024)
            }
        )
        
        return {
            "message": f"Deleted {len(deleted_files)} old log files",
            "files_deleted": deleted_files,
            "size_freed_mb": total_size_freed / (1024 * 1024)
        }
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "cleanup_old_logs", "days": days}
        )
        raise HTTPException(status_code=500, detail=f"Error cleaning up logs: {str(e)}")


@router.get("/health")
async def check_logging_health():
    """Check the health of the logging system."""
    try:
        logs_dir = Path("logs")
        health_data = {
            "logs_directory_exists": logs_dir.exists(),
            "main_log_file_exists": (logs_dir / "nexopeak.jsonl").exists(),
            "log_files_count": len(list(logs_dir.glob("*.log*"))) if logs_dir.exists() else 0,
            "total_log_size_mb": 0,
            "recent_log_activity": False
        }
        
        if logs_dir.exists():
            total_size = sum(f.stat().st_size for f in logs_dir.glob("*.log*") if f.is_file())
            health_data["total_log_size_mb"] = total_size / (1024 * 1024)
            
            # Check for recent activity (logs in last 5 minutes)
            cutoff_time = datetime.now() - timedelta(minutes=5)
            main_log = logs_dir / "nexopeak.jsonl"
            if main_log.exists():
                file_mtime = datetime.fromtimestamp(main_log.stat().st_mtime)
                health_data["recent_log_activity"] = file_mtime > cutoff_time
        
        status = "healthy" if all([
            health_data["logs_directory_exists"],
            health_data["main_log_file_exists"],
            health_data["total_log_size_mb"] < 1000  # Less than 1GB
        ]) else "unhealthy"
        
        logging_service.log_health_check("logging_system", status, health_data)
        
        return {
            "status": status,
            "details": health_data
        }
        
    except Exception as e:
        logging_service.logger.log_error_with_context(
            LogModule.API,
            e,
            context={"operation": "check_logging_health"}
        )
        raise HTTPException(status_code=500, detail=f"Error checking logging health: {str(e)}")
