#!/bin/bash

# Nexopeak Backend Heroku Deployment Script
# This script deploys only the backend to Heroku

set -e

echo "🚀 Deploying Nexopeak Backend to Heroku..."

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
    read -p "Enter backend app name (e.g., nexopeak-backend): " BACKEND_APP
    
    if [ -z "$BACKEND_APP" ]; then
        print_error "App name cannot be empty"
        exit 1
    fi
}

# Create Heroku app
create_heroku_app() {
    print_status "Creating Heroku app: $BACKEND_APP"
    
    if ! heroku apps:info -a "$BACKEND_APP" &> /dev/null; then
        heroku create "$BACKEND_APP" --buildpack heroku/python
        print_success "Created backend app: $BACKEND_APP"
    else
        print_warning "Backend app $BACKEND_APP already exists"
    fi
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend to $BACKEND_APP..."
    
    # Create a temporary deployment directory
    TEMP_DIR=$(mktemp -d)
    print_status "Creating temporary deployment directory: $TEMP_DIR"
    
    # Copy backend files to temp directory
    cp -r backend/* "$TEMP_DIR/"
    cp backend/requirements.txt "$TEMP_DIR/"
    cp backend/Procfile "$TEMP_DIR/"
    cp backend/runtime.txt "$TEMP_DIR/"
    cp backend/app.json "$TEMP_DIR/"
    
    # Navigate to temp directory
    cd "$TEMP_DIR"
    
    # Initialize git in temp directory
    git init
    git add .
    git commit -m "Deploy backend to Heroku"
    
    # Add Heroku remote
    heroku git:remote -a "$BACKEND_APP"
    
    # Deploy
    git push heroku main
    
    # Clean up
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    
    print_success "Backend deployed successfully"
}

# Setup backend add-ons
setup_backend_addons() {
    print_status "Setting up backend add-ons..."
    
    # Add PostgreSQL
    if ! heroku addons:info heroku-postgresql -a "$BACKEND_APP" &> /dev/null; then
        print_status "Adding PostgreSQL add-on..."
        heroku addons:create heroku-postgresql:mini -a "$BACKEND_APP"
    else
        print_warning "PostgreSQL add-on already exists"
    fi
    
    # Add Redis
    if ! heroku addons:info heroku-redis -a "$BACKEND_APP" &> /dev/null; then
        print_status "Adding Redis add-on..."
        heroku addons:create heroku-redis:mini -a "$BACKEND_APP"
    else
        print_warning "Redis add-on already exists"
    fi
}

# Configure environment variables
configure_environment() {
    print_status "Configuring environment variables..."
    
    # Set required variables
    heroku config:set SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')" -a "$BACKEND_APP"
    
    # Set optional variables (user can update these later)
    heroku config:set GOOGLE_CLIENT_ID="" -a "$BACKEND_APP"
    heroku config:set GOOGLE_CLIENT_SECRET="" -a "$BACKEND_APP"
    heroku config:set GOOGLE_CLOUD_PROJECT="" -a "$BACKEND_APP"
    heroku config:set SENDGRID_API_KEY="" -a "$BACKEND_APP"
    heroku config:set FROM_EMAIL="noreply@nexopeak.com" -a "$BACKEND_APP"
    heroku config:set SLACK_BOT_TOKEN="" -a "$BACKEND_APP"
    heroku config:set SLACK_SIGNING_SECRET="" -a "$BACKEND_APP"
}

# Scale dynos
scale_dynos() {
    print_status "Scaling dynos..."
    
    # Scale backend
    heroku ps:scale web=1 worker=1 beat=1 -a "$BACKEND_APP"
}

# Run database setup
setup_database() {
    print_status "Setting up database..."
    
    # Wait for database to be ready
    sleep 10
    
    # Create tables
    heroku run python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)" -a "$BACKEND_APP"
}

# Display deployment summary
show_deployment_summary() {
    echo ""
    echo "🎉 Backend deployment completed successfully!"
    echo ""
    echo "Your Nexopeak backend is now running on Heroku:"
    echo ""
    echo "🔧 Backend API:"
    echo "   URL: https://$BACKEND_APP.herokuapp.com"
    echo "   Health Check: https://$BACKEND_APP.herokuapp.com/health"
    echo "   API Docs: https://$BACKEND_APP.herokuapp.com/docs"
    echo ""
    echo "📊 Monitoring:"
    echo "   Logs: heroku logs --tail -a $BACKEND_APP"
    echo "   Database: heroku pg:psql -a $BACKEND_APP"
    echo "   Redis: heroku redis:cli -a $BACKEND_APP"
    echo ""
    echo "🔧 Next Steps:"
    echo "1. Deploy the frontend"
    echo "2. Update Google OAuth credentials"
    echo "3. Configure SendGrid API key"
    echo "4. Test the API endpoints"
    echo ""
    echo "Ready for frontend deployment! 🚀"
}

# Main deployment function
main() {
    echo "Welcome to Nexopeak Backend Heroku Deployment!"
    echo "=============================================="
    echo ""
    
    check_heroku_cli
    check_heroku_login
    get_app_name
    create_heroku_app
    deploy_backend
    setup_backend_addons
    configure_environment
    scale_dynos
    setup_database
    show_deployment_summary
}

# Run main function
main "$@"
