#!/bin/bash

# 🚀 Fynito Admin Portal - Render Deployment Script
# This script helps deploy both backend and frontend to Render

echo "🚀 Starting Fynito Admin Portal deployment to Render..."

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

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Deploy: Build and prepare for Render deployment"
    print_success "Changes committed successfully"
fi

# Build both applications
print_status "Building frontend application..."
cd frontend
npm run build:static
if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

cd ..

print_status "Building backend application..."
npm run build:backend
if [ $? -eq 0 ]; then
    print_success "Backend built successfully"
else
    print_error "Backend build failed"
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Please create it first."
    exit 1
fi

print_success "✅ Build completed successfully!"
print_status "📋 Next steps for Render deployment:"
echo ""
echo "1. Push your code to GitHub/GitLab:"
echo "   git push origin main"
echo ""
echo "2. Go to Render Dashboard: https://dashboard.render.com"
echo ""
echo "3. Create a new Web Service:"
echo "   - Connect your repository"
echo "   - Render will automatically detect render.yaml"
echo "   - Two services will be created:"
echo "     • fynito-admin-backend (API)"
echo "     • fynito-admin-frontend (Web App)"
echo ""
echo "4. Update environment variables in Render dashboard if needed"
echo ""
echo "5. Your services will be available at:"
echo "   • Backend: https://fynito-admin-backend.onrender.com"
echo "   • Frontend: https://fynito-admin-frontend.onrender.com"
echo ""
print_success "🎉 Ready for deployment!"
