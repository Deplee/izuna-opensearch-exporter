#!/bin/sh
# Запуск сервера метрик в фоне
node server.js &
# Запуск Nginx
nginx -g "daemon off;"
