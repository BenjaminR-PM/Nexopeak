#!/bin/bash

# Nexopeak Heroku Test Script
# This script tests the deployed Heroku applications

set -e

echo "🧪 Testing Nexopeak Heroku Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Get app names
get_app_names() {
    echo ""
    read -p "Enter backend app name: " BACKEND_APP
    read -p "Enter frontend app name: " FRONTEND_APP
    
    if [ -z "$BACKEND_APP" ] || [ -z "$FRONTEND_APP" ]; then
        print_error "App names cannot be empty"
        exit 1
    fi
}

# Test backend endpoints
test_backend() {
    print_status "Testing backend endpoints..."
    
    BACKEND_URL="https://$BACKEND_APP.herokuapp.com"
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -s "$BACKEND_URL/health" | grep -q "healthy"; then
        print_success "Health endpoint working"
    else
        print_error "Health endpoint failed"
        return 1
    fi
    
    # Test root endpoint
    print_status "Testing root endpoint..."
    if curl -s "$BACKEND_URL/" | grep -q "Welcome"; then
        print_success "Root endpoint working"
    else
        print_error "Root endpoint failed"
        return 1
    fi
    
    # Test API docs
    print_status "Testing API docs..."
    if curl -s "$BACKEND_URL/docs" | grep -q "FastAPI"; then
        print_success "API docs accessible"
    else
        print_error "API docs failed"
        return 1
    fi
    
    print_success "Backend tests completed successfully"
}

# Test frontend
test_frontend() {
    print_status "Testing frontend..."
    
    FRONTEND_URL="https://$FRONTEND_APP.herokuapp.com"
    
    # Test frontend accessibility
    print_status "Testing frontend accessibility..."
    if curl -s "$FRONTEND_URL" | grep -q "Nexopeak"; then
        print_success "Frontend accessible"
    else
        print_error "Frontend failed"
        return 1
    fi
    
    print_success "Frontend tests completed successfully"
}

# Test database connection
test_database() {
    print_status "Testing database connection..."
    
    # Check if database is accessible
    if heroku pg:info -a "$BACKEND_APP" &> /dev/null; then
        print_success "Database accessible"
        
        # Check database status
        DB_STATUS=$(heroku pg:info -a "$BACKEND_APP" | grep "Status" | awk '{print $2}')
        print_status "Database status: $DB_STATUS"
    else
        print_error "Database not accessible"
        return 1
    fi
}

# Test Redis connection
test_redis() {
    print_status "Testing Redis connection..."
    
    # Check if Redis is accessible
    if heroku redis:info -a "$BACKEND_APP" &> /dev/null; then
        print_success "Redis accessible"
        
        # Check Redis status
        REDIS_STATUS=$(heroku redis:info -a "$BACKEND_APP" | grep "Status" | awk '{print $2}')
        print_status "Redis status: $REDIS_STATUS"
    else
        print_error "Redis not accessible"
        return 1
    fi
}

# Check app status
check_app_status() {
    print_status "Checking app status..."
    
    # Backend status
    print_status "Backend app status:"
    heroku ps -a "$BACKEND_APP"
    
    # Frontend status
    print_status "Frontend app status:"
    heroku ps -a "$FRONTEND_APP"
}

# Check environment variables
check_environment() {
    print_status "Checking environment variables..."
    
    # Backend config
    print_status "Backend environment variables:"
    heroku config -a "$BACKEND_APP" | grep -E "(SECRET_KEY|DATABASE_URL|REDIS_URL)"
    
    # Frontend config
    print_status "Frontend environment variables:"
    heroku config -a "$FRONTEND_APP" | grep -E "(NEXT_PUBLIC_API_URL|NEXT_PUBLIC_GA_CLIENT_ID)"
}

# Run performance test
performance_test() {
    print_status "Running performance test..."
    
    BACKEND_URL="https://$BACKEND_APP.herokuapp.com"
    
    # Test response time
    print_status "Testing response time..."
    START_TIME=$(date +%s.%N)
    curl -s "$BACKEND_URL/health" > /dev/null
    END_TIME=$(date +%s.%N)
    
    RESPONSE_TIME=$(echo "$END_TIME - $START_TIME" | bc -l)
    print_status "Response time: ${RESPONSE_TIME}s"
    
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
        print_success "Response time is good (< 2s)"
    else
        print_warning "Response time is slow (> 2s)"
    fi
}

# Display test summary
show_test_summary() {
    echo ""
    echo "🧪 Test Summary"
    echo "==============="
    echo ""
    echo "✅ Backend: https://$BACKEND_APP.herokuapp.com"
    echo "✅ Frontend: https://$FRONTEND_APP.herokuapp.com"
    echo "✅ API Docs: https://$BACKEND_APP.herokuapp.com/docs"
    echo "✅ Health Check: https://$BACKEND_APP.herokuapp.com/health"
    echo ""
    echo "🔧 Monitoring Commands:"
    echo "  Backend Logs: heroku logs --tail -a $BACKEND_APP"
    echo "  Frontend Logs: heroku logs --tail -a $FRONTEND_APP"
    echo "  Database: heroku pg:psql -a $BACKEND_APP"
    echo "  Redis: heroku redis:cli -a $BACKEND_APP"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Configure Google OAuth credentials"
    echo "2. Set up SendGrid for email notifications"
    echo "3. Configure Slack integration"
    echo "4. Test user registration and login"
    echo "5. Connect GA4 and Search Console"
    echo ""
    echo "Happy testing! 🚀"
}

# Main test function
main() {
    echo "Welcome to Nexopeak Heroku Testing!"
    echo "==================================="
    echo ""
    
    get_app_names
    test_backend
    test_frontend
    test_database
    test_redis
    check_app_status
    check_environment
    performance_test
    show_test_summary
}

# Run main function
main "$@"
