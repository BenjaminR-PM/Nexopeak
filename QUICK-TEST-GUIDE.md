# Quick Test Guide

## 🚀 Run System Tests

```bash
# Run all system tests
./system-test.sh

# Run specific test categories
./system-test.sh auth campaigns

# Test Heroku deployment
./system-test.sh --env heroku

# Debug mode (visible browser, verbose output)
./system-test.sh --headless false --verbose
```

## 📋 Available Test Categories

- `all` - Run all available tests (default)
- `auth` - Authentication and user management tests
- `campaigns` - Campaign registration and management tests  
- `api` - Backend API endpoint tests
- `ui` - Frontend user interface tests
- `integration` - End-to-end integration tests
- `performance` - Performance and load tests
- `security` - Security and vulnerability tests

## 🔧 Quick Commands

```bash
# List available test categories
./system-test.sh --list

# Show help and options
./system-test.sh --help

# Test with custom URLs
./system-test.sh --backend http://localhost:8001 --frontend http://localhost:3001

# Run tests in parallel
./system-test.sh --parallel

# Stop on first failure
./system-test.sh --stop-on-failure
```

## 📊 Current Test Coverage

### ✅ Implemented Tests
- **User Registration** (`backend/test_user_registration.py`)
- **Campaign Registration API** (`backend/test_campaign_registration.py`)
- **Campaign Designer UI** (`frontend/test-campaign-designer.js`)
- **Campaign Integration Flow** (`test-campaign-registration.sh`)
- **API Health Checks** (built-in)
- **API Performance** (built-in)

### 🔄 Extensible Tests (Framework Ready)
- Dashboard Navigation
- Responsive Design
- Security Scans
- Load Testing
- Complete User Journey

## 🛠️ Prerequisites

1. **Python 3.8+** with backend dependencies
2. **Node.js 18+** with npm
3. **Running servers** (for local tests):
   ```bash
   # Terminal 1: Backend
   cd backend && python main.py
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## 📈 Test Results

Results are saved to `test-results/[session]/`:
- `test_summary.txt` - Text summary
- `test_report.html` - Interactive HTML report
- Individual test logs and screenshots

## 🎯 When to Run Tests

- **Before deploying** - Run all tests to ensure system stability
- **After code changes** - Run relevant test categories
- **Regular monitoring** - Schedule daily/weekly full test runs
- **Debugging issues** - Run specific tests with verbose output

---

For detailed documentation, see [SYSTEM-TESTS.md](./SYSTEM-TESTS.md)
