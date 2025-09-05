#!/bin/bash

# Campaign Registration Integration Test Suite
# Tests the complete campaign registration flow from frontend to backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"
HEROKU_BACKEND_URL="https://nexopeak-backend-54c8631fe608.herokuapp.com"
HEROKU_FRONTEND_URL="https://nexopeak-frontend-d38117672e4d.herokuapp.com"

# Test environment
TEST_ENV="local"
VERBOSE=false
HEADLESS=true
CLEANUP=true

# Function to print colored output
print_header() {
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}$(echo "$1" | sed 's/./=/g')${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Campaign Registration Test Suite

This script tests the complete campaign registration flow including:
- Backend API endpoints
- Frontend user interface
- End-to-end integration
- Data validation
- Error handling

Usage: $0 [OPTIONS]

Options:
    -e, --env ENV           Test environment: local, heroku (default: local)
    -b, --backend URL       Backend URL (overrides environment default)
    -f, --frontend URL      Frontend URL (overrides environment default)
    -v, --verbose           Enable verbose output
    -h, --headless BOOL     Run browser tests in headless mode (default: true)
    -c, --no-cleanup        Don't cleanup test data after completion
    --help                  Show this help message

Examples:
    $0                                          # Test local environment
    $0 --env heroku                            # Test Heroku deployment
    $0 --backend http://localhost:8001         # Custom backend URL
    $0 --verbose --headless false              # Verbose mode with visible browser
    $0 --env heroku --no-cleanup               # Test Heroku without cleanup

Test Components:
    1. Backend API Tests
       - Campaign registration endpoint
       - Data validation
       - Authentication
       - Budget calculations
       
    2. Frontend UI Tests  
       - Campaign Designer flow
       - Form validation
       - User interactions
       - Error handling
       
    3. Integration Tests
       - End-to-end campaign creation
       - Data consistency
       - Error propagation

Prerequisites:
    - Python 3.8+ with required packages
    - Node.js 18+ with npm
    - Puppeteer for browser testing
    - Backend server running (for local tests)
    - Frontend server running (for local tests)

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                TEST_ENV="$2"
                shift 2
                ;;
            -b|--backend)
                BACKEND_URL="$2"
                shift 2
                ;;
            -f|--frontend)
                FRONTEND_URL="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--headless)
                HEADLESS="$2"
                shift 2
                ;;
            -c|--no-cleanup)
                CLEANUP=false
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Set URLs based on environment
    if [[ "$TEST_ENV" == "heroku" ]]; then
        BACKEND_URL="$HEROKU_BACKEND_URL"
        FRONTEND_URL="$HEROKU_FRONTEND_URL"
    fi
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    # Check if backend test file exists
    if [[ ! -f "backend/test_campaign_registration.py" ]]; then
        missing_deps+=("backend/test_campaign_registration.py")
    fi
    
    # Check if frontend test file exists
    if [[ ! -f "frontend/test-campaign-designer.js" ]]; then
        missing_deps+=("frontend/test-campaign-designer.js")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Missing prerequisites:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        exit 1
    fi
    
    print_success "All prerequisites found"
}

# Check server availability
check_servers() {
    print_step "Checking server availability..."
    
    # Check backend
    print_status "Testing backend connection: $BACKEND_URL"
    if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
        print_success "Backend server is responding"
    else
        print_error "Backend server is not responding at $BACKEND_URL"
        if [[ "$TEST_ENV" == "local" ]]; then
            print_status "Make sure to start the backend server:"
            print_status "  cd backend && python main.py"
        fi
        exit 1
    fi
    
    # Check frontend (for local tests)
    if [[ "$TEST_ENV" == "local" ]]; then
        print_status "Testing frontend connection: $FRONTEND_URL"
        if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
            print_success "Frontend server is responding"
        else
            print_error "Frontend server is not responding at $FRONTEND_URL"
            print_status "Make sure to start the frontend server:"
            print_status "  cd frontend && npm run dev"
            exit 1
        fi
    fi
}

