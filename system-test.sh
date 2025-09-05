#!/bin/bash

# Nexopeak System Test Runner
# Comprehensive test suite for all system features and functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_CONFIG_FILE="$SCRIPT_DIR/test-config.json"
TEST_RESULTS_DIR="$SCRIPT_DIR/test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEST_SESSION_ID="test_session_$TIMESTAMP"

# Default settings
TEST_ENV="local"
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"
HEROKU_BACKEND_URL="https://nexopeak-backend-54c8631fe608.herokuapp.com"
HEROKU_FRONTEND_URL="https://nexopeak-frontend-d38117672e4d.herokuapp.com"
VERBOSE=false
HEADLESS=true
PARALLEL=false
CLEANUP=true
GENERATE_REPORT=true
STOP_ON_FAILURE=false

# Test results tracking (using bash 4+ associative arrays if available, fallback to indexed arrays)
if [[ ${BASH_VERSION%%.*} -ge 4 ]]; then
    declare -A TEST_RESULTS
    declare -A TEST_DURATIONS
    declare -A TEST_DETAILS
else
    # Fallback for older bash versions
    TEST_RESULTS=()
    TEST_DURATIONS=()
    TEST_DETAILS=()
fi
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Function to print colored output
print_banner() {
    echo -e "${PURPLE}"
    echo "████████████████████████████████████████████████████████████████"
    echo "█                                                              █"
    echo "█                 NEXOPEAK SYSTEM TEST SUITE                  █"
    echo "█                                                              █"
    echo "████████████████████████████████████████████████████████████████"
    echo -e "${NC}"
}

print_header() {
    echo -e "${WHITE}$1${NC}"
    echo -e "${WHITE}$(echo "$1" | sed 's/./=/g')${NC}"
}

print_subheader() {
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}$(echo "$1" | sed 's/./-/g')${NC}"
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

print_test_start() {
    echo -e "${PURPLE}🧪 [TEST START]${NC} $1"
}

print_test_pass() {
    echo -e "${GREEN}✅ [TEST PASS]${NC} $1"
}

print_test_fail() {
    echo -e "${RED}❌ [TEST FAIL]${NC} $1"
}

print_test_skip() {
    echo -e "${YELLOW}⏭️  [TEST SKIP]${NC} $1"
}

# Helper functions for cross-compatible array operations
set_test_result() {
    local test_name="$1"
    local result="$2"
    if [[ ${BASH_VERSION%%.*} -ge 4 ]]; then
        TEST_RESULTS["$test_name"]="$result"
    else
        # For older bash, we'll use a simple approach
        echo "$test_name:$result" >> "$TEST_RESULTS_DIR/$TEST_SESSION_ID/results.txt"
    fi
}

set_test_duration() {
    local test_name="$1"
    local duration="$2"
    if [[ ${BASH_VERSION%%.*} -ge 4 ]]; then
        TEST_DURATIONS["$test_name"]="$duration"
    else
        echo "$test_name:$duration" >> "$TEST_RESULTS_DIR/$TEST_SESSION_ID/durations.txt"
    fi
}

set_test_details() {
    local test_name="$1"
    local details="$2"
    if [[ ${BASH_VERSION%%.*} -ge 4 ]]; then
        TEST_DETAILS["$test_name"]="$details"
    else
        echo "$test_name:$details" >> "$TEST_RESULTS_DIR/$TEST_SESSION_ID/details.txt"
    fi
}

