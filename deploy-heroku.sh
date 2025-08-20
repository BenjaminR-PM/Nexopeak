#!/bin/bash

# Nexopeak Heroku Deployment Script
# This script automates the deployment to Heroku

set -e

echo "🚀 Deploying Nexopeak to Heroku..."

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
        print_error "Heroku CLI is not installed. Please install it first:"
        echo "  macOS: brew tap heroku/brew && brew install heroku"
        echo "  Linux: curl https://cli-assets.heroku.com/install.sh | sh"
        echo "  Windows: Download from https://devcenter.heroku.com/articles/heroku-cli"
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

# Get app names from user
get_app_names() {
    echo ""
    read -p "Enter backend app name (e.g., nexopeak-backend): " BACKEND_APP
    read -p "Enter frontend app name (e.g., nexopeak-frontend): " FRONTEND_APP
    
    if [ -z "$BACKEND_APP" ] || [ -z "$FRONTEND_APP" ]; then
        print_error "App names cannot be empty"
        exit 1
    fi
}

# Create Heroku apps
create_heroku_apps() {
    print_status "Creating Heroku apps..."
    
    # Create backend app
    if ! heroku apps:info -a "$BACKEND_APP" &> /dev/null; then
        print_status "Creating backend app: $BACKEND_APP"
        heroku create "$BACKEND_APP" --buildpack heroku/python
    else
        print_warning "Backend app $BACKEND_APP already exists"
    fi
    
    # Create frontend app
    if ! heroku apps:info -a "$FRONTEND_APP" &> /dev/null; then
        print_status "Creating frontend app: $FRONTEND_APP"
        heroku create "$FRONTEND_APP" --buildpack heroku/nodejs
    else
        print_warning "Frontend app $FRONTEND_APP already exists"
    fi
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend to $BACKEND_APP..."
    
    cd backend
    
    # Add Heroku remote
    if ! git remote | grep -q heroku; then
        heroku git:remote -a "$BACKEND_APP"
    fi
    
    # Deploy
    git add .
    git commit -m "Deploy backend to Heroku" || true
    git push heroku main
    
    cd ..
    print_success "Backend deployed successfully"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to $FRONTEND_APP..."
    
    cd frontend
    
    # Add Heroku remote
    if ! git remote | grep -q heroku; then
        heroku git:remote -a "$FRONTEND_APP"
    fi
    
    # Deploy
    git add .
    git commit -m "Deploy frontend to Heroku" || true
    git push heroku main
    
    cd ..
    print_success "Frontend deployed successfully"
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
    
    # Backend environment variables
    print_status "Setting backend environment variables..."
    
    # Get backend URL
    BACKEND_URL="https://$BACKEND_APP.herokuapp.com"
    
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
    
    # Frontend environment variables
    print_status "Setting frontend environment variables..."
    heroku config:set NEXT_PUBLIC_API_URL="$BACKEND_URL" -a "$FRONTEND_APP"
    heroku config:set NEXT_PUBLIC_GA_CLIENT_ID="" -a "$FRONTEND_APP"
}

# Scale dynos
scale_dynos() {
    print_status "Scaling dynos..."
    
    # Scale backend
    heroku ps:scale web=1 worker=1 beat=1 -a "$BACKEND_APP"
    
    # Scale frontend
    heroku ps:scale web=1 -a "$FRONTEND_APP"
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
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "Your Nexopeak apps are now running on Heroku:"
    echo ""
    echo "🔧 Backend API:"
    echo "   URL: https://$BACKEND_APP.herokuapp.com"
    echo "   Health Check: https://$BACKEND_APP.herokuapp.com/health"
    echo "   API Docs: https://$BACKEND_APP.herokuapp.com/docs"
    echo ""
    echo "🎨 Frontend:"
    echo "   URL: https://$FRONTEND_APP.herokuapp.com"
    echo ""
    echo "📊 Monitoring:"
    echo "   Backend Logs: heroku logs --tail -a $BACKEND_APP"
    echo "   Frontend Logs: heroku logs --tail -a $FRONTEND_APP"
    echo "   Database: heroku pg:psql -a $BACKEND_APP"
    echo "   Redis: heroku redis:cli -a $BACKEND_APP"
    echo ""
    echo "🔧 Next Steps:"
    echo "1. Update Google OAuth credentials in backend config"
    echo "2. Configure SendGrid API key for email notifications"
    echo "3. Set up Slack integration if needed"
    echo "4. Test the application endpoints"
    echo "5. Monitor logs for any issues"
    echo ""
    echo "Happy testing! 🚀"
}

# Main deployment function
main() {
    echo "Welcome to Nexopeak Heroku Deployment!"
    echo "======================================"
    echo ""
    
    check_heroku_cli
    check_heroku_login
    get_app_names
    create_heroku_apps
    deploy_backend
    deploy_frontend
    setup_backend_addons
    configure_environment
    scale_dynos
    setup_database
    show_deployment_summary
}

# Run main function
main "$@"
