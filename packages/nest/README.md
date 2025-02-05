# API NestJS

API REST construite avec NestJS et PostgreSQL.

## 🛠️ Technologies

- **NestJS**: Framework backend
- **PostgreSQL**: Base de données
- **Docker**: Conteneurisation
- **Swagger**: Documentation API

## 🚀 Démarrage

```bash
# Installation
pnpm install

# Démarrer PostgreSQL
docker-compose up -d

# Setup de la base de données
pnpm run db:setup

# Développement
pnpm run start:dev

# Tests
pnpm test

# Build Docker
docker build -t api .
```

## 📊 Base de Données

### Configuration

- Port: 5432
- Base: myapp
- Utilisateur: postgres
- Mot de passe: postgres

### Migrations

Voir [documentation des migrations](./db/README.md)

## 📝 API Documentation

Swagger UI disponible sur `/api` en développement.

### Endpoints

- `GET /users`: Liste des utilisateurs
- `GET /users/:id`: Détails d'un utilisateur
- `POST /users`: Création d'utilisateur

## 🐳 Docker

```bash
# Build
docker build -t api .

# Run
docker run -p 5001:5001 \
  --env DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/myapp \
  api
```

## 🔧 Variables d'Environnement

```bash
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp
```

## 📈 Monitoring & Logs

- Logs applicatifs dans `./logs`
- Monitoring via les métriques NestJS