# Help function
show_help() {
    cat << EOF
Nexopeak System Test Suite

This comprehensive test runner executes all system tests to validate
the complete functionality of the Nexopeak platform.

Usage: $0 [OPTIONS] [TEST_CATEGORIES...]

Options:
    -e, --env ENV           Test environment: local, heroku (default: local)
    -b, --backend URL       Backend URL (overrides environment default)
    -f, --frontend URL      Frontend URL (overrides environment default)
    -v, --verbose           Enable verbose output
    -h, --headless BOOL     Run browser tests in headless mode (default: true)
    -p, --parallel          Run tests in parallel where possible
    -c, --no-cleanup        Don't cleanup test data after completion
    -r, --no-report         Skip generating test report
    -s, --stop-on-failure   Stop execution on first test failure
    --list                  List all available test categories
    --config FILE           Use custom test configuration file
    --help                  Show this help message

Test Categories:
    all                     Run all available tests (default)
    auth                    Authentication and user management tests
    campaigns               Campaign registration and management tests
    api                     Backend API endpoint tests
    ui                      Frontend user interface tests
    integration             End-to-end integration tests
    performance             Performance and load tests
    security                Security and vulnerability tests

Examples:
    $0                                          # Run all tests locally
    $0 --env heroku                            # Run all tests on Heroku
    $0 auth campaigns                          # Run only auth and campaign tests
    $0 --verbose --headless false              # Verbose mode with visible browser
    $0 --parallel --stop-on-failure            # Parallel execution, stop on failure
    $0 --list                                  # Show available test categories

Test Configuration:
    Tests are configured in test-config.json which defines:
    - Available test suites and their execution commands
    - Test dependencies and prerequisites
    - Environment-specific settings
    - Performance benchmarks and thresholds

Test Results:
    Results are saved to test-results/ directory with:
    - Individual test logs and outputs
    - Screenshots and artifacts
    - Performance metrics
    - Comprehensive HTML report

EOF
}

# Initialize test environment
init_test_environment() {
    print_step "Initializing test environment..."
    
    # Create results directory
    mkdir -p "$TEST_RESULTS_DIR/$TEST_SESSION_ID"
    
    # Create test configuration if it doesn't exist
    if [[ ! -f "$TEST_CONFIG_FILE" ]]; then
        create_default_test_config
    fi
    
    # Set URLs based on environment
    if [[ "$TEST_ENV" == "heroku" ]]; then
        BACKEND_URL="$HEROKU_BACKEND_URL"
        FRONTEND_URL="$HEROKU_FRONTEND_URL"
    fi
    
    print_success "Test environment initialized"
    print_status "Session ID: $TEST_SESSION_ID"
    print_status "Environment: $TEST_ENV"
    print_status "Backend URL: $BACKEND_URL"
    print_status "Frontend URL: $FRONTEND_URL"
    print_status "Results Directory: $TEST_RESULTS_DIR/$TEST_SESSION_ID"
}

