# Nexopeak System Test Suite

A comprehensive testing framework for validating all system features and functionality across the Nexopeak platform.

## 🎯 Overview

The Nexopeak System Test Suite provides a centralized way to run all tests with a single command. It's designed to be easily extensible for future test additions and provides comprehensive reporting and monitoring capabilities.

### Current Test Coverage

- ✅ **User Registration & Authentication** - User signup, login, validation
- ✅ **Campaign Registration & Management** - Campaign Designer, API endpoints, integration
- ✅ **API Performance** - Response times and system health
- 🔄 **UI Testing** - Frontend user interface validation (extensible)
- 🔄 **Security Testing** - Authentication security, API protection (extensible)
- 🔄 **Integration Testing** - End-to-end user journeys (extensible)

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** with required packages
2. **Node.js 18+** with npm
3. **Running servers** (for local testing):
   ```bash
   # Terminal 1: Backend
   cd backend && python main.py
   
   # Terminal 2: Frontend  
   cd frontend && npm run dev
   ```

### Run System Tests

```bash
# Make executable (one time)
chmod +x system-test.sh

# Run all system tests
./system-test.sh

# Run specific test categories
./system-test.sh auth campaigns

# Test Heroku deployment
./system-test.sh --env heroku

# Run with visible browser for debugging
./system-test.sh --headless false --verbose
```

## 📋 Available Commands

### Basic Usage
```bash
./system-test.sh [OPTIONS] [TEST_CATEGORIES...]
```

### Options
- `--env local|heroku` - Test environment (default: local)
- `--backend URL` - Custom backend URL
- `--frontend URL` - Custom frontend URL
- `--verbose` - Enable detailed output
- `--headless true|false` - Browser visibility (default: true)
- `--parallel` - Run tests in parallel where possible
- `--no-cleanup` - Skip test data cleanup
- `--no-report` - Skip generating test report
- `--stop-on-failure` - Stop on first test failure
- `--list` - Show available test categories
- `--help` - Show help message

### Test Categories
- `all` - Run all available tests (default)
- `auth` - Authentication and user management
- `campaigns` - Campaign registration and management
- `api` - Backend API endpoints
- `ui` - Frontend user interface
- `integration` - End-to-end integration tests
- `performance` - Performance and load tests
- `security` - Security and vulnerability tests

## 🧪 Test Categories Detail

### 1. Authentication Tests (`auth`)
**Purpose**: Validate user registration, login, and authentication flows

**Tests Included**:
- User Registration API - Tests signup endpoint and validation
- User Authentication Flow - Tests login/logout in frontend
- Registration Validation - Tests data validation rules
- Duplicate Registration - Tests handling of existing users
- Profile Access - Tests authenticated API access

**Example**:
```bash
./system-test.sh auth
```

### 2. Campaign Tests (`campaigns`)
**Purpose**: Validate campaign creation and management functionality

**Tests Included**:
- Campaign Registration API - Tests `/api/v1/campaigns/from-designer` endpoint
- Campaign Designer UI - Tests complete 5-step designer flow
- Campaign Integration Flow - End-to-end campaign creation testing
- Budget Calculations - Tests budget allocation and calculations
- Data Validation - Tests campaign data validation rules

**Example**:
```bash
./system-test.sh campaigns
```

### 3. API Tests (`api`)
**Purpose**: Validate backend API functionality and performance

**Tests Included**:
- Health Check Endpoints - Tests system status endpoints
- API Response Time - Measures and validates response times
- Authentication Endpoints - Tests auth-related API endpoints
- Error Handling - Tests API error responses

**Example**:
```bash
./system-test.sh api
```

### 4. UI Tests (`ui`)
**Purpose**: Validate frontend user interface and experience

**Tests Included** (Extensible):
- Dashboard Navigation - Tests navigation between sections
- Responsive Design - Tests across different screen sizes
- Form Validation - Tests frontend form validation
- User Interactions - Tests buttons, inputs, and workflows

**Example**:
```bash
./system-test.sh ui
```

### 5. Integration Tests (`integration`)
**Purpose**: End-to-end testing across all system components

