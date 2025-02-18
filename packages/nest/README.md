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

## 🔧 Environment Variables

```bash
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp
RPC_URL="http://127.0.0.1:8545"
```
