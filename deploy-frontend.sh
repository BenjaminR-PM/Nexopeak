#!/bin/bash

# Nexopeak Frontend Heroku Deployment Script
# This script deploys only the frontend to Heroku

set -e

echo "🎨 Deploying Nexopeak Frontend to Heroku..."

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

# Check if Heroku CLI is installed
check_heroku_cli() {
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install it first."
        exit 1
    fi
    print_success "Heroku CLI found"
}

# Check if user is logged in to Heroku
check_heroku_login() {
    if ! heroku auth:whoami &> /dev/null; then
        print_error "Not logged in to Heroku. Please run: heroku login"
        exit 1
    fi
    print_success "Logged in to Heroku as $(heroku auth:whoami)"
}

# Get app name from user
get_app_name() {
    echo ""
    read -p "Enter frontend app name (e.g., nexopeak-frontend): " FRONTEND_APP
    
    if [ -z "$FRONTEND_APP" ]; then
        print_error "App name cannot be empty"
        exit 1
    fi
}

# Create Heroku app
create_heroku_app() {
    print_status "Creating Heroku app: $FRONTEND_APP"
    
    if ! heroku apps:info -a "$FRONTEND_APP" &> /dev/null; then
        heroku create "$FRONTEND_APP" --buildpack heroku/nodejs
        print_success "Created frontend app: $FRONTEND_APP"
    else
        print_warning "Frontend app $FRONTEND_APP already exists"
    fi
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to $FRONTEND_APP..."
    
    # Create a temporary deployment directory
    TEMP_DIR=$(mktemp -d)
    print_status "Creating temporary deployment directory: $TEMP_DIR"
    
    # Copy frontend files to temp directory
    cp -r frontend/* "$TEMP_DIR/"
    
    # Navigate to temp directory
    cd "$TEMP_DIR"
    
    # Initialize git in temp directory
    git init
    git add .
    git commit -m "Deploy frontend to Heroku"
    
    # Add Heroku remote
    heroku git:remote -a "$FRONTEND_APP"
    
    # Deploy
    git push heroku main
    
    # Clean up
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    
    print_success "Frontend deployed successfully"
}

# Configure environment variables
configure_environment() {
    print_status "Configuring environment variables..."
    
    # Get backend URL from user
    echo ""
    read -p "Enter backend API URL (e.g., https://nexopeak-backend-54c8631fe608.herokuapp.com): " BACKEND_URL
    
    if [ -z "$BACKEND_URL" ]; then
        print_error "Backend URL cannot be empty"
        exit 1
    fi
    
    # Set frontend environment variables
    heroku config:set NEXT_PUBLIC_API_URL="$BACKEND_URL" -a "$FRONTEND_APP"
    heroku config:set NEXT_PUBLIC_GA_CLIENT_ID="" -a "$FRONTEND_APP"
}

# Scale dynos
scale_dynos() {
    print_status "Scaling dynos..."
    
    # Scale frontend
    heroku ps:scale web=1 -a "$FRONTEND_APP"
}

# Display deployment summary
show_deployment_summary() {
    echo ""
    echo "🎉 Frontend deployment completed successfully!"
    echo ""
    echo "Your Nexopeak frontend is now running on Heroku:"
    echo ""
    echo "🎨 Frontend:"
    echo "   URL: https://$FRONTEND_APP.herokuapp.com"
    echo ""
    echo "🔧 Backend API:"
    echo "   URL: $BACKEND_URL"
    echo ""
    echo "📊 Monitoring:"
    echo "   Logs: heroku logs --tail -a $FRONTEND_APP"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Test the frontend application"
    echo "2. Configure Google Analytics if needed"
    echo "3. Test the connection to the backend"
    echo "4. Monitor logs for any issues"
    echo ""
    echo "Happy testing! 🚀"
}

# Main deployment function
main() {
    echo "Welcome to Nexopeak Frontend Heroku Deployment!"
    echo "==============================================="
    echo ""
    
    check_heroku_cli
    check_heroku_login
    get_app_name
    create_heroku_app
    deploy_frontend
    configure_environment
    scale_dynos
    show_deployment_summary
}

# Run main function
main "$@"
