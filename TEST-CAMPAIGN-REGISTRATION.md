# Campaign Registration Test Suite

This comprehensive test suite validates the complete campaign registration flow in Nexopeak, from the frontend Campaign Designer interface to the backend API endpoints.

## 📋 Overview

The test suite includes:
- **Backend API Tests**: Validate campaign registration endpoints, data validation, and business logic
- **Frontend UI Tests**: Test the Campaign Designer user interface and user interactions
- **Integration Tests**: End-to-end testing of the complete campaign creation flow
- **Performance Tests**: Measure response times and system performance

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** with pip
2. **Node.js 18+** with npm
3. **Running servers** (for local testing):
   - Backend: `cd backend && python main.py`
   - Frontend: `cd frontend && npm run dev`

### Install Dependencies

```bash
# Install Python test dependencies
cd backend
pip install -r requirements.txt

# Install Node.js test dependencies  
cd ../frontend
npm install puppeteer

cd ..
```

### Run All Tests

```bash
# Make the script executable
chmod +x test-campaign-registration.sh

# Run local tests
./test-campaign-registration.sh

# Run tests on Heroku deployment
./test-campaign-registration.sh --env heroku

# Run with visible browser (non-headless)
./test-campaign-registration.sh --headless false

# Run with verbose output
./test-campaign-registration.sh --verbose
```

## 🧪 Test Components

### 1. Backend API Tests (`backend/test_campaign_registration.py`)

Tests the campaign registration API endpoints:

```bash
cd backend
python test_campaign_registration.py --url http://localhost:8000
```

**What it tests:**
- Campaign registration endpoint (`/api/v1/campaigns/from-designer`)
- Data validation and error handling
- Budget calculations and allocations
- Authentication and authorization
- Campaign retrieval and data integrity

**Sample output:**
```
🧪 Starting Campaign Registration Test Suite
==================================================
[INFO] Setting up test user...
[SUCCESS] Test user created successfully
[SUCCESS] User authentication successful
[INFO] Testing campaign registration endpoint...
[SUCCESS] Campaign registered successfully!
[SUCCESS] Campaign ID: 12345
✅ All tests passed! Campaign registration is working correctly.
```

### 2. Frontend UI Tests (`frontend/test-campaign-designer.js`)

Tests the Campaign Designer user interface:

```bash
cd frontend
node test-campaign-designer.js --url http://localhost:3000
```

**What it tests:**
- Complete campaign designer flow (5 steps)
- Form validation and error messages
- Budget calculations and auto-updates
- Channel selection and targeting
- Campaign registration process

**Sample output:**
```
🧪 Starting Campaign Designer Test Suite
===========================================
[INFO] Setting up browser...
[SUCCESS] Browser setup complete
[INFO] Testing user login...
[SUCCESS] User login successful
🔍 Running: Complete Campaign Flow
✅ Complete Campaign Flow PASSED
🎉 All tests passed! Campaign Designer is working correctly.
```

### 3. Integration Test Script (`test-campaign-registration.sh`)

Orchestrates all tests and provides comprehensive reporting:

```bash
./test-campaign-registration.sh [OPTIONS]
```

**Options:**
- `--env local|heroku`: Test environment (default: local)
- `--backend URL`: Custom backend URL
- `--frontend URL`: Custom frontend URL  
- `--verbose`: Enable detailed output
- `--headless true|false`: Browser visibility (default: true)
- `--no-cleanup`: Skip test data cleanup

## 📊 Test Scenarios

### Core Test Cases

1. **Happy Path Flow**
   - Complete campaign creation from start to finish
   - All required fields filled correctly
   - Successful registration and redirect

2. **Validation Testing**
   - Empty required fields
   - Invalid budget values (negative, zero)
   - Missing channel selection
   - Invalid campaign objectives

3. **Budget Calculations**
   - Total budget → Daily budget calculation
   - Duration changes → Daily budget updates
   - Channel allocation percentages
   - Budget format validation (comma formatting)

4. **User Interface**
   - Form navigation (Next/Back buttons)
   - Step completion indicators
   - Error message display
   - Loading states during registration

5. **Error Handling**
   - API connection failures
   - Server errors during registration
   - Network timeouts
   - Invalid authentication

### Performance Benchmarks

| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| API Response | < 0.5s | < 1.0s | < 2.0s | > 5.0s |
| Frontend Load | < 1.0s | < 2.0s | < 3.0s | > 5.0s |
| Campaign Creation | < 2.0s | < 5.0s | < 10.0s | > 15.0s |

## 🔧 Configuration

### Test Data

Test fixtures are defined in `test-data/campaign-fixtures.json`:

```json
{
  "test_campaigns": [
    {
      "name": "Lead Generation Campaign",
      "objective": "lead_gen",
      "budget": {"total": 5000, "daily": 167, "duration": 30},
      "channels": [
        {"channel": "Search", "percentage": 40, "amount": 2000}
      ]
    }
  ]
}
```

### Environment Variables

For local testing, ensure these are set:

```bash
# Backend
DATABASE_URL=sqlite:///./nexopeak.db
SECRET_KEY=your-secret-key

# Frontend  
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Common Issues

1. **"Backend server is not responding"**
   ```bash
   cd backend
   python main.py
   ```

2. **"Frontend server is not responding"**
   ```bash
   cd frontend
   npm run dev
   ```

3. **"Puppeteer not found"**
   ```bash
   cd frontend
   npm install puppeteer
   ```

4. **"Test user already exists"**
   - Tests automatically handle existing users
   - Or manually clean up test data

### Debug Mode

Run tests with verbose output to see detailed logs:

```bash
./test-campaign-registration.sh --verbose --headless false
```

This will:
- Show detailed API requests/responses
- Display browser actions visually
- Save screenshots of test steps
- Print comprehensive error messages

### Screenshots

Frontend tests automatically save screenshots to `frontend/test-screenshots/`:
- `campaign-designer-loaded.png`
- `campaign-basics-completed.png`
- `budget-timeline-completed.png`
- `campaign-registered.png`

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: Campaign Registration Tests

on: [push, pull_request]

jobs:
  test:
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
      - name: Run tests
        run: ./test-campaign-registration.sh --headless true
```

### Heroku Testing

Test deployed applications:

```bash
# Test staging environment
./test-campaign-registration.sh --env heroku

# Test with custom URLs
./test-campaign-registration.sh \
  --backend https://nexopeak-backend-staging.herokuapp.com \
  --frontend https://nexopeak-frontend-staging.herokuapp.com
```

## 🔍 Test Results Analysis

### Success Criteria

A successful test run should show:
- ✅ All API endpoints responding correctly
- ✅ Campaign registration completing without errors
- ✅ Data validation working as expected
- ✅ UI interactions functioning properly
- ✅ Performance within acceptable ranges

### Failure Investigation

When tests fail:

1. **Check the logs** for specific error messages
2. **Review screenshots** (for UI tests) to see what went wrong
3. **Verify server status** and connectivity
4. **Check test data** for conflicts or corruption
5. **Run individual test components** to isolate issues

### Reporting

Test results include:
- Pass/fail status for each test component
- Performance metrics and benchmarks
- Error details and stack traces
- Screenshots and artifacts
- Recommendations for fixes

## 🤝 Contributing

### Adding New Tests

1. **Backend tests**: Add test methods to `CampaignRegistrationTester` class
2. **Frontend tests**: Add test methods to `CampaignDesignerTester` class
3. **Test data**: Update `test-data/campaign-fixtures.json`
4. **Documentation**: Update this README

### Test Guidelines

- Use descriptive test names and comments
- Include both positive and negative test cases
- Test edge cases and error conditions
- Keep tests independent and idempotent
- Clean up test data after completion

## 📚 Additional Resources

- [FastAPI Testing Documentation](https://fastapi.tiangolo.com/tutorial/testing/)
- [Puppeteer API Reference](https://pptr.dev/)
- [Jest Testing Framework](https://jestjs.io/)
- [Campaign Designer User Guide](./docs/campaign-designer.md)

## 🆘 Support

If you encounter issues with the test suite:

1. Check this documentation first
2. Review the troubleshooting section
3. Run tests with `--verbose` flag for detailed output
4. Check server logs for backend issues
5. Create an issue with test output and error details

---

**Happy Testing! 🚀**

The campaign registration test suite ensures that your users can reliably create and manage campaigns through the Nexopeak platform.
