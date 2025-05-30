
# Docker Guide for Prometheus & OpenSearch Integration

Этот проект предоставляет решение для мониторинга с использованием Prometheus и OpenSearch, с веб-интерфейсом для визуализации.

## Инструкция по запуску в Docker

### Предварительные требования

- Docker установлен на вашей системе
- Не менее 4 ГБ ОЗУ доступно для контейнеров
- Порты 3000, 9090 и 9200 доступны на вашей хост-машине

### Быстрый старт

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/Deplee/izuna-opensearch-exporter.git
   cd izuna-opensearch-exporter
   ```

2. Запустите контейнеры:
   ```bash
   docker compose build
   docker compose up -d
   ```

3. Доступ к следующим сервисам:
   - **Веб-интерфейс**: [http://localhost:8080](http://localhost:8080)
   - **OpenSearch Cluster**: [http://localhost:9200](http://localhost:9200)
     - Имя пользователя: `admin`
     - Пароль: `admin`

### Детали контейнеров

Docker Compose настройка включает следующие сервисы:

- **Веб-приложение**: Frontend интерфейс для визуализации и управления

### Настройка

- Конфигурация Prometheus находится в `./docker-setup/exporter/prometheus.yml`
- Данные OpenSearch сохраняются в томе `opensearch-data`
- Переменные окружения могут быть изменены в файле docker-compose.yml

### Устранение неполадок

- Если OpenSearch не запускается, возможно, вам нужно увеличить виртуальную память, доступную для Docker:
  ```bash
  sysctl -w vm.max_map_count=262144
  ```

- Проверьте логи контейнера для выявления проблем:
  ```bash
  docker compose logs [имя-сервиса]
  ```

### Пользовательские метрики

Чтобы добавить пользовательские метрики в Prometheus:
1. Измените файл `prometheus.yml`, чтобы добавить дополнительные цели
2. Перезапустите контейнер Prometheus:
   ```bash
   docker compose restart prometheus
   ```

## Настройка CORS в OpenSearch

Для корректной работы с браузером убедитесь, что в конфигурации OpenSearch в файле `opensearch.yml` добавлены следующие строки:

```yml
http.cors.enabled: true
http.cors.allow-origin: "*" # или конкретный URL вашего приложения
http.cors.allow-methods: OPTIONS, HEAD, GET, POST, PUT, DELETE
http.cors.allow-headers: X-Requested-With, X-Auth-Token, Content-Type, Content-Length, Authorization
```

После изменения конфигурации необходимо перезапустить OpenSearch.

## Настройка CORS в Docker Compose

Если вы используете Docker Compose для запуска OpenSearch, добавьте следующие переменные окружения:

```yaml
version: '3'
services:
  opensearch:
    image: opensearchproject/opensearch:2.11.1
    environment:
      # CORS настройки
      - "http.cors.enabled=true"
      - "http.cors.allow-origin=*"
      - "http.cors.allow-methods=OPTIONS,HEAD,GET,POST,PUT,DELETE"
      - "http.cors.allow-headers=X-Requested-With,X-Auth-Token,Content-Type,Content-Length,Authorization"
      # Другие настройки...
