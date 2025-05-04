const express = require('express');
const { Registry, Gauge } = require('prom-client');

const app = express();
const register = new Registry();

// Пример метрики
const exampleGauge = new Gauge({
    name: 'example_metric',
    help: 'Example metric',
    registers: [register],
});

// Установка значения метрики
exampleGauge.set(1);

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