#!/bin/bash

# Nexopeak Frontend Update Script
# This script properly updates the existing Heroku frontend app

set -e

echo "🎨 Updating Nexopeak Frontend on Heroku..."

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

# Configuration
FRONTEND_APP="nexopeak-frontend"
BACKEND_URL="https://nexopeak-backend-54c8631fe608.herokuapp.com"

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

# Check if the app exists
check_app_exists() {
    if ! heroku apps:info -a "$FRONTEND_APP" &> /dev/null; then
        print_error "Frontend app $FRONTEND_APP does not exist on Heroku"
        exit 1
    fi
    print_success "Frontend app $FRONTEND_APP found on Heroku"
}

# Deploy frontend using temporary directory method
deploy_frontend() {
    print_status "Deploying frontend to $FRONTEND_APP..."
    
    # Ensure we're in the project root
    if [ ! -d "frontend" ]; then
        print_error "frontend directory not found. Please run this script from the project root."
        exit 1
    fi
    
    # Commit any pending changes in main repo
    if ! git diff-index --quiet HEAD --; then
        print_status "Committing pending changes..."
        git add .
        git commit -m "Update frontend before deployment" || true
    fi
    
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
    git commit -m "Deploy updated frontend with user dropdown and profile reorganization"
    
    # Add Heroku remote
    git remote add heroku https://git.heroku.com/$FRONTEND_APP.git
    
    # Force push to Heroku (this updates the existing app)
    git push heroku main --force
    
    # Clean up and return to original directory
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    
    print_success "Frontend deployed successfully"
}

# Configure environment variables
configure_environment() {
    print_status "Updating environment variables..."
    
    # Set frontend environment variables
    heroku config:set NEXT_PUBLIC_API_URL="$BACKEND_URL" -a "$FRONTEND_APP"
    heroku config:set CUSTOM_KEY="" -a "$FRONTEND_APP"
    
    print_success "Environment variables updated"
}

# Display deployment summary
show_deployment_summary() {
    echo ""
    echo "🎉 Frontend update completed successfully!"
    echo ""
    echo "Your Nexopeak frontend is now running with the latest changes:"
    echo ""
    echo "🎨 Frontend:"
    echo "   URL: https://$FRONTEND_APP-d38117672e4d.herokuapp.com/"
    echo ""
    echo "🔧 Backend API:"
    echo "   URL: $BACKEND_URL"
    echo ""
    echo "📊 Monitoring:"
    echo "   Logs: heroku logs --tail -a $FRONTEND_APP"
    echo ""
    echo "🎯 Changes Deployed:"
    echo "   ✅ User dropdown menu in top navigation"
    echo "   ✅ Reorganized profile pages with tabs"
    echo "   ✅ Fixed next.config.js warnings"
    echo "   ✅ Updated environment variables"
    echo ""
    echo "Happy testing! 🚀"
}

# Main deployment function
main() {
    echo "Nexopeak Frontend Update"
    echo "======================="
    echo ""
    
    check_heroku_cli
    check_heroku_login
    check_app_exists
    deploy_frontend
    configure_environment
    show_deployment_summary
}

# Run main function
main "$@"
