import express from 'express';
import { register } from './metrics.js';

const app = express();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Metrics server listening on port ${port}`);
});