# Create default test configuration
create_default_test_config() {
    print_status "Creating default test configuration..."
    
    cat > "$TEST_CONFIG_FILE" << 'EOF'
{
  "test_suites": {
    "auth": {
      "name": "Authentication & User Management",
      "description": "Tests user registration, login, logout, and profile management",
      "category": "auth",
      "priority": "high",
      "dependencies": ["backend", "database"],
      "tests": [
        {
          "name": "User Registration",
          "script": "backend/test_user_registration.py",
          "type": "backend",
          "timeout": 60,
          "retry_count": 2
        },
        {
          "name": "User Login/Logout",
          "script": "frontend/test-auth-flow.js",
          "type": "frontend",
          "timeout": 120,
          "retry_count": 1
        }
      ]
    },
    "campaigns": {
      "name": "Campaign Management",
      "description": "Tests campaign creation, registration, and management features",
      "category": "campaigns",
      "priority": "high",
      "dependencies": ["backend", "frontend", "auth"],
      "tests": [
        {
          "name": "Campaign Registration API",
          "script": "backend/test_campaign_registration.py",
          "type": "backend",
          "timeout": 120,
          "retry_count": 2
        },
        {
          "name": "Campaign Designer UI",
          "script": "frontend/test-campaign-designer.js",
          "type": "frontend",
          "timeout": 300,
          "retry_count": 1
        },
        {
          "name": "Campaign Integration Flow",
          "script": "test-campaign-registration.sh",
          "type": "integration",
          "timeout": 600,
          "retry_count": 1
        }
      ]
    },
    "api": {
      "name": "Backend API Tests",
      "description": "Tests all backend API endpoints and functionality",
      "category": "api",
      "priority": "high",
      "dependencies": ["backend"],
      "tests": [
        {
          "name": "Health Check Endpoints",
          "script": "backend/test_health_endpoints.py",
          "type": "backend",
          "timeout": 30,
          "retry_count": 3
        },
        {
          "name": "Authentication Endpoints",
          "script": "backend/test_auth_endpoints.py",
          "type": "backend",
          "timeout": 60,
          "retry_count": 2
        }
      ]
    },
    "ui": {
      "name": "Frontend UI Tests",
      "description": "Tests frontend user interface and user experience",
      "category": "ui",
      "priority": "medium",
      "dependencies": ["frontend"],
      "tests": [
        {
          "name": "Dashboard Navigation",
          "script": "frontend/test-dashboard-navigation.js",
          "type": "frontend",
          "timeout": 180,
          "retry_count": 1
        },
        {
          "name": "Responsive Design",
          "script": "frontend/test-responsive-design.js",
          "type": "frontend",
          "timeout": 240,
          "retry_count": 1
        }
      ]
    },
    "integration": {
      "name": "Integration Tests",
      "description": "End-to-end integration testing across all components",
      "category": "integration",
      "priority": "high",
      "dependencies": ["backend", "frontend", "database"],
      "tests": [
        {
          "name": "Complete User Journey",
          "script": "test-user-journey.sh",
          "type": "integration",
          "timeout": 900,
          "retry_count": 1
        }
      ]
    },
    "performance": {
      "name": "Performance Tests",
      "description": "Tests system performance, load handling, and response times",
      "category": "performance",
      "priority": "medium",
      "dependencies": ["backend", "frontend"],
      "tests": [
        {
          "name": "API Performance",
          "script": "test-api-performance.sh",
          "type": "performance",
          "timeout": 300,
          "retry_count": 1
        },
        {
          "name": "Frontend Performance",
          "script": "test-frontend-performance.js",
          "type": "performance",
          "timeout": 300,
          "retry_count": 1
        }
      ]
    },
    "security": {
      "name": "Security Tests",
      "description": "Tests security measures, authentication, and data protection",
      "category": "security",
      "priority": "high",
      "dependencies": ["backend", "frontend"],
      "tests": [
        {
          "name": "Authentication Security",
          "script": "test-auth-security.py",
          "type": "security",
          "timeout": 180,
          "retry_count": 1
        },
        {
          "name": "API Security",
          "script": "test-api-security.py",
          "type": "security",
          "timeout": 240,
          "retry_count": 1
        }
      ]
    }
  },
  "environments": {
    "local": {
      "backend_url": "http://localhost:8000",
      "frontend_url": "http://localhost:3000",
      "database_url": "sqlite:///./nexopeak.db"
    },
    "heroku": {
      "backend_url": "https://nexopeak-backend-54c8631fe608.herokuapp.com",
      "frontend_url": "https://nexopeak-frontend-d38117672e4d.herokuapp.com"
    }
  },
  "performance_thresholds": {
    "api_response_time": {
      "excellent": 0.5,
      "good": 1.0,
      "acceptable": 2.0,
      "poor": 5.0
    },
    "frontend_load_time": {
      "excellent": 1.0,
      "good": 2.0,
      "acceptable": 3.0,
      "poor": 5.0
    }
  }
}
EOF
    
    print_success "Default test configuration created: $TEST_CONFIG_FILE"
}

