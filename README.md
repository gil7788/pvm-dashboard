# PVM Dashboard

Smart contract benchmarking dashboard for the Polkadot ecosystem.

## Quick Start

### Prerequisites
- Docker
- Docker Compose

### Run with Docker
```bash
# Clone and setup
git clone https://github.com/gil7788/pvm-dashboard.git
cd pvm-dashboard
git checkout feat/backend

# Environment Configuration
cp .env.example .env.development
# Edit .env.development with your values if needed

# Start all services (Development)
docker compose --env-file .env.development up -d

# Or for Production
# cp .env.example .env.production
# Edit .env.production with your production values
# docker compose --env-file .env.production up -d

# Seed database with sample data
docker compose --env-file .env.development exec backend npm run seed
```

### Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs

## Features

- **Contract Management**: Deploy and manage smart contracts
- **Performance Benchmarking**: Compare gas consumption and execution time
- **Multi-Language Support**: Solidity and ink! contracts
- **Real-time Analytics**: Performance metrics and visualizations

## Architecture

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **Containerization**: Docker Compose

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 80 | Next.js application |
| Backend | 3001 | Express API server |
| MongoDB | 27017 | Database |

## Available Pages

- **Dashboard**: `/` - Overview and metrics
- **Contracts**: `/contracts` - List all contracts
- **Deploy**: `/deploy` - Deploy new contracts
- **Contract Details**: `/contract/[id]` - View specific contract

## API Endpoints

### Main Routes
- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/:id` - Get specific contract
- `POST /api/contracts/deploy` - Deploy new contract

### Health Checks
- `GET /api` - API health check
- `GET /api/status` - Detailed status

## Development

## Environment Configuration

### Environment Variables

The project uses environment-specific configuration files:

- **`.env.example`** - Template with all required variables
- **`.env.development`** - Development environment variables
- **`.env.production`** - Production environment variables

### Required Variables

#### Backend Variables
- `MONGO_INITDB_DATABASE` - MongoDB database name
- `MONGO_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)
- `PORT` - Backend server port

#### Frontend Variables
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL
- `NEXT_PUBLIC_BASE_URL` - Frontend base URL

### Environment-Specific Files

#### Development (`.env.development`)
```bash
# Database
MONGO_INITDB_DATABASE=dev_pvm-dashboard
MONGO_URI=mongodb://mongo:27017/dev_pvm-dashboard

# Backend
NODE_ENV=development
PORT=3001

# Frontend
NEXT_PUBLIC_BASE_URL=http://localhost
NEXT_PUBLIC_BACKEND_URL=http://backend:3001
```

#### Production (`.env.production`)
```bash
# Database
MONGO_INITDB_DATABASE=pvm-dashboard
MONGO_URI=mongodb://mongo:27017/pvm-dashboard

# Backend
NODE_ENV=production
PORT=3001

# Frontend
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

### Local Development (without Docker)
```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Database Management
```bash
# Seed database
docker compose --env-file .env.development exec backend npm run seed

# View logs
docker compose --env-file .env.development logs backend
docker compose --env-file .env.development logs frontend
```

### Stop Services
```bash
docker compose --env-file .env.development down
```

### Environment Management
```bash
# Switch to production
docker compose --env-file .env.production up -d

# Switch to development
docker compose --env-file .env.development up -d

# Use custom environment file
docker compose --env-file .env.custom up -d
```

## Project Structure
```
pvm-dashboard/
├── backend/          # Express API
├── frontend/         # Next.js app
├── docker-compose.yml
└── README.md
```

## License

MIT License 