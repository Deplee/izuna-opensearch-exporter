
// Утилиты для работы с Prometheus
import { ClusterStats, PrometheusMetric } from '@/types/opensearch';

// Преобразует статистику кластера в метрики Prometheus
export function convertToPrometheusMetrics(stats: ClusterStats): PrometheusMetric[] {
  if (!stats || !stats.health) {
    return [];
  }

  const metrics: PrometheusMetric[] = [];
  const clusterName = stats.clusterName || 'opensearch_cluster';
  
  // Метрики статуса кластера
  const healthStatus = {
    green: stats.health.status === 'green' ? 1 : 0,
    yellow: stats.health.status === 'yellow' ? 1 : 0,
    red: stats.health.status === 'red' ? 1 : 0
  };

  metrics.push({
    name: 'opensearch_cluster_status_green',
    help: 'Статус кластера: зеленый (1 если да, 0 если нет)',
    type: 'gauge',
    value: healthStatus.green,
    labels: { cluster: clusterName }
  });

  metrics.push({
    name: 'opensearch_cluster_status_yellow',
    help: 'Статус кластера: желтый (1 если да, 0 если нет)',
    type: 'gauge',
    value: healthStatus.yellow,
    labels: { cluster: clusterName }
  });

  metrics.push({
    name: 'opensearch_cluster_status_red',
    help: 'Статус кластера: красный (1 если да, 0 если нет)',
    type: 'gauge',
    value: healthStatus.red,
    labels: { cluster: clusterName }
  });

  // Количество узлов
  metrics.push({
    name: 'opensearch_cluster_nodes_total',
    help: 'Общее количество узлов в кластере',
    type: 'gauge',
    value: stats.health.numNodes,
    labels: { cluster: clusterName }
  });

  metrics.push({
    name: 'opensearch_cluster_data_nodes_total',
    help: 'Количество узлов данных в кластере',
    type: 'gauge',
    value: stats.health.numDataNodes,
    labels: { cluster: clusterName }
  });

  // Шарды
  metrics.push({
    name: 'opensearch_cluster_shards_active',
    help: 'Количество активных шардов',
    type: 'gauge',
    value: stats.health.activeShards,
    labels: { cluster: clusterName }
  });

  metrics.push({
    name: 'opensearch_cluster_shards_relocating',
    help: 'Количество перемещаемых шардов',
    type: 'gauge',
    value: stats.health.relocatingShards,
    labels: { cluster: clusterName }
  });

  metrics.push({
    name: 'opensearch_cluster_shards_initializing',
    help: 'Количество инициализирующихся шардов',
    type: 'gauge',
    value: stats.health.initializingShards,
    labels: { cluster: clusterName }
  });

  metrics.push({
    name: 'opensearch_cluster_shards_unassigned',
    help: 'Количество нераспределенных шардов',
    type: 'gauge',
    value: stats.health.unassignedShards,
    labels: { cluster: clusterName }
  });

  // Индексы
  metrics.push({
    name: 'opensearch_cluster_indices_total',
    help: 'Общее количество индексов',
    type: 'gauge',
    value: stats.indices.count,
    labels: { cluster: clusterName }
  });

  metrics.push({
    name: 'opensearch_cluster_docs_total',
    help: 'Общее количество документов',
    type: 'gauge',
    value: stats.indices.docs,
    labels: { cluster: clusterName }
  });

  metrics.push({
    name: 'opensearch_cluster_store_size_bytes',
    help: 'Общий размер хранилища в байтах',
    type: 'gauge',
    value: stats.indices.store,
    labels: { cluster: clusterName }
  });

  // Метрики по узлам
  stats.nodes.forEach(node => {
    // CPU
    metrics.push({
      name: 'opensearch_node_cpu_percent',
      help: 'Использование CPU узлом в процентах',
      type: 'gauge',
      value: node.cpu,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    // Load Average
    metrics.push({
      name: 'opensearch_node_load_1m',
      help: 'Средняя нагрузка за 1 минуту',
      type: 'gauge',
      value: node.load1m,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_load_5m',
      help: 'Средняя нагрузка за 5 минут',
      type: 'gauge',
      value: node.load5m,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_load_15m',
      help: 'Средняя нагрузка за 15 минут',
      type: 'gauge',
      value: node.load15m,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    // Memory
    metrics.push({
      name: 'opensearch_node_memory_used_bytes',
      help: 'Использованная память в байтах',
      type: 'gauge',
      value: node.memory.used,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_memory_total_bytes',
      help: 'Общая память в байтах',
      type: 'gauge',
      value: node.memory.total,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_memory_free_percent',
      help: 'Процент свободной памяти',
      type: 'gauge',
      value: node.memory.freePercent,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    // JVM
    metrics.push({
      name: 'opensearch_node_jvm_uptime_milliseconds',
      help: 'Время непрерывной работы JVM в миллисекундах',
      type: 'gauge',
      value: node.jvm.uptime,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_jvm_heap_used_bytes',
      help: 'Использованная память JVM heap в байтах',
      type: 'gauge',
      value: node.jvm.heapUsed,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_jvm_heap_max_bytes',
      help: 'Максимальный размер JVM heap в байтах',
      type: 'gauge',
      value: node.jvm.heapMax,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_jvm_heap_percent',
      help: 'Процент использования JVM heap',
      type: 'gauge',
      value: node.jvm.heapPercent,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    // Indices
    metrics.push({
      name: 'opensearch_node_docs_count',
      help: 'Количество документов на узле',
      type: 'gauge',
      value: node.indices.docsCount,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_store_size_bytes',
      help: 'Размер хранилища на узле в байтах',
      type: 'gauge',
      value: node.indices.storeSize,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_indexing_rate',
      help: 'Количество операций индексирования',
      type: 'counter',
      value: node.indices.indexingRate,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });

    metrics.push({
      name: 'opensearch_node_search_rate',
      help: 'Количество операций поиска',
      type: 'counter',
      value: node.indices.searchRate,
      labels: { cluster: clusterName, node: node.name, hostname: node.hostname }
    });
  });

  return metrics;
}

// Форматирует метрики в текстовый формат Prometheus
export function formatPrometheusMetrics(metrics: PrometheusMetric[]): string {
  let result = '';

  // Группируем метрики по имени для добавления HELP и TYPE только один раз
  const metricsByName: Record<string, PrometheusMetric[]> = {};
  metrics.forEach(metric => {
    if (!metricsByName[metric.name]) {
      metricsByName[metric.name] = [];
    }
    metricsByName[metric.name].push(metric);
  });

  Object.entries(metricsByName).forEach(([name, metricsGroup]) => {
    // Добавляем HELP
    result += `# HELP ${name} ${metricsGroup[0].help}\n`;
    
    // Добавляем TYPE
    result += `# TYPE ${name} ${metricsGroup[0].type}\n`;
    
    // Добавляем все метрики с этим именем
    metricsGroup.forEach(metric => {
      const labelPairs = metric.labels 
        ? Object.entries(metric.labels)
            .map(([key, value]) => `${key}="${value.toString().replace(/"/g, '\\"')}"`)
            .join(',')
        : '';
      
      const metricLine = labelPairs 
        ? `${metric.name}{${labelPairs}} ${metric.value}`
        : `${metric.name} ${metric.value}`;
      
      result += `${metricLine}\n`;
    });
    
    // Добавляем пустую строку между разными метриками
    result += '\n';
  });

  return result;
}
