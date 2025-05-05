const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const METRICS_FILE = path.join(__dirname, 'metrics.txt');

app.use(express.text({ type: '*/*' }));

// Endpoint для Prometheus
app.get('/metrics', (req, res) => {
  if (fs.existsSync(METRICS_FILE)) {
    res.set('Content-Type', 'text/plain');
    res.send(fs.readFileSync(METRICS_FILE, 'utf8'));
  } else {
    res.set('Content-Type', 'text/plain');
    res.send('# No metrics yet\n');
  }
});

// Endpoint для фронта (обновить метрики)
app.post('/metrics', (req, res) => {
  fs.writeFileSync(METRICS_FILE, req.body, 'utf8');
  res.sendStatus(200);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Metrics server running on http://localhost:${PORT}/metrics`);
});