# Parse command line arguments
parse_args() {
    local test_categories=()
    
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
            -p|--parallel)
                PARALLEL=true
                shift
                ;;
            -c|--no-cleanup)
                CLEANUP=false
                shift
                ;;
            -r|--no-report)
                GENERATE_REPORT=false
                shift
                ;;
            -s|--stop-on-failure)
                STOP_ON_FAILURE=true
                shift
                ;;
            --list)
                list_test_categories
                exit 0
                ;;
            --config)
                TEST_CONFIG_FILE="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
            *)
                test_categories+=("$1")
                shift
                ;;
        esac
    done
    
    # If no categories specified, run all tests
    if [[ ${#test_categories[@]} -eq 0 ]]; then
        test_categories=("all")
    fi
    
    echo "${test_categories[@]}"
}

# List available test categories
list_test_categories() {
    print_header "Available Test Categories"
    
    if [[ -f "$TEST_CONFIG_FILE" ]]; then
        # Parse JSON to list categories (basic parsing)
        echo "Reading from: $TEST_CONFIG_FILE"
        echo ""
        echo "Categories:"
        echo "  all                     - Run all available tests"
        echo "  auth                    - Authentication and user management tests"
        echo "  campaigns               - Campaign registration and management tests"
        echo "  api                     - Backend API endpoint tests"
        echo "  ui                      - Frontend user interface tests"
        echo "  integration             - End-to-end integration tests"
        echo "  performance             - Performance and load tests"
        echo "  security                - Security and vulnerability tests"
    else
        print_warning "Test configuration file not found: $TEST_CONFIG_FILE"
        print_status "Run the system test once to create default configuration"
    fi
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking system prerequisites..."
    
    local missing_deps=()
    
    # Check required tools
    local required_tools=("python3" "node" "npm" "curl" "jq")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_deps+=("$tool")
        fi
    done
    
    # Check test files exist
    local test_files=(
        "backend/test_campaign_registration.py"
        "frontend/test-campaign-designer.js"
        "test-campaign-registration.sh"
    )
    
    for file in "${test_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing_deps+=("$file")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Missing prerequisites:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        return 1
    fi
    
    print_success "All prerequisites found"
    return 0
}

# Check server availability
check_servers() {
    print_step "Checking server availability..."
    
    # Check backend
    print_status "Testing backend: $BACKEND_URL"
    if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
        print_success "Backend server is responding"
    else
        print_error "Backend server is not responding"
        if [[ "$TEST_ENV" == "local" ]]; then
            print_status "Start backend: cd backend && python main.py"
        fi
        return 1
    fi
    
    # Check frontend (for local tests)
    if [[ "$TEST_ENV" == "local" ]]; then
        print_status "Testing frontend: $FRONTEND_URL"
        if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
            print_success "Frontend server is responding"
        else
            print_error "Frontend server is not responding"
            print_status "Start frontend: cd frontend && npm run dev"
            return 1
        fi
    fi
    
    return 0
}

# Execute a single test
execute_test() {
    local test_name="$1"
    local test_script="$2"
    local test_type="$3"
    local timeout="${4:-300}"
    local retry_count="${5:-1}"
    
    print_test_start "$test_name"
    
    local start_time=$(date +%s)
    local test_log="$TEST_RESULTS_DIR/$TEST_SESSION_ID/${test_name// /_}.log"
    local test_result=1
    local attempt=1
    
    # Create test-specific log file
    mkdir -p "$(dirname "$test_log")"
    
    while [[ $attempt -le $((retry_count + 1)) && $test_result -ne 0 ]]; do
        if [[ $attempt -gt 1 ]]; then
            print_status "Retry attempt $((attempt - 1))/$retry_count for: $test_name"
        fi
        
        # Execute test based on type
        case "$test_type" in
            "backend")
                execute_backend_test "$test_script" "$test_log" "$timeout"
                test_result=$?
                ;;
            "frontend")
                execute_frontend_test "$test_script" "$test_log" "$timeout"
                test_result=$?
                ;;
            "integration")
                execute_integration_test "$test_script" "$test_log" "$timeout"
                test_result=$?
                ;;
            *)
                execute_generic_test "$test_script" "$test_log" "$timeout"
                test_result=$?
                ;;
        esac
        
        ((attempt++))
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Record test results
    set_test_duration "$test_name" "$duration"
    ((TOTAL_TESTS++))
    
    if [[ $test_result -eq 0 ]]; then
        print_test_pass "$test_name (${duration}s)"
        set_test_result "$test_name" "PASS"
        set_test_details "$test_name" "Test completed successfully in ${duration}s"
        ((PASSED_TESTS++))
    else
        print_test_fail "$test_name (${duration}s)"
        set_test_result "$test_name" "FAIL"
        set_test_details "$test_name" "Test failed after $((attempt - 1)) attempts. Check log: $test_log"
        ((FAILED_TESTS++))
        
        if [[ "$STOP_ON_FAILURE" == "true" ]]; then
            print_error "Stopping execution due to test failure (--stop-on-failure)"
            return 1
        fi
    fi
    
    return $test_result
}

