# Dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Сборка сервера метрик
FROM node:18-alpine AS server
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY --from=build /app/dist /app/dist

# Финальный образ
FROM nginx:alpine

# Копируем фронтенд
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем сервер метрик
COPY --from=server /app /app
WORKDIR /app

# Запускаем Nginx и сервер метрик
RUN apk add --no-cache bash
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 3001
CMD ["/entrypoint.sh"]