**Tests Included**:
- Complete User Journey - From registration to campaign creation
- Data Consistency - Tests data flow between frontend/backend
- Error Propagation - Tests how errors are handled across systems
- Cross-Component Testing - Tests interactions between modules

**Example**:
```bash
./system-test.sh integration
```

### 6. Performance Tests (`performance`)
**Purpose**: Validate system performance and response times

**Tests Included**:
- API Performance Benchmark - Comprehensive API performance testing
- Frontend Load Performance - Tests page load and rendering times
- Database Performance - Tests query response times
- Load Testing - Tests system under concurrent usage

**Performance Thresholds**:
| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| API Response | < 0.5s | < 1.0s | < 2.0s | > 5.0s |
| Frontend Load | < 1.0s | < 2.0s | < 3.0s | > 5.0s |
| Campaign Creation | < 2.0s | < 5.0s | < 10.0s | > 15.0s |

**Example**:
```bash
./system-test.sh performance
```

### 7. Security Tests (`security`)
**Purpose**: Validate security measures and protections

**Tests Included** (Extensible):
- Authentication Security - Tests token handling and session security
- API Security Scan - Tests for common vulnerabilities
- Data Protection - Tests data encryption and privacy
- Access Control - Tests authorization and permissions

**Example**:
```bash
./system-test.sh security
```

## 📊 Test Results and Reporting

### Automatic Reporting
The system generates comprehensive reports after each test run:

**Text Summary** (`test-results/[session]/test_summary.txt`):
```
Nexopeak System Test Report
===========================

Test Session: test_session_20240109_143022
Environment: local
Backend URL: http://localhost:8000
Frontend URL: http://localhost:3000
Execution Time: 2024-01-09 14:30:22

Test Results Summary:
- Total Tests: 8
- Passed: 7
- Failed: 1
- Skipped: 0
- Success Rate: 87%
```

**HTML Report** (`test-results/[session]/test_report.html`):
- Interactive dashboard with test results
- Performance metrics and charts
- Error details and stack traces
- Screenshots and artifacts
- Drill-down capabilities for failed tests

### Real-time Output
During execution, you'll see real-time status updates:
```
🧪 [TEST START] Campaign Registration API
[INFO] Testing campaign registration endpoint...
[SUCCESS] Campaign registered successfully!
✅ [TEST PASS] Campaign Registration API (45s)

🧪 [TEST START] Campaign Designer UI
[INFO] Setting up browser...
[SUCCESS] Browser setup complete
❌ [TEST FAIL] Campaign Designer UI (120s)
```

## ⚙️ Configuration

### Test Configuration File (`test-config.json`)
The system uses a JSON configuration file to define:
- Available test suites and their scripts
- Test dependencies and prerequisites
- Environment-specific settings
- Performance thresholds
- Browser configurations

**Key Configuration Sections**:
```json
{
  "test_suites": {
    "campaigns": {
      "name": "Campaign Management",
      "enabled": true,
      "tests": [
        {
          "name": "Campaign Registration API",
          "script": "backend/test_campaign_registration.py",
          "type": "backend",
          "timeout": 120,
          "enabled": true
        }
      ]
    }
  },
  "environments": {
    "local": {
      "backend_url": "http://localhost:8000",
      "frontend_url": "http://localhost:3000"
    }
  }
}
```

### Adding New Tests
To add a new test category:

1. **Create the test script** in the appropriate directory
2. **Update test-config.json** to include the new test
3. **Add test category logic** to `system-test.sh` if needed
4. **Update documentation** with the new test details

**Example - Adding a new API test**:
```json
{
  "name": "Data Warehouse API",
  "script": "backend/test_data_warehouse.py",
  "type": "backend",
  "timeout": 90,
  "retry_count": 2,
  "enabled": true,
  "description": "Tests data warehouse integration endpoints"
}
```

## 🔧 Environment Testing

### Local Development
```bash
# Test local development environment
./system-test.sh --env local

# With custom URLs
./system-test.sh --backend http://localhost:8001 --frontend http://localhost:3001
```

### Heroku Production
```bash
# Test Heroku deployment
./system-test.sh --env heroku

# Test specific Heroku apps
./system-test.sh \
  --backend https://nexopeak-backend-54c8631fe608.herokuapp.com \
  --frontend https://nexopeak-frontend-d38117672e4d.herokuapp.com
```

