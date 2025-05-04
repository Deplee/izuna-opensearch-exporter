#!/bin/sh
# Запуск сервера метрик
node /app/server.js &
# Запуск Nginx
nginx -g "daemon off;"
