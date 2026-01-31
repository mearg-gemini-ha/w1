#!/bin/bash

# Verification script for W Game setup
# This script checks that the foundation is properly configured

set -e  # Exit on error

echo "🔍 W Game - Foundation Verification"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check dependencies
echo ""
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Root dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Root dependencies not installed. Run: npm install"
    exit 1
fi

if [ -d "client/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Client dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Client dependencies not installed"
fi

if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Server dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Server dependencies not installed"
fi

# Check environment files
echo ""
echo "🔧 Checking environment configuration..."
if [ -f "server/.env.example" ]; then
    echo -e "${GREEN}✓${NC} Server .env.example exists"
else
    echo -e "${RED}✗${NC} Server .env.example missing"
fi

if [ -f "client/.env.example" ]; then
    echo -e "${GREEN}✓${NC} Client .env.example exists"
else
    echo -e "${RED}✗${NC} Client .env.example missing"
fi

# Check TypeScript configuration
echo ""
echo "📝 Checking TypeScript configuration..."
if [ -f "server/tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} Server tsconfig.json exists"
else
    echo -e "${RED}✗${NC} Server tsconfig.json missing"
fi

if [ -f "client/tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} Client tsconfig.json exists"
else
    echo -e "${RED}✗${NC} Client tsconfig.json missing"
fi

# Check linting configuration
echo ""
echo "🔍 Checking code quality tools..."
if [ -f ".prettierrc" ]; then
    echo -e "${GREEN}✓${NC} Prettier configured"
else
    echo -e "${RED}✗${NC} Prettier config missing"
fi

if [ -f "server/.eslintrc.json" ]; then
    echo -e "${GREEN}✓${NC} Server ESLint configured"
else
    echo -e "${RED}✗${NC} Server ESLint config missing"
fi

if [ -f "client/.eslintrc.json" ]; then
    echo -e "${GREEN}✓${NC} Client ESLint configured"
else
    echo -e "${RED}✗${NC} Client ESLint config missing"
fi

# Check migrations
echo ""
echo "🗄️  Checking database migrations..."
MIGRATION_COUNT=$(ls -1 server/migrations/*.sql 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -ge 6 ]; then
    echo -e "${GREEN}✓${NC} Database migrations present ($MIGRATION_COUNT files)"
else
    echo -e "${RED}✗${NC} Missing database migrations"
fi

# Run formatting check
echo ""
echo "✨ Running code formatting check..."
if npm run format:check >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Code formatting is correct"
else
    echo -e "${YELLOW}⚠${NC} Code formatting issues found. Run: npm run format"
fi

# Run linting
echo ""
echo "🔎 Running linter..."
if npm run lint >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Linting passed"
else
    echo -e "${RED}✗${NC} Linting errors found. Run: npm run lint"
    exit 1
fi

# Run tests
echo ""
echo "🧪 Running tests..."
if npm test >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} All tests passed"
else
    echo -e "${RED}✗${NC} Tests failed. Run: npm test"
    exit 1
fi

# Build check
echo ""
echo "🏗️  Building projects..."
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed. Run: npm run build"
    exit 1
fi

# Final summary
echo ""
echo "===================================="
echo -e "${GREEN}✓ Foundation setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Set up your database (see QUICKSTART.md)"
echo "  2. Configure environment variables"
echo "  3. Run migrations"
echo "  4. Start development: npm run dev"
echo ""
echo "Happy coding! 🚀"
