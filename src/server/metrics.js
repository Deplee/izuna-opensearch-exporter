import { Registry, Counter, Gauge } from 'prom-client';

const register = new Registry();

// Метрики приложения
const appRequestsTotal = new Counter({
    name: 'app_requests_total',
    help: 'Общее количество запросов к приложению',
    labelNames: ['endpoint'],
    registers: [register],
});

const appErrorsTotal = new Counter({
    name: 'app_errors_total',
    help: 'Общее количество ошибок в приложении',
    labelNames: ['type'],
    registers: [register],
});

const appUptime = new Gauge({
    name: 'app_uptime_seconds',
    help: 'Время работы приложения в секундах',
    registers: [register],
});

// Обновляем uptime каждую секунду
setInterval(() => {
    appUptime.set(process.uptime());
}, 1000);

export { register, appRequestsTotal, appErrorsTotal, appUptime }; 