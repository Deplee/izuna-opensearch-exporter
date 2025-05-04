FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Финальный образ на основе nginx + Node.js
FROM nginx:alpine

# Устанавливаем Node.js в финальный образ
RUN apk add --no-cache nodejs npm

# Копируем фронтенд
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем сервер метрик и его зависимости
COPY --from=build /app/package*.json /app/
COPY --from=build /app/server.js /app/
WORKDIR /app
RUN npm install --production

# Копируем конфиги
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 3001
CMD ["/entrypoint.sh"]
