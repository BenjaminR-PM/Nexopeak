#!/bin/bash

# Nexopeak Development Environment Setup Script
# This script sets up the development environment for Nexopeak

set -e

echo "🚀 Setting up Nexopeak Development Environment..."

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Frontend development will not work locally."
    else
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION found"
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_warning "Python 3 is not installed. Backend development will not work locally."
    else
        PYTHON_VERSION=$(python3 --version)
        print_success "Python $PYTHON_VERSION found"
    fi
    
    print_success "Prerequisites check completed"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Database
DATABASE_URL=postgresql://nexopeak:nexopeak123@localhost:5432/nexopeak

# Security
SECRET_KEY=dev-secret-key-change-in-production

# Google APIs
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLOUD_PROJECT=

# Redis
REDIS_URL=redis://localhost:6379

# Email (SendGrid)
SENDGRID_API_KEY=
FROM_EMAIL=noreply@nexopeak.com

# Slack
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
EOF
        print_success "Created backend/.env"
    else
        print_warning "backend/.env already exists"
    fi
    
    # Frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GA_CLIENT_ID=
EOF
        print_success "Created frontend/.env.local"
    else
        print_warning "frontend/.env.local already exists"
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    if command -v npm &> /dev/null; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    else
        print_warning "npm not found, skipping frontend dependency installation"
    fi
}

# Install backend dependencies
install_backend_deps() {
    if command -v pip3 &> /dev/null; then
        print_status "Installing backend dependencies..."
        cd backend
        pip3 install -r requirements.txt
        cd ..
        print_success "Backend dependencies installed"
    else
        print_warning "pip3 not found, skipping backend dependency installation"
    fi
}

# Start services
start_services() {
    print_status "Starting services with Docker Compose..."
    
    # Start database and Redis
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps postgres | grep -q "Up"; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    
    if docker-compose ps redis | grep -q "Up"; then
        print_success "Redis is running"
    else
        print_error "Redis failed to start"
        exit 1
    fi
}

# Create database tables
setup_database() {
    print_status "Setting up database..."
    
    # Wait a bit more for database to be fully ready
    sleep 5
    
    # Create database tables (this will be handled by FastAPI on startup)
    print_success "Database setup completed (tables will be created on first run)"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your Google OAuth credentials:"
    echo "   - Go to https://console.cloud.google.com/"
    echo "   - Create OAuth 2.0 credentials"
    echo "   - Update backend/.env and frontend/.env.local"
    echo ""
    echo "2. Start the application:"
    echo "   # Start backend"
    echo "   docker-compose up backend"
    echo ""
    echo "   # Start frontend (in another terminal)"
    echo "   docker-compose up frontend"
    echo ""
    echo "3. Access the application:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:8000"
    echo "   - API Docs: http://localhost:8000/docs"
    echo ""
    echo "4. For development:"
    echo "   # Backend (with hot reload)"
    echo "   cd backend && uvicorn main:app --reload"
    echo ""
    echo "   # Frontend (with hot reload)"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "Happy coding! 🚀"
}

# Main setup function
main() {
    echo "Welcome to Nexopeak Development Setup!"
    echo "======================================"
    echo ""
    
    check_prerequisites
    create_env_files
    install_frontend_deps
    install_backend_deps
    start_services
    setup_database
    show_next_steps
}

# Run main function
main "$@"
