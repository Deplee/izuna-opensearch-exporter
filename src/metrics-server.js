import express from 'express';
import { Registry, Gauge, Counter } from 'prom-client';
import axios from 'axios';

const app = express();
const register = new Registry();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://opensearch-exporter:8080';

// Метрики приложения
const appRequestsTotal = new Counter({
    name: 'app_requests_total',
    help: 'Общее количество запросов к приложению',
    labelNames: ['endpoint'],
    registers: [register],
});

const appErrorsTotal = new Counter({
    name: 'app_errors_total',
    help: 'Общее количество ошибок в приложении',
    labelNames: ['type'],
    registers: [register],
});

// Функция для обновления метрик
async function updateMetrics() {
    try {
        const response = await axios.get(`${FRONTEND_URL}/metrics`);
        const metrics = response.data;

        // Здесь можно добавить логику для обработки полученных метрик
        // Например, если frontend возвращает свои метрики в формате Prometheus
        console.log('Received metrics from frontend:', metrics);
    } catch (error) {
        console.error('Error updating metrics:', error);
        appErrorsTotal.inc({ type: 'fetch_metrics' });
    }
}

// Обновление метрик каждые 15 секунд
setInterval(updateMetrics, 15000);
updateMetrics(); // Первоначальное обновление

app.get('/metrics', async (req, res) => {
    try {
        appRequestsTotal.inc({ endpoint: '/metrics' });
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        appErrorsTotal.inc({ type: 'serve_metrics' });
        res.status(500).end(error);
    }
});

const port = process.env.METRICS_PORT || 9090;
app.listen(port, () => {
    console.log(`Metrics server listening on port ${port}`);
}); 