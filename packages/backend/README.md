# AgentDEX API

API for AgentDEX protocol.

## 🛠️ Technologies

- **NestJS**: Backend
- **PostgreSQL**: Database
- **Docker**: Containerisation
- **Swagger**: Documentation

## 🚀 Getting Started

```bash
# Installation
yarn install

# Make sure to setup .env.local
yarn setup-env # You need to update the factory contract address!

# Start PostgreSQL
yarn db

# Tests
yarn test

# Dev
# 1. local server
yarn run start:dev

# 2. Docker server
# 2a. Build
yarn docker:build

# 2b. Run
yarn docker:run
```

## 📊 Database

### Configuration

- Port: 5432
- Base: myapp
- Utilisateur: postgres
- Mot de passe: postgres

### Migrations

See [Migration docs](./db/README.md)

> We're using [TypeORM](https://typeorm.io/) for database management. Thus the migrations are handled by TypeORM. Make sure to remove the `sync` option in production.

## 📝 API Documentation

Swagger UI available at [http://localhost:5001/api](http://localhost:5001/api)

## 🏗️ Architecture

### Event Handling System

The AgentDEX API features a robust event-handling system that listens for blockchain events, processes them, and updates the database accordingly. This system is crucial for maintaining real-time data synchronization between the blockchain and our backend.

#### Event Services

The event handling architecture consists of three main services:

1. **EventsService**: The main entry point for blockchain integration, responsible for:
   - Initializing event watchers when the application starts
   - Watching for factory events (new pool creations)
   - Starting watchers for existing pools
   - Delegating specific event handling to specialized services

2. **EventsGlobalService**: Acts as a central router for all events:
   - Receives events from both EventsService and EventsPoolService
   - Maps blockchain events to database entities
   - Persists event data to the database
   - Handles multiple event types (PairCreated, Mint, Burn, Swap, SwapForwarded)

3. **EventsPoolService**: Specializes in pool-specific events:
   - Watches for events from individual liquidity pools
   - Processes Mint, Burn, Swap, and SwapForwarded events
   - Updates related services with new data (Pools, LiquidityProviders, Users)
   - Fetches updated reserves after swaps

#### Data Flow

When a blockchain event occurs:

1. The event is captured by either EventsService (for factory events) or EventsPoolService (for pool events)
2. The event is then passed to EventsGlobalService for storage in the database
3. Additional services are updated as needed:
   - PoolsService: Updates pool reserves and information
   - LiquidityProvidersService: Updates LP token balances and positions
   - UsersService: Tracks user interactions with the protocol

#### Integration with Viem

We use the `viem` library to interact with the blockchain:
- `createPublicClient`: Creates a connection to the blockchain
- `watchContractEvent`: Sets up event listeners for specific contracts
- `parseAbiItem`: Parses event signatures for proper event detection


### Technical Implementation

The event services are implemented as NestJS injectable services, organized in the following directory structure:

```
/src
├── events
│   ├── dto
│   │   └── event.dto.ts
│   ├── events.module.ts
│   ├── events.providers.ts
│   └── services
│       ├── events-global.service.ts   # Central router for all events
│       ├── events-pool.service.ts     # Handles pool-specific events
│       └── events.service.ts          # Main entry point, watches factory
```

Each service is responsible for a specific aspect of event handling, following the single responsibility principle.

### Database Schema

The events are stored in the database using the `Event` entity with the following structure:
- **type**: The event type (PairCreated, Mint, Burn, Swap, SwapForwarded)
- **sender**: The address that triggered the event
- **poolAddress**: The address of the related pool
- **amount0/amount1**: Token amounts involved in the event
- **transactionHash**: The hash of the transaction
- **blockNumber**: The block number where the event occurred

This schema allows for efficient querying and analysis of protocol activity.

## 🔧 Environment Variables

```bash
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp
RPC_URL="http://127.0.0.1:8545"
FACTORY_ADDRESS="0x..."
```
