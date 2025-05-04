# Build stage
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json ./

# Устанавливаем только необходимые пакеты одним RUN
RUN npm install --no-package-lock express@4.18.3 prom-client@15.1.0 axios@1.6.7

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build || true  # если build не нужен, можно убрать

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY src/server ./src/server

CMD ["node", "src/server/app.js"]
