#!/bin/bash

# FoodConnect Deploy Script
# This script handles deployment of the FoodConnect application

set -e

echo "🚀 Starting FoodConnect deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
ENV_FILE=".env.${ENVIRONMENT}"

echo -e "${BLUE}📋 Environment: ${ENVIRONMENT}${NC}"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file ${ENV_FILE} not found!${NC}"
    echo "Please create the environment file with required variables."
    exit 1
fi

# Load environment variables
export $(cat $ENV_FILE | xargs)

echo -e "${YELLOW}🔧 Pre-deployment checks...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are available${NC}"

# Generate VAPID keys if not set
if [ -z "$VAPID_PUBLIC_KEY" ] || [ -z "$VAPID_PRIVATE_KEY" ]; then
    echo -e "${YELLOW}🔑 Generating VAPID keys for push notifications...${NC}"
    cd backend
    npm install web-push
    VAPID_KEYS=$(npx web-push generate-vapid-keys --json)
    VAPID_PUBLIC=$(echo $VAPID_KEYS | jq -r '.publicKey')
    VAPID_PRIVATE=$(echo $VAPID_KEYS | jq -r '.privateKey')
    
    echo "VAPID_PUBLIC_KEY=$VAPID_PUBLIC" >> ../$ENV_FILE
    echo "VAPID_PRIVATE_KEY=$VAPID_PRIVATE" >> ../$ENV_FILE
    
    echo -e "${GREEN}✅ VAPID keys generated and saved to ${ENV_FILE}${NC}"
    cd ..
fi

echo -e "${YELLOW}🐳 Building Docker images...${NC}"

# Build and start containers
docker-compose --env-file $ENV_FILE down --remove-orphans
docker-compose --env-file $ENV_FILE build --no-cache

echo -e "${YELLOW}📦 Starting services...${NC}"

# Start services in order
docker-compose --env-file $ENV_FILE up -d postgres redis

echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Run database migrations
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
docker-compose --env-file $ENV_FILE exec -T backend npx prisma migrate deploy

# Start remaining services
docker-compose --env-file $ENV_FILE up -d backend frontend nginx

echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 15

# Health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"

# Check backend health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose --env-file $ENV_FILE logs backend
    exit 1
fi

# Check frontend health
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose --env-file $ENV_FILE logs frontend
    exit 1
fi

# Check nginx health
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx is healthy${NC}"
else
    echo -e "${RED}❌ Nginx health check failed${NC}"
    docker-compose --env-file $ENV_FILE logs nginx
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📱 Application is available at:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost${NC}"
echo -e "   Backend API: ${GREEN}http://localhost/api${NC}"
echo -e "   Database: ${GREEN}localhost:5432${NC}"
echo -e "   Redis: ${GREEN}localhost:6379${NC}"

echo -e "${YELLOW}📊 Container status:${NC}"
docker-compose --env-file $ENV_FILE ps

echo -e "${BLUE}💡 Useful commands:${NC}"
echo -e "   View logs: ${YELLOW}docker-compose --env-file $ENV_FILE logs -f [service]${NC}"
echo -e "   Stop all: ${YELLOW}docker-compose --env-file $ENV_FILE down${NC}"
echo -e "   Restart: ${YELLOW}docker-compose --env-file $ENV_FILE restart [service]${NC}"

echo -e "${GREEN}🚀 FoodConnect is now running!${NC}"