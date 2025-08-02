#!/bin/bash

# Polkadot Benchmark Dashboard Setup Script
# This script automates the installation and setup process

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js version $(node -v) is compatible"
            return 0
        else
            print_error "Node.js version $(node -v) is too old. Please install Node.js 18 or higher."
            return 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        return 1
    fi
}

# Function to check npm version
check_npm_version() {
    if command_exists npm; then
        NPM_VERSION=$(npm -v | cut -d'.' -f1)
        if [ "$NPM_VERSION" -ge 8 ]; then
            print_success "npm version $(npm -v) is compatible"
            return 0
        else
            print_error "npm version $(npm -v) is too old. Please install npm 8 or higher."
            return 1
        fi
    else
        print_error "npm is not installed. Please install npm 8 or higher."
        return 1
    fi
}

# Function to check MongoDB
check_mongodb() {
    if command_exists mongod; then
        print_success "MongoDB is installed"
        return 0
    else
        print_warning "MongoDB is not installed. Please install MongoDB first."
        echo "Installation instructions:"
        echo "  macOS: brew install mongodb-community"
        echo "  Linux: sudo apt install mongodb"
        echo "  Windows: Download from https://www.mongodb.com/try/download/community"
        return 1
    fi
}

# Function to start MongoDB
start_mongodb() {
    print_status "Starting MongoDB..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew services start mongodb-community 2>/dev/null || print_warning "Could not start MongoDB via brew. Please start it manually."
        else
            print_warning "Please start MongoDB manually: brew services start mongodb-community"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo systemctl start mongod 2>/dev/null || print_warning "Could not start MongoDB via systemctl. Please start it manually."
    else
        print_warning "Please start MongoDB manually for your operating system."
    fi
    
    # Wait a moment for MongoDB to start
    sleep 3
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing backend dependencies..."
    cd backend
    
    # Clean install to avoid dependency conflicts
    rm -rf node_modules package-lock.json
    npm install
    if [ $? -ne 0 ]; then
        print_warning "First install failed, trying with --force..."
        npm install --force
        if [ $? -ne 0 ]; then
            print_error "Failed to install backend dependencies"
            exit 1
        fi
    fi
    cd ..
    
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Function to fix common dependency issues
fix_dependency_issues() {
    print_status "Checking for common dependency issues..."
    
    cd backend
    
    # Fix stack-trace module issue
    if [ -d "node_modules/stack-trace" ] && [ ! -f "node_modules/stack-trace/package.json" ]; then
        print_warning "Fixing corrupted stack-trace module..."
        rm -rf node_modules/stack-trace
        npm install stack-trace@latest
    fi
    
    # Fix winston dependency issues
    if [ -d "node_modules/winston" ]; then
        print_warning "Ensuring winston dependencies are correct..."
        npm install winston@latest
    fi
    
    cd ..
}

# Function to create environment file
create_env_file() {
    print_status "Creating backend environment file..."
    
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
PORT=3001
DB_NAME=pvm-dashboard
ENV=dev
EOF
        print_success "Environment file created"
    else
        print_warning "Environment file already exists, skipping..."
    fi
}

# Function to seed database
seed_database() {
    print_status "Seeding database with sample data..."
    cd backend
    
    # Try to fix stack-trace issue if it exists
    if [ -d "node_modules/stack-trace" ]; then
        print_warning "Fixing stack-trace module issue..."
        rm -rf node_modules/stack-trace
        npm install stack-trace@latest
    fi
    
    # Try seeding with error handling
    npm run seed
    if [ $? -ne 0 ]; then
        print_warning "Seeding failed, trying alternative approach..."
        # Try running the script directly with ts-node
        npx ts-node src/scripts/seedDatabase.ts
        if [ $? -ne 0 ]; then
            print_error "Failed to seed database"
            print_warning "You can try seeding manually later with: cd backend && npm run seed"
        else
            print_success "Database seeded successfully (alternative method)"
        fi
    else
        print_success "Database seeded successfully"
    fi
    
    cd ..
}

# Function to check if ports are available
check_ports() {
    print_status "Checking if ports 3000 and 3001 are available..."
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3000 is already in use. Please stop the process using this port."
        return 1
    fi
    
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3001 is already in use. Please stop the process using this port."
        return 1
    fi
    
    print_success "Ports 3000 and 3001 are available"
    return 0
}

# Function to start the application
start_application() {
    print_status "Starting the application..."
    
    # Start backend in background
    print_status "Starting backend server..."
    cd backend
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Start frontend in background
    print_status "Starting frontend server..."
    cd frontend
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 5
    
    print_success "Application started successfully!"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001"
    echo ""
    echo "📋 Available pages:"
    echo "  - Home: http://localhost:3000"
    echo "  - Contracts: http://localhost:3000/contracts"
    echo "  - Deploy: http://localhost:3000/deploy"
    echo ""
    echo "📝 Logs:"
    echo "  - Backend: tail -f backend.log"
    echo "  - Frontend: tail -f frontend.log"
    echo ""
    echo "🛑 To stop the application:"
    echo "  kill $BACKEND_PID $FRONTEND_PID"
    echo ""
    
    # Save PIDs to file for easy cleanup
    echo "$BACKEND_PID $FRONTEND_PID" > .pids
    print_success "PIDs saved to .pids file"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    if [ -f ".pids" ]; then
        PIDS=$(cat .pids)
        kill $PIDS 2>/dev/null || true
        rm .pids
    fi
    
    # Kill any remaining processes on our ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Polkadot Benchmark Dashboard Setup Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  install    Install dependencies and setup the project"
    echo "  start      Start the application (backend and frontend)"
    echo "  stop       Stop the application"
    echo "  restart    Restart the application"
    echo "  clean      Clean up and stop all processes"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install    # Install and setup everything"
    echo "  $0 start      # Start the application"
    echo "  $0 stop       # Stop the application"
    echo ""
}

# Main script logic
main() {
    case "${1:-install}" in
        "install")
            print_status "Starting installation process..."
            
            # Check prerequisites
            print_status "Checking prerequisites..."
            check_node_version || exit 1
            check_npm_version || exit 1
            check_mongodb || print_warning "MongoDB check failed, but continuing..."
            
            # Start MongoDB if possible
            start_mongodb
            
            # Install dependencies
            install_dependencies
            
            # Fix common dependency issues
            fix_dependency_issues
            
            # Create environment file
            create_env_file
            
            # Seed database
            seed_database
            
            print_success "Installation completed successfully!"
            echo ""
            echo "🎉 Ready to start the application!"
            echo "Run: $0 start"
            ;;
            
        "start")
            print_status "Starting application..."
            
            # Check if ports are available
            check_ports || exit 1
            
            # Start the application
            start_application
            ;;
            
        "stop")
            print_status "Stopping application..."
            cleanup
            print_success "Application stopped"
            ;;
            
        "restart")
            print_status "Restarting application..."
            cleanup
            sleep 2
            start_application
            ;;
            
        "clean")
            print_status "Cleaning up..."
            cleanup
            print_success "Cleanup completed"
            ;;
            
        "help"|"-h"|"--help")
            show_help
            ;;
            
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Trap to cleanup on script exit (only for install and clean commands)
if [[ "$1" == "install" || "$1" == "clean" ]]; then
    trap cleanup EXIT
fi

# Run main function
main "$@" 