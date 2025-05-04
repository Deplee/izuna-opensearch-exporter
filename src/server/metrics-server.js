import express from 'express';
import axios from 'axios';

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://opensearch-exporter:8080';

app.get('/metrics', async (req, res) => {
    try {
        const response = await axios.get(`${FRONTEND_URL}/metrics`);
        res.set('Content-Type', 'text/plain; version=0.0.4');
        res.send(response.data);
    } catch (error) {
        res.status(500).send('# Ошибка получения метрик\n');
    }
});

const port = process.env.METRICS_PORT || 9091;
app.listen(port, () => {
    console.log(`Metrics proxy server listening on port ${port}`);
}); 