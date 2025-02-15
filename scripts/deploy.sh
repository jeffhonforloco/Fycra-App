#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting deployment...${NC}"

# Build the application
echo "Building application..."
npm run build

# Run tests
echo "Running tests..."
npm test

# Deploy to Netlify
echo "Deploying to Netlify..."
npx netlify deploy --prod --dir=dist

echo -e "${GREEN}Deployment completed successfully!${NC}"