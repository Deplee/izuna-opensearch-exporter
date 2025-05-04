import express from 'express';
import { Registry, Gauge, Counter } from 'prom-client';
import axios from 'axios';

const app = express();
const register = new Registry();

const OPENSEARCH_URL = process.env.OPENSEARCH_URL || 'http://opensearch:9200';

// Метрики кластера
const clusterStatusGreen = new Gauge({
    name: 'opensearch_cluster_status_green',
    help: 'Статус кластера: зеленый (1 если да, 0 если нет)',
    labelNames: ['cluster'],
    registers: [register],
});

const clusterStatusYellow = new Gauge({
    name: 'opensearch_cluster_status_yellow',
    help: 'Статус кластера: желтый (1 если да, 0 если нет)',
    labelNames: ['cluster'],
    registers: [register],
});

const clusterStatusRed = new Gauge({
    name: 'opensearch_cluster_status_red',
    help: 'Статус кластера: красный (1 если да, 0 если нет)',
    labelNames: ['cluster'],
    registers: [register],
});

const clusterNodesTotal = new Gauge({
    name: 'opensearch_cluster_nodes_total',
    help: 'Общее количество узлов в кластере',
    labelNames: ['cluster'],
    registers: [register],
});

const clusterDataNodesTotal = new Gauge({
    name: 'opensearch_cluster_data_nodes_total',
    help: 'Количество узлов данных в кластере',
    labelNames: ['cluster'],
    registers: [register],
});

// Функция для обновления метрик
async function updateMetrics() {
    try {
        const response = await axios.get(`${OPENSEARCH_URL}/_cluster/health`);
        const data = response.data;

        // Обновление метрик
        clusterStatusGreen.set({ cluster: 'OpenSearch Cluster' }, data.status === 'green' ? 1 : 0);
        clusterStatusYellow.set({ cluster: 'OpenSearch Cluster' }, data.status === 'yellow' ? 1 : 0);
        clusterStatusRed.set({ cluster: 'OpenSearch Cluster' }, data.status === 'red' ? 1 : 0);
        clusterNodesTotal.set({ cluster: 'OpenSearch Cluster' }, data.number_of_nodes);
        clusterDataNodesTotal.set({ cluster: 'OpenSearch Cluster' }, data.number_of_data_nodes);
    } catch (error) {
        console.error('Error updating metrics:', error);
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