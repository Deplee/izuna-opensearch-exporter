FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Компилируем и TS и собираем фронтенд
RUN npm run build && tsc --outDir ./dist-server

# Финальный образ
FROM nginx:alpine

# Устанавливаем Node.js
RUN apk add --no-cache nodejs npm

# Копируем скомпилированные файлы
# Фронтенд
COPY --from=build /app/dist /usr/share/nginx/html
# Бэкенд
COPY --from=build /app/dist-server /app
COPY --from=build /app/package*.json /app/
WORKDIR /app
RUN npm install --production

# Копируем конфиги
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 3001
CMD ["/entrypoint.sh"]