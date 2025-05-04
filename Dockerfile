FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # Эта команда должна компилировать TS в JS

# Финальный образ
FROM nginx:alpine

# Устанавливаем Node.js
RUN apk add --no-cache nodejs npm

# Копируем скомпилированные JS файлы
COPY --from=build /app/dist /usr/share/nginx/html  # Фронтенд
COPY --from=build /app/build /app  # Бэкенд (если используется отдельная папка для компиляции)
COPY --from=build /app/package*.json /app/
WORKDIR /app
RUN npm install --production

# Копируем конфиги
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 3001
CMD ["/entrypoint.sh"]
