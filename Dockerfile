FROM node:18-alpine AS build

WORKDIR /app

# Копирование файлов проекта
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

# Копирование собранного приложения
COPY --from=build /app/dist /usr/share/nginx/html

# Копирование конфигурации NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Запуск NGINX
CMD ["nginx", "-g", "daemon off;"]
