#!/bin/bash
# ===========================================================
# DevForge AI — Initial Setup Script
# ===========================================================

set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}🚀 DevForge AI — Initial Setup${NC}"
echo "============================================"
echo ""

# Check prerequisites
echo -e "${CYAN}Checking prerequisites...${NC}"

command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed.${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed.${NC}"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ Python 3 is required but not installed.${NC}"; exit 1; }

echo -e "${GREEN}✓ Docker $(docker --version | cut -d' ' -f3)${NC}"
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ Python $(python3 --version | cut -d' ' -f2)${NC}"
echo ""

# Create .env file
if [ ! -f .env ]; then
    echo -e "${CYAN}Creating .env from template...${NC}"
    cp .env.example .env
    
    # Generate random secrets
    JWT_SECRET=$(openssl rand -hex 32)
    SECRET_KEY=$(openssl rand -hex 32)
    
    # Replace placeholders (macOS & Linux compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/change-this-to-a-random-jwt-secret-key/$JWT_SECRET/" .env
        sed -i '' "s/change-this-to-a-random-secret-key-in-production/$SECRET_KEY/" .env
    else
        sed -i "s/change-this-to-a-random-jwt-secret-key/$JWT_SECRET/" .env
        sed -i "s/change-this-to-a-random-secret-key-in-production/$SECRET_KEY/" .env
    fi
    
    echo -e "${GREEN}✓ .env created with random secrets${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists, skipping${NC}"
fi
echo ""

# Start infrastructure services
echo -e "${CYAN}Starting infrastructure services...${NC}"
docker-compose up -d postgres redis qdrant
echo -e "${GREEN}✓ PostgreSQL, Redis, and Qdrant started${NC}"
echo ""

# Wait for services
echo -e "${CYAN}Waiting for services to be ready...${NC}"
sleep 5

# Check service health
echo -e "${CYAN}Checking service health...${NC}"
docker-compose exec -T postgres pg_isready -U devforge -d devforge >/dev/null 2>&1 && echo -e "${GREEN}✓ PostgreSQL is ready${NC}" || echo -e "${RED}❌ PostgreSQL is not ready${NC}"
docker-compose exec -T redis redis-cli ping >/dev/null 2>&1 && echo -e "${GREEN}✓ Redis is ready${NC}" || echo -e "${RED}❌ Redis is not ready${NC}"
echo ""

# Setup Backend
echo -e "${CYAN}Setting up backend...${NC}"
cd backend
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate 2>/dev/null || true
pip install -r requirements.txt --quiet
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

# Setup Frontend
echo -e "${CYAN}Setting up frontend...${NC}"
cd frontend
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ DevForge AI setup complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. ${YELLOW}Edit .env${NC} with your API keys (OpenAI, Google OAuth, etc.)"
echo -e "  2. Run ${CYAN}make dev${NC} to start all services"
echo -e "  3. Open ${CYAN}http://localhost:3000${NC} in your browser"
echo ""
echo -e "Useful commands:"
echo -e "  ${CYAN}make help${NC}          — Show all available commands"
echo -e "  ${CYAN}make dev${NC}           — Start all services"
echo -e "  ${CYAN}make dev-services${NC}  — Start only DB, Redis, Qdrant"
echo -e "  ${CYAN}make dev-backend${NC}   — Run backend locally"
echo -e "  ${CYAN}make dev-frontend${NC}  — Run frontend locally"
echo ""
