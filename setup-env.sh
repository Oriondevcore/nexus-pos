#!/bin/bash

# NEXUS POS - Environment Setup Script
# This script automates the initial setup process

echo "======================================"
echo "NEXUS POS - Environment Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run from project root.${NC}"
    exit 1
fi

# Step 1: Check Node version
echo -e "${YELLOW}Step 1: Checking Node.js version...${NC}"
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Please install Node.js 16+ first.${NC}"
    exit 1
fi
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies.${NC}"
    exit 1
fi
echo -e "${GREEN}Dependencies installed successfully.${NC}"
echo ""

# Step 3: Setup .env file
echo -e "${YELLOW}Step 3: Setting up .env file...${NC}"
if [ -f ".env" ]; then
    echo -e "${YELLOW}.env file already exists. Keep existing? (y/n)${NC}"
    read -r KEEP_ENV
    if [ "$KEEP_ENV" != "y" ]; then
        echo "Creating new .env file..."
        cp .env.example .env
    fi
else
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}.env created. Please edit with your credentials.${NC}"
fi
echo ""

# Step 4: Verify .env configuration
echo -e "${YELLOW}Step 4: Checking .env configuration...${NC}"
REQUIRED_VARS=(
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_YOCO_PUBLIC_KEY"
)

MISSING_VARS=0
for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "$var=" .env; then
        VALUE=$(grep "^$var=" .env | cut -d'=' -f2 | cut -d' ' -f1)
        if [ -z "$VALUE" ] || [ "$VALUE" = "your_*" ] || [ "$VALUE" = "example_value" ]; then
            echo -e "${RED}✗ $var is not configured${NC}"
            MISSING_VARS=$((MISSING_VARS + 1))
        else
            echo -e "${GREEN}✓ $var is configured${NC}"
        fi
    else
        echo -e "${RED}✗ $var is missing from .env${NC}"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
done

if [ $MISSING_VARS -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Please configure missing variables in .env:${NC}"
    echo "1. Open .env file"
    echo "2. Add your Firebase credentials"
    echo "3. Add your Yoco Public Key"
    echo "4. Save the file"
    echo ""
    echo "Then run: npm run dev"
    exit 0
fi
echo -e "${GREEN}All required variables configured!${NC}"
echo ""

# Step 5: Check Firebase CLI
echo -e "${YELLOW}Step 5: Checking Firebase CLI...${NC}"
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}Firebase CLI not found. Install? (y/n)${NC}"
    read -r INSTALL_FIREBASE
    if [ "$INSTALL_FIREBASE" = "y" ]; then
        npm install -g firebase-tools
    fi
else
    echo -e "${GREEN}Firebase CLI is installed${NC}"
fi
echo ""

# Step 6: Verify Build
echo -e "${YELLOW}Step 6: Verifying build...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build successful!${NC}"
else
    echo -e "${RED}Build failed. Check errors above.${NC}"
    exit 1
fi
echo ""

# Step 7: Summary
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review .env file: cat .env"
echo "2. Start development server: npm run dev"
echo "3. View at: http://localhost:5173"
echo ""
echo "For Cloud Functions setup:"
echo "1. Read: FIREBASE_SETUP_GUIDE.md"
echo "2. Initialize functions: firebase init functions"
echo "3. Deploy: firebase deploy --only functions"
echo ""
echo "For deployment:"
echo "1. Read: DEPLOYMENT_GUIDE.md"
echo "2. Build: npm run build"
echo "3. Deploy to Firebase Hosting: firebase deploy --only hosting"
echo ""