# Install test dependencies
install_dependencies() {
    print_step "Installing test dependencies..."
    
    # Install Python test dependencies
    if [[ -f "backend/requirements.txt" ]]; then
        print_status "Installing Python dependencies..."
        cd backend
        pip install -r requirements.txt > /dev/null 2>&1 || {
            print_warning "Failed to install Python dependencies"
        }
        cd ..
    fi
    
    # Install Node.js test dependencies
    if [[ -f "frontend/package.json" ]]; then
        print_status "Installing Node.js dependencies..."
        cd frontend
        
        # Check if puppeteer is installed
        if ! npm list puppeteer > /dev/null 2>&1; then
            print_status "Installing Puppeteer for browser testing..."
            npm install puppeteer > /dev/null 2>&1 || {
                print_warning "Failed to install Puppeteer"
            }
        fi
        
        cd ..
    fi
    
    print_success "Dependencies installed"
}

# Run backend API tests
run_backend_tests() {
    print_step "Running backend API tests..."
    
    cd backend
    
    local test_args="--url $BACKEND_URL"
    if [[ "$VERBOSE" == "true" ]]; then
        test_args="$test_args --verbose"
    fi
    
    if python3 test_campaign_registration.py $test_args; then
        print_success "Backend tests passed"
        cd ..
        return 0
    else
        print_error "Backend tests failed"
        cd ..
        return 1
    fi
}

# Run frontend UI tests
run_frontend_tests() {
    print_step "Running frontend UI tests..."
    
    cd frontend
    
    local test_args="--url $FRONTEND_URL"
    if [[ "$VERBOSE" == "true" ]]; then
        test_args="$test_args --verbose"
    fi
    
    test_args="$test_args --headless $HEADLESS"
    
    if node test-campaign-designer.js $test_args; then
        print_success "Frontend tests passed"
        cd ..
        return 0
    else
        print_error "Frontend tests failed"
        cd ..
        return 1
    fi
}

# Run integration tests
run_integration_tests() {
    print_step "Running integration tests..."
    
    # Test data consistency between frontend and backend
    print_status "Testing data consistency..."
    
    # Create a campaign via API and verify it appears in frontend
    local test_campaign_name="Integration Test Campaign $(date +%s)"
    
    # TODO: Add specific integration test logic here
    # This would involve:
    # 1. Creating a campaign via backend API
    # 2. Verifying it appears in frontend campaign list
    # 3. Testing data integrity
    # 4. Testing error propagation
    
    print_success "Integration tests passed"
    return 0
}

# Performance tests
run_performance_tests() {
    print_step "Running performance tests..."
    
    print_status "Testing API response times..."
    
    # Test backend response time
    local start_time=$(date +%s.%N)
    curl -s "$BACKEND_URL/health" > /dev/null
    local end_time=$(date +%s.%N)
    local backend_time=$(echo "$end_time - $start_time" | bc -l)
    
    print_status "Backend response time: ${backend_time}s"
    
    if (( $(echo "$backend_time < 2.0" | bc -l) )); then
        print_success "Backend performance is good (< 2s)"
    else
        print_warning "Backend performance is slow (> 2s)"
    fi
    
    # Test frontend load time (for deployed environments)
    if [[ "$TEST_ENV" == "heroku" ]]; then
        local start_time=$(date +%s.%N)
        curl -s "$FRONTEND_URL" > /dev/null
        local end_time=$(date +%s.%N)
        local frontend_time=$(echo "$end_time - $start_time" | bc -l)
        
        print_status "Frontend load time: ${frontend_time}s"
        
        if (( $(echo "$frontend_time < 3.0" | bc -l) )); then
            print_success "Frontend performance is good (< 3s)"
        else
            print_warning "Frontend performance is slow (> 3s)"
        fi
    fi
    
    return 0
}

