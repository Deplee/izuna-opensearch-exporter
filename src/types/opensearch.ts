
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
  cpu: number;
  load1m: number;
  load5m: number;
  load15m: number;
  memory: {
    used: number;
    total: number;
    freePercent: number;
  };
  jvm: {
    uptime: number;
    heapUsed: number;
    heapMax: number;
    heapPercent: number;
  };
  indices: {
    docsCount: number;
    storeSize: number;
    indexingRate: number;
    searchRate: number;
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
