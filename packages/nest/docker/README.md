# Guide Docker

## 🐳 Configuration Docker

### Development

```yaml
version: '3.8'
services:
  db:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Production

```dockerfile
# Build stage
FROM node:18-alpine AS builder
...

# Production stage
FROM node:18-alpine
...
```

## 🚀 Commandes Utiles

```bash
# Démarrer l'environnement de développement
docker-compose up -d

# Logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Nettoyage
docker-compose down -v
```

## 🔧 Maintenance

### Volumes
- `postgres_data`: Données PostgreSQL

### Networks
- Réseau par défaut docker-compose

## 📊 Monitoring

- Logs via `docker logs`
- Métriques via `docker stats`