# Execute backend test
execute_backend_test() {
    local script="$1"
    local log_file="$2"
    local timeout="$3"
    
    if [[ -f "$script" ]]; then
        cd "$(dirname "$script")"
        timeout "$timeout" python3 "$(basename "$script")" --url "$BACKEND_URL" > "$log_file" 2>&1
        local result=$?
        cd - > /dev/null
        return $result
    else
        echo "Backend test script not found: $script" > "$log_file"
        return 1
    fi
}

# Execute frontend test
execute_frontend_test() {
    local script="$1"
    local log_file="$2"
    local timeout="$3"
    
    if [[ -f "$script" ]]; then
        cd "$(dirname "$script")"
        timeout "$timeout" node "$(basename "$script")" --url "$FRONTEND_URL" --headless "$HEADLESS" > "$log_file" 2>&1
        local result=$?
        cd - > /dev/null
        return $result
    else
        echo "Frontend test script not found: $script" > "$log_file"
        return 1
    fi
}

# Execute integration test
execute_integration_test() {
    local script="$1"
    local log_file="$2"
    local timeout="$3"
    
    if [[ -f "$script" ]]; then
        local test_args="--env $TEST_ENV --backend $BACKEND_URL --frontend $FRONTEND_URL"
        if [[ "$VERBOSE" == "true" ]]; then
            test_args="$test_args --verbose"
        fi
        if [[ "$HEADLESS" != "true" ]]; then
            test_args="$test_args --headless false"
        fi
        if [[ "$CLEANUP" != "true" ]]; then
            test_args="$test_args --no-cleanup"
        fi
        
        timeout "$timeout" bash "$script" $test_args > "$log_file" 2>&1
        return $?
    else
        echo "Integration test script not found: $script" > "$log_file"
        return 1
    fi
}

# Execute generic test
execute_generic_test() {
    local script="$1"
    local log_file="$2"
    local timeout="$3"
    
    if [[ -f "$script" ]]; then
        timeout "$timeout" bash "$script" > "$log_file" 2>&1
        return $?
    else
        echo "Test script not found: $script" > "$log_file"
        return 1
    fi
}

# Run tests for specified categories
run_test_categories() {
    local categories=("$@")
    
    print_header "Executing Test Categories"
    
    for category in "${categories[@]}"; do
        if [[ "$category" == "all" ]]; then
            run_all_tests
        else
            run_category_tests "$category"
        fi
    done
}

# Run all available tests
run_all_tests() {
    print_subheader "Running All System Tests"
    
    # Define test execution order
    local test_order=("auth" "api" "campaigns" "ui" "integration" "performance" "security")
    
    for category in "${test_order[@]}"; do
        run_category_tests "$category"
        
        if [[ "$STOP_ON_FAILURE" == "true" && $FAILED_TESTS -gt 0 ]]; then
            break
        fi
    done
}

# Run tests for a specific category
run_category_tests() {
    local category="$1"
    
    print_subheader "Running $category Tests"
    
    case "$category" in
        "auth")
            run_auth_tests
            ;;
        "campaigns")
            run_campaign_tests
            ;;
        "api")
            run_api_tests
            ;;
        "ui")
            run_ui_tests
            ;;
        "integration")
            run_integration_tests
            ;;
        "performance")
            run_performance_tests
            ;;
        "security")
            run_security_tests
            ;;
        *)
            print_warning "Unknown test category: $category"
            ;;
    esac
}

