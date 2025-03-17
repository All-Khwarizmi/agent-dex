# Build stage
FROM node:18-alpine AS builder

# Installer pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copier les fichiers de configuration d'abord
COPY package.json tsconfig.json ./
COPY tsconfig.build.json ./

# Installer les dépendances avec pnpm
RUN pnpm install

# Copier le reste du code source
COPY . .

# Build l'application avec pnpm
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Installer pnpm dans l'image de production aussi
RUN npm install -g pnpm

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 5001

# Utiliser pnpm pour la commande de démarrage
CMD ["pnpm", "run", "start:prod"]