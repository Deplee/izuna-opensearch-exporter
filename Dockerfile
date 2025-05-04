FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Финальный образ
FROM nginx:alpine

# Устанавливаем Node.js
RUN apk add --no-cache nodejs npm

# Копируем ВСЕ необходимые файлы для сервера метрик
COPY --from=build /app/package*.json /app/
COPY --from=build /app/server.js /app/
COPY --from=build /app/src /app/src  # Копируем всю папку src
WORKDIR /app
RUN npm install --production

# Копируем фронтенд
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфиги
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 3001
CMD ["/entrypoint.sh"]