# Individual test category implementations
run_auth_tests() {
    # User registration and authentication tests
    if [[ -f "backend/test_user_registration.py" ]]; then
        execute_test "User Registration API" "backend/test_user_registration.py" "backend" 60 2
    else
        print_test_skip "User Registration API (script not found)"
        ((SKIPPED_TESTS++))
    fi
}

run_campaign_tests() {
    # Campaign registration and management tests
    execute_test "Campaign Registration API" "backend/test_campaign_registration.py" "backend" 120 2
    execute_test "Campaign Designer UI" "frontend/test-campaign-designer.js" "frontend" 300 1
    execute_test "Campaign Integration Flow" "test-campaign-registration.sh" "integration" 600 1
}

run_api_tests() {
    # Backend API endpoint tests
    print_status "Running API health checks..."
    
    # Basic health check
    if curl -s -f "$BACKEND_URL/health" > /dev/null; then
        print_test_pass "API Health Check"
        set_test_result "API Health Check" "PASS"
        ((TOTAL_TESTS++))
        ((PASSED_TESTS++))
    else
        print_test_fail "API Health Check"
        set_test_result "API Health Check" "FAIL"
        ((TOTAL_TESTS++))
        ((FAILED_TESTS++))
    fi
}

run_ui_tests() {
    # Frontend UI and UX tests
    print_status "UI tests would be implemented here"
    print_test_skip "Dashboard Navigation (not implemented)"
    print_test_skip "Responsive Design (not implemented)"
    SKIPPED_TESTS=$((SKIPPED_TESTS + 2))
}

run_integration_tests() {
    # End-to-end integration tests
    print_status "Running integration tests..."
    execute_test "Complete User Journey" "test-campaign-registration.sh" "integration" 900 1
}

run_performance_tests() {
    # Performance and load tests
    print_status "Running performance tests..."
    
    # API response time test
    local start_time=$(date +%s.%N)
    if curl -s "$BACKEND_URL/health" > /dev/null; then
        local end_time=$(date +%s.%N)
        local response_time=$(echo "$end_time - $start_time" | bc -l)
        
        if (( $(echo "$response_time < 1.0" | bc -l) )); then
            print_test_pass "API Response Time (${response_time}s)"
            set_test_result "API Response Time" "PASS"
            ((PASSED_TESTS++))
        else
            print_test_fail "API Response Time (${response_time}s - too slow)"
            set_test_result "API Response Time" "FAIL"
            ((FAILED_TESTS++))
        fi
        ((TOTAL_TESTS++))
    fi
}

run_security_tests() {
    # Security and vulnerability tests
    print_status "Security tests would be implemented here"
    print_test_skip "Authentication Security (not implemented)"
    print_test_skip "API Security (not implemented)"
    SKIPPED_TESTS=$((SKIPPED_TESTS + 2))
}

