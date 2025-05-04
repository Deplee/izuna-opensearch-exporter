// server.ts
import express from 'express';
import { fetchClusterStats } from '../utils/opensearch.js';
import { generatePrometheusMetricsOutput } from '../api/metricsEndpoint.js';

const app = express();
const port = 3001;  // Порт для сервера метрик

app.get('/metrics', async (req, res) => {
  try {
    const stats = await fetchClusterStats('http://opensearch:9200'); // Используйте имя сервиса из docker-compose
    const metrics = generatePrometheusMetricsOutput(stats);
    res.header('Content-Type', 'text/plain').send(metrics);
  } catch (error) {
    res.status(500).send(`# Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }
});

app.listen(port, () => {
  console.log(`Metrics server running on port ${port}`);
});
