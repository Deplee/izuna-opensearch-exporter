import express from 'express';
import { register } from './metrics.js';

const app = express();

// Endpoint для метрик Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Здесь можно добавить другие API-роуты
// app.use('/api', ...)

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
}); 