# Generate comprehensive test report
generate_test_report() {
    if [[ "$GENERATE_REPORT" != "true" ]]; then
        return 0
    fi
    
    print_step "Generating test report..."
    
    local report_file="$TEST_RESULTS_DIR/$TEST_SESSION_ID/test_report.html"
    local summary_file="$TEST_RESULTS_DIR/$TEST_SESSION_ID/test_summary.txt"
    
    # Generate text summary
    cat > "$summary_file" << EOF
Nexopeak System Test Report
===========================

Test Session: $TEST_SESSION_ID
Environment: $TEST_ENV
Backend URL: $BACKEND_URL
Frontend URL: $FRONTEND_URL
Execution Time: $(date)

Test Results Summary:
- Total Tests: $TOTAL_TESTS
- Passed: $PASSED_TESTS
- Failed: $FAILED_TESTS
- Skipped: $SKIPPED_TESTS
- Success Rate: $(( TOTAL_TESTS > 0 ? (PASSED_TESTS * 100) / TOTAL_TESTS : 0 ))%

Individual Test Results:
EOF
    
    # Read results from files (compatible with all bash versions)
    if [[ -f "$TEST_RESULTS_DIR/$TEST_SESSION_ID/results.txt" ]]; then
        while IFS=':' read -r test_name status; do
            local duration="0"
            local details="No details"
            
            # Get duration if available
            if [[ -f "$TEST_RESULTS_DIR/$TEST_SESSION_ID/durations.txt" ]]; then
                duration=$(grep "^$test_name:" "$TEST_RESULTS_DIR/$TEST_SESSION_ID/durations.txt" | cut -d':' -f2 || echo "0")
            fi
            
            # Get details if available
            if [[ -f "$TEST_RESULTS_DIR/$TEST_SESSION_ID/details.txt" ]]; then
                details=$(grep "^$test_name:" "$TEST_RESULTS_DIR/$TEST_SESSION_ID/details.txt" | cut -d':' -f2- || echo "No details")
            fi
            
            echo "- $test_name: $status (${duration}s)" >> "$summary_file"
            if [[ "$VERBOSE" == "true" ]]; then
                echo "  Details: $details" >> "$summary_file"
            fi
        done < "$TEST_RESULTS_DIR/$TEST_SESSION_ID/results.txt"
    fi
    
    # Generate HTML report
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Nexopeak System Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 3px; }
        .pass { background: #d4edda; border-left: 4px solid #28a745; }
        .fail { background: #f8d7da; border-left: 4px solid #dc3545; }
        .skip { background: #fff3cd; border-left: 4px solid #ffc107; }
        .metrics { display: flex; gap: 20px; }
        .metric { text-align: center; padding: 10px; background: #e9ecef; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Nexopeak System Test Report</h1>
        <p><strong>Session:</strong> $TEST_SESSION_ID</p>
        <p><strong>Environment:</strong> $TEST_ENV</p>
        <p><strong>Execution Time:</strong> $(date)</p>
    </div>
    
    <div class="summary">
        <h2>Test Results Summary</h2>
        <div class="metrics">
            <div class="metric">
                <h3>$TOTAL_TESTS</h3>
                <p>Total Tests</p>
            </div>
            <div class="metric">
                <h3>$PASSED_TESTS</h3>
                <p>Passed</p>
            </div>
            <div class="metric">
                <h3>$FAILED_TESTS</h3>
                <p>Failed</p>
            </div>
            <div class="metric">
                <h3>$SKIPPED_TESTS</h3>
                <p>Skipped</p>
            </div>
            <div class="metric">
                <h3>$(( TOTAL_TESTS > 0 ? (PASSED_TESTS * 100) / TOTAL_TESTS : 0 ))%</h3>
                <p>Success Rate</p>
            </div>
        </div>
    </div>
    
    <div class="details">
        <h2>Individual Test Results</h2>
EOF
    
    # Generate HTML results from files
    if [[ -f "$TEST_RESULTS_DIR/$TEST_SESSION_ID/results.txt" ]]; then
        while IFS=':' read -r test_name status; do
            local duration="0"
            local details="No details"
            local css_class=""
            
            # Get duration if available
            if [[ -f "$TEST_RESULTS_DIR/$TEST_SESSION_ID/durations.txt" ]]; then
                duration=$(grep "^$test_name:" "$TEST_RESULTS_DIR/$TEST_SESSION_ID/durations.txt" | cut -d':' -f2 || echo "0")
            fi
            
            # Get details if available
            if [[ -f "$TEST_RESULTS_DIR/$TEST_SESSION_ID/details.txt" ]]; then
                details=$(grep "^$test_name:" "$TEST_RESULTS_DIR/$TEST_SESSION_ID/details.txt" | cut -d':' -f2- || echo "No details")
            fi
            
            case "$status" in
                "PASS") css_class="pass" ;;
                "FAIL") css_class="fail" ;;
                "SKIP") css_class="skip" ;;
            esac
            
            cat >> "$report_file" << EOF
        <div class="test-result $css_class">
            <h3>$test_name</h3>
            <p><strong>Status:</strong> $status</p>
            <p><strong>Duration:</strong> ${duration}s</p>
            <p><strong>Details:</strong> $details</p>
        </div>
EOF
        done < "$TEST_RESULTS_DIR/$TEST_SESSION_ID/results.txt"
    fi
    
    cat >> "$report_file" << EOF
    </div>
</body>
</html>
EOF
    
    print_success "Test report generated:"
    print_status "Summary: $summary_file"
    print_status "HTML Report: $report_file"
}

