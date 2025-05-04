import express from 'express';
import { generatePrometheusMetricsOutput } from './metricsEndpoint'; // Импорт из твоего файла
// Импортируй или получай актуальные clusterStats из своего приложения!
import { getClusterStats } from './yourClusterStatsSource'; // <-- замени на реальный источник

const app = express();

app.get('/metrics', async (req, res) => {
    // TODO: Получи реальные clusterStats из своего приложения или источника
    const clusterStats = null; // <-- замени на актуальные данные!
    const metricsText = generatePrometheusMetricsOutput(clusterStats);

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metricsText);
});

const port = process.env.PORT || 9090;
app.listen(port, () => {
    console.log(`Metrics server listening on port ${port}`);
});
