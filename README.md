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

# Start all services
docker compose up -d

# Seed database with sample data
docker compose exec backend npm run seed
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

### Local Development (without Docker)
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Database Management
```bash
# Seed database
docker compose exec backend npm run seed

# View logs
docker compose logs backend
docker compose logs frontend
```

### Stop Services
```bash
docker compose down
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