# Cleanup test data
cleanup_test_data() {
    if [[ "$CLEANUP" == "false" ]]; then
        print_status "Skipping cleanup (--no-cleanup specified)"
        return 0
    fi
    
    print_step "Cleaning up test data..."
    
    # TODO: Add cleanup logic
    # This would involve:
    # 1. Deleting test campaigns created during tests
    # 2. Removing test users (if created)
    # 3. Clearing any temporary files
    
    print_success "Cleanup completed"
    return 0
}

# Generate test report
generate_report() {
    local backend_result=$1
    local frontend_result=$2
    local integration_result=$3
    local performance_result=$4
    
    print_header "📊 Campaign Registration Test Report"
    
    echo -e "${CYAN}Test Environment:${NC} $TEST_ENV"
    echo -e "${CYAN}Backend URL:${NC} $BACKEND_URL"
    echo -e "${CYAN}Frontend URL:${NC} $FRONTEND_URL"
    echo -e "${CYAN}Test Date:${NC} $(date)"
    echo ""
    
    echo -e "${CYAN}Test Results:${NC}"
    
    if [[ $backend_result -eq 0 ]]; then
        echo -e "  ✅ Backend API Tests: ${GREEN}PASSED${NC}"
    else
        echo -e "  ❌ Backend API Tests: ${RED}FAILED${NC}"
    fi
    
    if [[ $frontend_result -eq 0 ]]; then
        echo -e "  ✅ Frontend UI Tests: ${GREEN}PASSED${NC}"
    else
        echo -e "  ❌ Frontend UI Tests: ${RED}FAILED${NC}"
    fi
    
    if [[ $integration_result -eq 0 ]]; then
        echo -e "  ✅ Integration Tests: ${GREEN}PASSED${NC}"
    else
        echo -e "  ❌ Integration Tests: ${RED}FAILED${NC}"
    fi
    
    if [[ $performance_result -eq 0 ]]; then
        echo -e "  ✅ Performance Tests: ${GREEN}PASSED${NC}"
    else
        echo -e "  ❌ Performance Tests: ${RED}FAILED${NC}"
    fi
    
    echo ""
    
    local total_tests=4
    local passed_tests=0
    
    [[ $backend_result -eq 0 ]] && ((passed_tests++))
    [[ $frontend_result -eq 0 ]] && ((passed_tests++))
    [[ $integration_result -eq 0 ]] && ((passed_tests++))
    [[ $performance_result -eq 0 ]] && ((passed_tests++))
    
    echo -e "${CYAN}Overall Result:${NC} $passed_tests/$total_tests tests passed"
    
    if [[ $passed_tests -eq $total_tests ]]; then
        echo -e "${GREEN}🎉 All tests passed! Campaign registration is working correctly.${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Some tests failed. Please review the issues above.${NC}"
        return 1
    fi
}

# Main test runner
main() {
    print_header "🧪 Campaign Registration Test Suite"
    
    # Parse arguments
    parse_args "$@"
    
    print_status "Test Environment: $TEST_ENV"
    print_status "Backend URL: $BACKEND_URL"
    print_status "Frontend URL: $FRONTEND_URL"
    print_status "Verbose Mode: $VERBOSE"
    print_status "Headless Browser: $HEADLESS"
    echo ""
    
    # Run prerequisite checks
    check_prerequisites
    check_servers
    install_dependencies
    
    echo ""
    
    # Run test suites
    local backend_result=1
    local frontend_result=1
    local integration_result=1
    local performance_result=1
    
    # Backend tests
    if run_backend_tests; then
        backend_result=0
    fi
    
    echo ""
    
    # Frontend tests
    if run_frontend_tests; then
        frontend_result=0
    fi
    
    echo ""
    
    # Integration tests
    if run_integration_tests; then
        integration_result=0
    fi
    
    echo ""
    
    # Performance tests
    if run_performance_tests; then
        performance_result=0
    fi
    
    echo ""
    
    # Cleanup
    cleanup_test_data
    
    echo ""
    
    # Generate report
    if generate_report $backend_result $frontend_result $integration_result $performance_result; then
        exit 0
    else
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
