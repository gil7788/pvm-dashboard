#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

echo "🔧 Fixing dependency issues for PVM Dashboard"
echo "=============================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Fixing backend dependencies..."

cd backend

# Remove problematic modules
print_status "Removing problematic modules..."
rm -rf node_modules/stack-trace
rm -rf node_modules/@cspotcode/source-map-support

# Clean install
print_status "Performing clean install..."
rm -rf node_modules package-lock.json
npm install

# If that fails, try with force
if [ $? -ne 0 ]; then
    print_warning "Clean install failed, trying with --force..."
    npm install --force
fi

# Install specific versions of problematic packages
print_status "Installing specific versions of problematic packages..."
npm install stack-trace@latest
npm install @cspotcode/source-map-support@latest
npm install winston@latest

cd ..

print_status "Fixing frontend dependencies..."
cd frontend

# Clean install frontend too
rm -rf node_modules package-lock.json
npm install

cd ..

print_success "Dependency fixes completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Try running the setup script again: ./setup.sh install"
echo "2. If seeding still fails, try manually: cd backend && npm run seed"
echo "3. If problems persist, check the troubleshooting section in README.md"
echo "" 