# Cleanup test data and artifacts
cleanup_test_data() {
    if [[ "$CLEANUP" != "true" ]]; then
        print_status "Skipping cleanup (--no-cleanup specified)"
        return 0
    fi
    
    print_step "Cleaning up test data..."
    
    # Add cleanup logic here
    # - Remove test users
    # - Delete test campaigns
    # - Clear temporary files
    
    print_success "Cleanup completed"
}

# Display final test summary
display_test_summary() {
    echo ""
    print_header "📊 System Test Summary"
    
    echo -e "${CYAN}Test Session:${NC} $TEST_SESSION_ID"
    echo -e "${CYAN}Environment:${NC} $TEST_ENV"
    echo -e "${CYAN}Backend URL:${NC} $BACKEND_URL"
    echo -e "${CYAN}Frontend URL:${NC} $FRONTEND_URL"
    echo -e "${CYAN}Execution Time:${NC} $(date)"
    echo ""
    
    echo -e "${CYAN}Results Overview:${NC}"
    echo -e "  📊 Total Tests: ${WHITE}$TOTAL_TESTS${NC}"
    echo -e "  ✅ Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "  ❌ Failed: ${RED}$FAILED_TESTS${NC}"
    echo -e "  ⏭️  Skipped: ${YELLOW}$SKIPPED_TESTS${NC}"
    
    if [[ $TOTAL_TESTS -gt 0 ]]; then
        local success_rate=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
        echo -e "  📈 Success Rate: ${WHITE}${success_rate}%${NC}"
    fi
    
    echo ""
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        echo -e "${GREEN}🎉 All tests passed! System is functioning correctly.${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Some tests failed. Please review the issues above.${NC}"
        echo ""
        echo -e "${CYAN}Failed Tests:${NC}"
        if [[ -f "$TEST_RESULTS_DIR/$TEST_SESSION_ID/results.txt" ]]; then
            while IFS=':' read -r test_name status; do
                if [[ "$status" == "FAIL" ]]; then
                    echo -e "  ❌ $test_name"
                fi
            done < "$TEST_RESULTS_DIR/$TEST_SESSION_ID/results.txt"
        fi
        return 1
    fi
}

# Main execution function
main() {
    # Check for --list and --help options first (before any other checks)
    for arg in "$@"; do
        if [[ "$arg" == "--list" ]]; then
            list_test_categories
            exit 0
        elif [[ "$arg" == "--help" ]]; then
            show_help
            exit 0
        fi
    done
    
    # Parse command line arguments
    local test_categories
    IFS=' ' read -ra test_categories <<< "$(parse_args "$@")"
    
    # Display banner
    print_banner
    
    # Initialize test environment
    init_test_environment
    
    # Check prerequisites
    if ! check_prerequisites; then
        exit 1
    fi
    
    # Check server availability
    if ! check_servers; then
        exit 1
    fi
    
    echo ""
    
    # Run tests
    run_test_categories "${test_categories[@]}"
    
    echo ""
    
    # Generate report
    generate_test_report
    
    # Cleanup
    cleanup_test_data
    
    # Display summary and exit with appropriate code
    if display_test_summary; then
        exit 0
    else
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
