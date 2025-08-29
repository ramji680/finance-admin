#!/bin/bash

echo "🚀 Setting up Fynito Admin Portal..."
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0+ first."
    exit 1
fi

echo "✅ MySQL found"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p uploads
mkdir -p dist

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database and API credentials"
else
    echo "✅ Environment file already exists"
fi

# Check if .env has been configured
if grep -q "your_password" .env; then
    echo "⚠️  Please update .env file with your actual credentials before proceeding"
    echo "   - Database password"
    echo "   - JWT secret"
    echo "   - Razorpay credentials"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your credentials"
echo "   2. Create MySQL database: CREATE DATABASE fynito_admin;"
echo "   3. Run database migration: npm run db:migrate"
echo "   4. Start development servers: npm run dev"
echo ""
echo "🔑 Default superadmin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📱 The application will be available at:"
echo "   - Backend: http://localhost:5000"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "Happy coding! 🚀"
