#!/bin/bash

echo "🚀 Deploying Fynito Admin Portal..."
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your production credentials before continuing."
    echo "   Press Enter when ready to continue..."
    read
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p logs
mkdir -p nginx/ssl

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Run database migration
echo "🗄️  Running database migration..."
docker-compose exec backend npm run db:migrate

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
else
    echo "❌ Database migration failed. Please check the logs."
    docker-compose logs backend
    exit 1
fi

# Seed initial data
echo "🌱 Seeding initial data..."
docker-compose exec backend npm run db:seed

# Final status check
echo "🔍 Final status check..."
docker-compose ps

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Application URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - Database: localhost:3306"
echo ""
echo "🔑 Default login credentials:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Update services: docker-compose pull && docker-compose up -d"
echo ""
echo "Happy managing! 🚀"
