# Polkadot Benchmark Dashboard

A comprehensive smart contract benchmarking dashboard for the Polkadot ecosystem. Monitor, analyze, and optimize your smart contract performance across different networks with detailed metrics and comparison tools.

## 🚀 Features

- **Contract Management**: Deploy and manage smart contracts across multiple networks
- **Performance Benchmarking**: Compare gas consumption, execution time, and bytecode size
- **Multi-Language Support**: Solidity and ink! contract analysis
- **Real-time Analytics**: Comprehensive performance metrics and visualizations
- **Network Integration**: Support for Ethereum, Polkadot, and Passethub networks

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Node.js with Express, TypeScript, and MongoDB
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful API with comprehensive endpoints

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v5 or higher)

### Installing MongoDB

#### macOS (with Homebrew):
```bash
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows:
Download and install from [MongoDB official website](https://www.mongodb.com/try/download/community)

## 🛠️ Installation

### Option 1: Automated Setup (Recommended)

Use our setup script to automate the entire installation process:

```bash
git clone https://github.com/gil7788/pvm-dashboard.git
cd pvm-dashboard
git checkout feat/backend

# Make the script executable and run it
chmod +x setup.sh
./setup.sh install
```

The script will:
- ✅ Check prerequisites (Node.js, npm, MongoDB)
- ✅ Install all dependencies
- ✅ Create environment files
- ✅ Seed the database with sample data
- ✅ Start MongoDB if possible

After installation, start the application:
```bash
./setup.sh start
```

### Option 2: Manual Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/gil7788/pvm-dashboard.git
cd pvm-dashboard
git checkout feat/backend
```

#### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 3. Configure Environment Variables

Create the backend environment file:

```bash
cd backend
echo "PORT=3001
DB_NAME=pvm-dashboard
ENV=dev" > .env
```

**Note**: The frontend doesn't need a `.env` file as it uses default values for development.

#### 4. Populate the Database

```bash
cd backend
npm run seed
```

This will create sample contracts, networks, users, and deployments in your database.

## 🚀 Running the Application

### Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### Verify Everything is Working

1. **Frontend**: Visit `http://localhost:3000`
2. **Backend API**: Visit `http://localhost:3001/api/contracts`

You should see the Polkadot Benchmark Dashboard homepage and a JSON response with contract data respectively.

## 📱 Available Pages

- **Home**: `http://localhost:3000` - Dashboard overview
- **Contracts**: `http://localhost:3000/contracts` - List all contracts
- **Deploy**: `http://localhost:3000/deploy` - Deploy new contracts
- **Contract Details**: `http://localhost:3000/contract/[id]` - View specific contract details

## 🔧 API Endpoints

### Contracts
- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/:id` - Get specific contract
- `POST /api/contracts/deploy` - Deploy new contract
- `GET /api/contracts/:id/abi` - Get contract ABI
- `GET /api/contracts/:id/bytecode` - Get contract bytecode
- `GET /api/contracts/:id/functions` - Get contract functions
- `GET /api/contracts/:id/analytics` - Get analytics data
- `POST /api/contracts/:id/benchmark` - Run benchmark

### Networks
- `GET /api/networks` - Get all networks

### Deployments
- `GET /api/deployments` - Get all deployments

## 🗄️ Database Schema

### Collections
- **contracts**: Smart contract information
- **deployments**: Contract deployment records
- **networks**: Network configurations
- **users**: User accounts
- **benchmarks**: Benchmark results

### Sample Data
The seed script creates:
- 4 sample contracts (DEX Aggregator, DAO Governance, NFT Marketplace, DeFi Lending Protocol)
- 3 networks (Ethereum, Polkadot, Passethub)
- 1 default user
- Multiple deployments with ABI and bytecode data

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

#### 2. Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution**: Kill existing processes or use different ports:
```bash
lsof -ti:3000,3001 | xargs kill -9
```

#### 3. Missing Dependencies
```
Error: Cannot find module 'express'
```
**Solution**: Reinstall dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

#### 4. TypeScript Compilation Errors
```
TSError: Unable to compile TypeScript
```
**Solution**: Clear TypeScript cache and restart:
```bash
cd backend && rm -rf node_modules/.cache && npm run dev
```

#### 5. Setup Script Issues
```
Permission denied: ./setup.sh
```
**Solution**: Make the script executable:
```bash
chmod +x setup.sh
```

```
Command not found: lsof
```
**Solution**: Install lsof (usually pre-installed on macOS/Linux):
```bash
# macOS
brew install lsof

# Linux
sudo apt install lsof
```

#### 6. Dependency Issues (stack-trace module)
```
Error: Cannot find module 'stack-trace'
```
**Solution**: Run the dependency fix script:
```bash
chmod +x fix-dependencies.sh
./fix-dependencies.sh
```

This script will:
- Remove corrupted modules
- Perform clean installs
- Install specific versions of problematic packages
- Fix winston logging dependencies

After running the fix script, try the setup again:
```bash
./setup.sh install
```

### Setup Script Commands

```bash
./setup.sh install    # Install dependencies and setup the project
./setup.sh start      # Start the application (backend and frontend)
./setup.sh stop       # Stop the application
./setup.sh restart    # Restart the application
./setup.sh clean      # Clean up and stop all processes
./setup.sh help       # Show help message
```

### Development Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run seed         # Populate database with sample data

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
pvm-dashboard/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── db/             # Database connection
│   │   └── utils/          # Utilities
│   ├── scripts/            # Database seeding
│   └── package.json
├── frontend/
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utilities and configurations
│   ├── types/            # TypeScript type definitions
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the logs in the terminal
3. Create an issue in the GitHub repository

## 🎯 Current Status

- ✅ **Part 1**: Database structure and models
- ✅ **Part 2**: Contract Page functionality
- 🔄 **Part 3**: Advanced filtering and search
- 🔄 **Part 4**: Dockerization
- 🔄 **Part 5**: Production deployment

---

**Happy benchmarking! 🚀** 