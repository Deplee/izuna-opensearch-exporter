import express from 'express';
import { Registry, Counter } from 'prom-client';
import axios from 'axios';

const app = express();
const register = new Registry();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://opensearch-exporter:80';

// Метрики для мониторинга сбора метрик
const metricsFetchErrors = new Counter({
    name: 'metrics_fetch_errors_total',
    help: 'Общее количество ошибок при получении метрик',
    labelNames: ['source'],
    registers: [register],
});

// Функция для обновления метрик
async function updateMetrics() {
    try {
        const response = await axios.get(`${FRONTEND_URL}/metrics`);
        const metrics = response.data;

        // Проверяем, что полученные данные являются метриками Prometheus
        if (typeof metrics === 'string' && metrics.includes('TYPE')) {
            console.log('Successfully received metrics from frontend');
        } else {
            console.error('Received invalid metrics format from frontend');
            metricsFetchErrors.inc({ source: 'frontend' });
        }
    } catch (error) {
        console.error('Error updating metrics:', error);
        metricsFetchErrors.inc({ source: 'frontend' });
    }
}

// Обновление метрик каждые 15 секунд
setInterval(updateMetrics, 15000);
updateMetrics(); // Первоначальное обновление

app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error);
    }
});

const port = process.env.METRICS_PORT || 9090;
app.listen(port, () => {
    console.log(`Metrics server listening on port ${port}`);
}); 