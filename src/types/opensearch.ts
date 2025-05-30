
// Типы для OpenSearch и метрик

export interface OpenSearchHost {
  url: string;
  username?: string;
  password?: string;
}

export interface ClusterHealth {
  status: 'green' | 'yellow' | 'red';
  activeShards: number;
  relocatingShards: number;
  initializingShards: number;
  unassignedShards: number;
  numNodes: number;
  numDataNodes: number;
}

export interface NodeStats {
  name: string;
  hostname: string;
  cpu: number; // процент использования CPU
  load1m: number; // нагрузка за 1 минуту
  load5m: number; // нагрузка за 5 минут
  load15m: number; // нагрузка за 15 минут
  memory: {
    used: number; // в байтах
    total: number; // в байтах
    freePercent: number; // процент свободной памяти
  };
  jvm: {
    uptime: number; // в миллисекундах
    heapUsed: number; // в байтах
    heapMax: number; // в байтах
    heapPercent: number; // процент использования heap
  };
  indices: {
    docsCount: number; // количество документов
    storeSize: number; // размер хранилища в байтах
    indexingRate: number; // скорость индексирования
    searchRate: number; // скорость поиска
  };
}

export interface ClusterStats {
  clusterName: string;
  health: ClusterHealth;
  nodes: NodeStats[];
  indices: {
    count: number;
    shards: number;
    docs: number;
    store: number;
  };
}

export interface MetricValue {
  name: string;
  value: number;
  unit?: string;
  status?: 'healthy' | 'warning' | 'error';
}

export interface PrometheusMetric {
  name: string;
  help: string;
  type: 'gauge' | 'counter' | 'histogram' | 'summary';
  value: number;
  labels?: Record<string, string>;
}