```

## Шаг 1: Создайте Dockerfile

Создайте файл с именем Dockerfile со следующим содержимым:

```
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
```


## Шаг 2: Создайте nginx.conf

Создайте файл с именем nginx.conf со следующим содержимым:

```
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Маршрут для метрик Prometheus
    location /metrics {
        alias /usr/share/nginx/html;
        try_files /metrics.html /index.html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Важно: В этой конфигурации нет проксирования запросов к OpenSearch. Все запросы к API OpenSearch выполняются непосредственно из браузера к экземплярам OpenSearch. Убедитесь, что CORS настроен правильно на вашем OpenSearch кластере.


## Шаг 3: Создайте docker-compose.yml


Создайте файл docker-compose.yml для удобного запуска:

```
version: '3.8'

services:
  izuna-opensearch-exporter:
    build: .
    container_name: izuna-opensearch-exporter
    ports:
      - "8080:80"
    restart: unless-stopped
```

## Шаг 4: Сборка и запуск

Выполните следующие команды для сборки и запуска контейнера:

```bash
# Сборка образа
docker-compose build

# Запуск контейнера
docker-compose up -d
```

## Шаг 5: Настройка Prometheus

Добавьте следующую конфигурацию в ваш файл `prometheus.yml`:

```yml
scrape_configs:
  - job_name: 'opensearch'
    scrape_interval: 30s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:8080']
```

## Важные замечания

   - По умолчанию приложение доступно по адресу http://localhost:8080
   - Метрики Prometheus доступны по URL http://localhost:8080/metrics
   - В настройках экспортера укажите правильные URL хостов OpenSearch
   - URL хостов должны быть доступны из браузера пользователя
   - Для продакшн среды рекомендуется настроить TLS/SSL
   - Если ваш OpenSearch требует аутентификации, не забудьте указать учетные данные в настройках
   - **Обязательно настройте CORS в вашем OpenSearch!**

## Проверка работы экспортера

1. Откройте в браузере http://localhost:8080
2. Добавьте хост OpenSearch в настройках (например, http://localhost:9200 - не используйте имена хостов внутри Docker, если экспортер запущен вне Docker-сети OpenSearch)
3. Проверьте отображение метрик на дашборде
4. Убедитесь, что метрики доступны по адресу http://localhost:8080/metrics
5. Если возникают ошибки CORS, настройте параметры CORS на вашем OpenSearch сервере

## Устранение проблем с сетью в Docker

Если вы запускаете и OpenSearch, и экспортер в Docker, важно учесть особенности сетевого взаимодействия:

1. Убедитесь, что оба контейнера находятся в одной сети Docker или имеют доступ друг к другу
2. Используйте имя контейнера для обращения из одного контейнера к другому (например, http://opensearch:9200)
3. Если экспортер работает вне контейнера OpenSearch, используйте IP-адрес хоста или localhost (например, http://localhost:9200)
4. При возникновении ошибки host not found in upstream в NGINX, проверьте правильность имен хостов в конфигурации
5. Для отладки выполните docker network inspect чтобы проверить IP-адреса контейнеров

## Разработка проекта

Для локальной разработки без Docker выполните следующие шаги:

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Запустите сервер разработки:
   ```bash
   npm run dev
   ```

3. Сборка для продакшн:
   ```bash
   npm run build
   ```



# Curl Tools

Cluster Health

```
curl -vku "admin:admin" -XGET "https://172.22.217.113:9200/_cluster/health?pretty"
```

Shards Info

```
curl -vku "admin:admin" -XGET "https://172.22.217.113:9200/_cluster/health?pretty" | grep -E "active_shards|relocating_shards|unassigned_shards"
```

Documents Count

```
curl -vku "admin:admin" -XGET "https://172.22.217.113:9200/_cluster/stats?filter_path=indices.docs.count" | jq .indices.docs.count
```

Total Size

```
curl -vku "admin:admin" -XGET "https://172.22.217.113:9200/_cluster/stats?human&filter_path=indices.store.size" | jq .indices.store.size
```

Nodes in Cluster Info

```
curl -kv -u admin:admin https://172.22.217.113:9200/_cat/nodes?v
```


Resources

```
curl -vk -u admin:admin "https://172.22.217.113:9200/_nodes/stats/os,jvm?pretty"
```


1. Основной стек:

  * `TypeScript` (основной язык)
  * `React` (фронтенд, интерфейс)
  * `Next.js` (фреймворк для SSR/гибридных приложений)
  * `Tailwind CSS` (стилизация)

2. Ключевые зависимости

  * `OpenSearch JS Client` (@opensearch-project/opensearch) — для запросов к кластеру
  * `Axios` — HTTP-клиент
  * `Prometheus` — совместимый экспорт метрик
  * `shadcn/ui` — компоненты интерфейса

3. Инфраструктура

  * `Docker` (контейнеризация)
  * `Docker Compose` (оркестрация для демо-развертывания)

4. Особенности архитектуры

  4.1 Модульная структура:

  * `types/opensearch.ts` — типы для API OpenSearch
  * `utils/prometheus.ts` — преобразование метрик в Prometheus-формат
  * `components/MetricsTable.tsx` — таблица с данными узлов

  4.2 Реализованный функционал:

  * Парсинг статистики узлов (_nodes/stats)
  * Конвертация в Prometheus-метрики
  * Визуализация через React-компоненты


# Screenshots

1. **Dashboard** 

![first_screen](screenshots/image_1.png)
![second_screen](screenshots/image_2.png)

2. **Configuration**

![third_screen](screenshots/image_3.png)

3. **Metrics**

![fourth_screen](screenshots/image_4.png)
![fifth_screen](screenshots/image_5.png)

