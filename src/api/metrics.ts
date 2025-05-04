import express from 'express';
import { Registry, Gauge } from 'prom-client';

const router = express.Router();
const register = new Registry();

// Пример метрики
const exampleGauge = new Gauge({
    name: 'example_metric',
    help: 'Example metric',
    registers: [register],
});

// Установка значения метрики
exampleGauge.set(1);

router.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error);
    }
});

export default router;