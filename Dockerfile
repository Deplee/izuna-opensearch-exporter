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
RUN npm run build

# Production stage
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Copy built assets from builder
COPY --from=builder /app/dist .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