### Staging Environment
```bash
# Test staging environment (if configured)
./system-test.sh --env staging
```

## 🐛 Troubleshooting

### Common Issues

1. **"Backend server is not responding"**
   ```bash
   cd backend && python main.py
   ```

2. **"Frontend server is not responding"**
   ```bash
   cd frontend && npm run dev
   ```

3. **"Test script not found"**
   - Check that test files exist in the specified paths
   - Verify test-config.json has correct script paths

4. **"Permission denied"**
   ```bash
   chmod +x system-test.sh
   ```

### Debug Mode
Run with verbose output and visible browser:
```bash
./system-test.sh --verbose --headless false --no-cleanup
```

This will:
- Show detailed logs for all operations
- Display browser actions visually
- Keep test data for manual inspection
- Save screenshots of test steps

### Test Data Issues
If tests fail due to existing data:
```bash
# Run with cleanup disabled to inspect data
./system-test.sh --no-cleanup

# Manually clean up test data
# (Implementation depends on your cleanup procedures)
```

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: System Tests

on: [push, pull_request]

jobs:
  system-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
          
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          cd frontend && npm install puppeteer
          
      - name: Start services
        run: |
          cd backend && python main.py &
          cd frontend && npm run dev &
          sleep 30
          
      - name: Run system tests
        run: ./system-test.sh --headless true --verbose
        
      - name: Upload test results
        uses: actions/upload-artifact@v2
        if: always()
        with:
          name: test-results
          path: test-results/
```

### Scheduled Testing
Run tests on a schedule to catch regressions:
```bash
# Add to crontab for daily testing
0 2 * * * cd /path/to/nexopeak && ./system-test.sh --env heroku
```

## 🔍 Advanced Usage

### Parallel Execution
```bash
# Run tests in parallel for faster execution
./system-test.sh --parallel
```

### Stop on First Failure
```bash
# Stop immediately when a test fails
./system-test.sh --stop-on-failure
```

### Custom Test Selection
```bash
# Run only specific categories
./system-test.sh auth campaigns performance

# Run all except security tests
./system-test.sh all --exclude security
```

### Performance Monitoring
```bash
# Focus on performance testing
./system-test.sh performance --verbose

# Set custom performance thresholds
./system-test.sh --config custom-performance-config.json
```

## 📚 Best Practices

### Test Development
1. **Keep tests independent** - Each test should be able to run standalone
2. **Use descriptive names** - Test names should clearly indicate what's being tested
3. **Include cleanup** - Always clean up test data after completion
4. **Handle failures gracefully** - Provide clear error messages and debugging info
5. **Test both positive and negative cases** - Include validation and error scenarios

### Test Maintenance
1. **Update tests with code changes** - Keep tests in sync with application changes
2. **Review test results regularly** - Monitor for flaky or consistently failing tests
3. **Optimize test performance** - Keep test execution times reasonable
4. **Document test purposes** - Maintain clear documentation for each test

### CI/CD Integration
1. **Run tests on every commit** - Catch issues early in development
2. **Use appropriate timeouts** - Balance thoroughness with execution speed
3. **Archive test results** - Keep historical test data for trend analysis
4. **Set up notifications** - Alert team members of test failures

## 🤝 Contributing

### Adding New Test Categories
1. Create test scripts in appropriate directories
2. Update `test-config.json` with new test definitions
3. Add category handling in `system-test.sh`
4. Update this documentation
5. Test the new category thoroughly

### Improving Existing Tests
1. Identify areas for improvement (coverage, reliability, performance)
2. Make changes while maintaining backward compatibility
3. Test changes across all environments
4. Update documentation as needed

## 📞 Support

For issues with the system test suite:

1. **Check this documentation** for common solutions
2. **Run with --verbose** to get detailed error information
3. **Check individual test logs** in the test-results directory
4. **Verify server status** and connectivity
5. **Create an issue** with test output and error details

---

**Happy Testing! 🚀**

The Nexopeak System Test Suite ensures your platform works reliably across all features and environments. Use it regularly to maintain high quality and catch issues before they reach production.
