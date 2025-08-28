# 📊 Nexopeak Comprehensive Logging System

## 🎯 **Overview**

We have implemented a comprehensive, structured logging system for the Nexopeak application that provides detailed monitoring, debugging capabilities, and system insights beyond basic Heroku logs.

## 🏗️ **System Architecture**

### **Main Application Modules**

| **Category** | **Modules** | **Description** |
|-------------|-------------|-----------------|
| **🏗️ Core System** | `startup`, `database`, `security`, `config` | System initialization, DB operations, security events |
| **🔐 Authentication** | `auth`, `user_mgmt`, `organization`, `demo_system` | User login/logout, registration, demo access |
| **📊 Analytics & Data** | `analytics`, `ga4_integration`, `search_console`, `data_processing`, `etl` | Data sync, processing, external API calls |
| **🎯 Campaign Management** | `campaign_analyzer`, `campaign_generator`, `insights_engine` | AI-powered campaign operations |
| **🔗 External Integrations** | `google_apis`, `sendgrid`, `slack` | Third-party service interactions |
| **⚙️ Background Services** | `celery`, `scheduler` | Async tasks, scheduled jobs |
| **🌐 API & Frontend** | `api`, `frontend` | HTTP requests, UI interactions |
| **📈 Monitoring** | `health_check`, `performance` | System health, performance metrics |

### **Log Levels**

| **Level** | **Purpose** | **Examples** |
|-----------|-------------|-------------|
| `DEBUG` | Development debugging | Function entry/exit, variable states |
| `INFO` | Normal operations | User login, data sync completion, API calls |
| `WARNING` | Potential issues | Failed external API calls, validation errors |
| `ERROR` | Application errors | Database failures, authentication errors |
| `CRITICAL` | System failures | Security breaches, system crashes |

## 🔧 **Implementation Details**

### **Backend Components**

#### 1. **Core Logging Infrastructure** (`app/core/logging_config.py`)
- **Structured JSON logging** with rotating file handlers
- **Module-specific log files** for focused debugging
- **Request ID tracking** for tracing user sessions
- **Performance timing** for operation monitoring

#### 2. **Logging Service** (`app/services/logging_service.py`)
- **High-level logging functions** for common operations
- **Context-aware logging** with user/organization tracking
- **Decorators** for automatic function timing
- **Error logging** with full stack traces and context

#### 3. **API Endpoints** (`app/api/v1/endpoints/logs.py`)
- **Log search and filtering** by module, level, time, user
- **Real-time log statistics** and analytics
- **Log health monitoring** and system status
- **Log cleanup** and maintenance operations

### **Frontend Components**

#### 1. **Log Viewer Dashboard** (`frontend/app/dashboard/logs/page.tsx`)
- **Real-time log viewing** with auto-refresh
- **Advanced filtering** by module, level, user, search text
- **Log statistics** with error rate monitoring
- **Export functionality** for offline analysis

## 📈 **Features & Capabilities**

### **🔍 Monitoring & Debugging**

1. **Real-time Log Streaming**
   - Auto-refresh dashboard
   - Live error monitoring
   - Performance metric tracking

2. **Advanced Search & Filtering**
   - Search by message content
   - Filter by module, level, user, organization
   - Time-based filtering
   - Request ID tracing

3. **Analytics & Insights**
   - Error rate calculation
   - Logs by module/level distribution
   - Performance metrics tracking
   - Health check monitoring

### **🛡️ Security & Compliance**

1. **Audit Trail**
   - User authentication events
   - Security-related activities
   - Data access logging
   - Admin operations tracking

2. **Data Privacy**
   - Configurable data masking
   - Retention policies
   - Secure log storage

### **⚡ Performance & Scalability**

1. **Efficient Storage**
   - Rotating log files (max 10MB)
   - Compressed historical logs
   - Automated cleanup

2. **Fast Retrieval**
   - Indexed JSON logs
   - Module-specific files
   - Optimized queries

## 🚀 **Usage Examples**

### **Backend Integration**

```python
from app.services.logging_service import get_logging_service

logging_service = get_logging_service()

# Log user authentication
logging_service.log_user_login(
    user_id="user123",
    organization_id="org456",
    method="email",
    success=True
)

# Log API operations with timing
with logging_service.log_operation(LogModule.API, "user_registration"):
    # Your operation here
    user = create_user(user_data)

# Log external API calls
logging_service.log_google_api_call(
    "Analytics", 
    "/reports", 
    status_code=200, 
    duration_ms=150.5
)
```

### **Frontend Log Viewing**

Access the log viewer at: `https://your-app.herokuapp.com/dashboard/logs`

**Features:**
- 📊 Real-time statistics dashboard
- 🔍 Advanced search and filtering
- 📥 Export logs as JSON
- 🔄 Auto-refresh capability
- 📈 Error rate monitoring

## 📂 **Log Storage Structure**

```
logs/
├── nexopeak.jsonl          # Main structured logs
├── auth.log               # Authentication events
├── database.log           # Database operations
├── api.log               # API requests/responses
├── campaign_analyzer.log  # Campaign operations
├── ga4_integration.log    # Google Analytics sync
└── error.log             # Error-only logs
```

## 🔧 **Configuration**

### **Environment Variables**

```bash
# Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_LEVEL=INFO

# Log retention (days)
LOG_RETENTION_DAYS=30

# Enable/disable specific modules
LOG_MODULES_ENABLED=auth,api,database,analytics
```

### **Log Rotation**

- **File size limit**: 10MB per file
- **Backup count**: 5 files
- **Automatic cleanup**: Logs older than 30 days
- **Compression**: Historical logs are compressed

## 📊 **Monitoring & Alerts**

### **Key Metrics Tracked**

1. **Error Rate**: Percentage of ERROR/CRITICAL logs
2. **Response Times**: API and database operation timing
3. **User Activity**: Login/logout patterns
4. **System Health**: Service availability and performance
5. **External API Status**: Third-party service reliability

### **Alert Conditions**

- **High Error Rate**: >5% errors in 1 hour
- **Slow Performance**: >2s average response time
- **Authentication Failures**: >10 failed logins per user
- **System Errors**: Any CRITICAL level logs

## 🔄 **API Endpoints**

| **Endpoint** | **Method** | **Description** |
|-------------|------------|-----------------|
| `/api/v1/logs/search` | GET | Search and filter logs |
| `/api/v1/logs/stats` | GET | Get log statistics |
| `/api/v1/logs/modules` | GET | List available modules |
| `/api/v1/logs/levels` | GET | List log levels |
| `/api/v1/logs/cleanup` | DELETE | Clean up old logs |
| `/api/v1/logs/health` | GET | Check logging system health |

## 🎯 **Benefits**

### **For Development**
- **Faster debugging** with structured, searchable logs
- **Performance insights** with automatic timing
- **Clear error tracking** with full context

### **For Operations**
- **Real-time monitoring** of system health
- **Proactive issue detection** with error rate tracking
- **Comprehensive audit trails** for compliance

### **For Business**
- **User behavior insights** from authentication logs
- **Service reliability metrics** from API monitoring
- **Data processing transparency** from ETL logs

## 🚀 **Future Enhancements**

1. **Real-time Alerts**: Email/Slack notifications for critical events
2. **Log Analytics**: Machine learning for anomaly detection
3. **Integration**: Connect with external monitoring tools (Datadog, New Relic)
4. **Mobile App**: Log monitoring on mobile devices
5. **Custom Dashboards**: Personalized monitoring views

---

The Nexopeak logging system provides comprehensive visibility into application behavior, enabling faster debugging, proactive monitoring, and better understanding of system performance beyond what Heroku logs alone can provide.
