#!/bin/bash

# Nexopeak Backend Update Script
# This script properly updates the existing Heroku backend app

set -e

echo "🚀 Updating Nexopeak Backend on Heroku..."

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
BACKEND_APP="nexopeak-backend"

# Check if Heroku CLI is installed
check_heroku_cli() {
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install it first."
        exit 1
    fi
    print_success "Heroku CLI found"
}

# Check if user is logged in to Heroku
check_heroku_auth() {
    if ! heroku auth:whoami &> /dev/null; then
        print_error "Not logged in to Heroku. Please run 'heroku login' first."
        exit 1
    fi
    local user=$(heroku auth:whoami)
    print_success "Logged in to Heroku as $user"
}

# Check if app exists
check_app_exists() {
    local app_name=$1
    if heroku apps:info -a "$app_name" &> /dev/null; then
        print_success "App $app_name exists"
        return 0
    else
        print_error "App $app_name does not exist"
        return 1
    fi
}

# Deploy backend using git subtree
deploy_backend() {
    print_status "Deploying backend to $BACKEND_APP..."
    
    # Ensure we're in the project root
    if [ ! -d "backend" ]; then
        print_error "backend directory not found. Please run this script from the project root."
        exit 1
    fi
    
    # Add Heroku remote if it doesn't exist
    if ! git remote | grep -q "heroku-backend"; then
        print_status "Adding Heroku remote..."
        git remote add heroku-backend https://git.heroku.com/$BACKEND_APP.git
    fi
    
    # Commit any pending changes in main repo
    if ! git diff-index --quiet HEAD --; then
        print_status "Committing pending changes..."
        git add .
        git commit -m "Update backend before deployment" || true
    fi
    
    # Create a temporary directory for deployment
    temp_dir=$(mktemp -d)
    print_status "Creating temporary deployment directory: $temp_dir"
    
    # Copy backend files to temp directory
    cp -r backend/* "$temp_dir"/
    
    # Initialize git in temp directory
    cd "$temp_dir"
    git init
    git add .
    git commit -m "Deploy backend to Heroku"
    
    # Add Heroku remote and deploy with force push
    git remote add heroku https://git.heroku.com/$BACKEND_APP.git
    git push heroku main --force
    
    # Clean up
    cd - > /dev/null
    rm -rf "$temp_dir"
    print_success "Temporary directory cleaned up"
}

# Main execution
main() {
    print_status "Starting Nexopeak Backend deployment..."
    
    check_heroku_cli
    check_heroku_auth
    
    if check_app_exists "$BACKEND_APP"; then
        deploy_backend
        print_success "Backend deployment completed!"
        print_status "Backend URL: https://$BACKEND_APP.herokuapp.com"
        print_status "You can view logs with: heroku logs --tail -a $BACKEND_APP"
    else
        print_error "Backend app does not exist. Please create it first."
        exit 1
    fi
}

# Run main function
main
