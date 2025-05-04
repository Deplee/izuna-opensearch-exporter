
// Утилиты для работы с OpenSearch
import { OpenSearchHost, ClusterStats, ClusterHealth, NodeStats } from '@/types/opensearch';
import { toast } from '@/components/ui/use-toast';

// Функция для проверки доступности OpenSearch хоста
export async function checkHostAvailability(host: OpenSearchHost): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (host.username && host.password) {
      const encodedCredentials = btoa(`${host.username}:${host.password}`);
      headers['Authorization'] = `Basic ${encodedCredentials}`;
      headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Skip-Cert-Validation";
    }
    
    // Удалены credentials: 'include', так как это может вызывать проблемы при CORS
    const response = await fetch(`${host.url}`, {
      method: 'GET',
      headers,
      // Настройки для CORS запросов
      mode: 'cors',
      referrerPolicy: "no-referrer",
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Ошибка при проверке хоста ${host.url}:`, error);
    // Проверяем, является ли ошибка CORS-ошибкой
    handleCorsError(error, host);
    return false;
  }
}

// Функция для получения состояния здоровья кластера
export async function fetchClusterHealth(host: OpenSearchHost): Promise<ClusterHealth | null> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (host.username && host.password) {
      const encodedCredentials = btoa(`${host.username}:${host.password}`);
      headers['Authorization'] = `Basic ${encodedCredentials}`;
      headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Skip-Cert-Validation";
    }
    
    // Удалены credentials: 'include'
    const response = await fetch(`${host.url}/_cluster/health`, {
      method: 'GET',
      headers,
      mode: 'cors',
      referrerPolicy: "no-referrer",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      status: data.status,
      activeShards: data.active_shards,
      relocatingShards: data.relocating_shards,
      initializingShards: data.initializing_shards,
      unassignedShards: data.unassigned_shards,
      numNodes: data.number_of_nodes,
      numDataNodes: data.number_of_data_nodes,
    };
  } catch (error) {
    console.error('Ошибка при получении состояния кластера:', error);
    handleCorsError(error, host);
    return null;
  }
}

// Функция для получения статистики узлов
export async function fetchNodeStats(host: OpenSearchHost): Promise<NodeStats[]> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (host.username && host.password) {
      const encodedCredentials = btoa(`${host.username}:${host.password}`);
      headers['Authorization'] = `Basic ${encodedCredentials}`;
      headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Skip-Cert-Validation";
    }
    
    // Удалены credentials: 'include'
    const response = await fetch(`${host.url}/_nodes/stats`, {
      method: 'GET',
      headers,
      mode: 'cors',
      referrerPolicy: "no-referrer",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const nodes: NodeStats[] = [];
    
    Object.entries(data.nodes).forEach(([nodeId, nodeData]: [string, any]) => {
      nodes.push({
        name: nodeData.name,
        hostname: nodeData.host,
        cpu: nodeData.os?.cpu?.percent ?? 0,
        load1m: nodeData.os?.cpu?.load_average?.['1m'] ?? 0,
        load5m: nodeData.os?.cpu?.load_average?.['5m'] ?? 0,
        load15m: nodeData.os?.cpu?.load_average?.['15m'] ?? 0,
        memory: {
          used: nodeData.os?.mem?.used_in_bytes ?? 0,
          total: nodeData.os?.mem?.total_in_bytes ?? 0,
          freePercent: 100 * (1 - (nodeData.os?.mem?.used_in_bytes ?? 0) / (nodeData.os?.mem?.total_in_bytes ?? 1)),
        },
        jvm: {
          uptime: nodeData.jvm?.uptime_in_millis ?? 0,
          heapUsed: nodeData.jvm?.mem?.heap_used_in_bytes ?? 0,
          heapMax: nodeData.jvm?.mem?.heap_max_in_bytes ?? 0,
          heapPercent: nodeData.jvm?.mem?.heap_used_percent ?? 0,
        },
        indices: {
          docsCount: nodeData.indices?.docs?.count ?? 0,
          storeSize: nodeData.indices?.store?.size_in_bytes ?? 0,
          indexingRate: nodeData.indices?.indexing?.index_total ?? 0,
          searchRate: nodeData.indices?.search?.query_total ?? 0,
        }
      });
    });
    
    return nodes;
  } catch (error) {
    console.error('Ошибка при получении статистики узлов:', error);
    handleCorsError(error, host);
    return [];
  }
}

// Функция для получения статистики кластера
export async function fetchClusterStats(host: OpenSearchHost): Promise<ClusterStats | null> {
  try {
    const health = await fetchClusterHealth(host);
    const nodes = await fetchNodeStats(host);
    
    if (!health) {
      return null;
    }
    
    // Запрос статистики по индексам
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (host.username && host.password) {
      const encodedCredentials = btoa(`${host.username}:${host.password}`);
      headers['Authorization'] = `Basic ${encodedCredentials}`;
      headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Skip-Cert-Validation";
    }
    
    // Удалены credentials: 'include'
    const response = await fetch(`${host.url}/_stats`, {
      method: 'GET',
      headers,
      mode: 'cors',
      referrerPolicy: "no-referrer",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const indicesData = await response.json();
    
    return {
      clusterName: indicesData._all?.indices?.['_all']?.primaries?.['_all']?.name ?? 'OpenSearch Cluster',
      health,
      nodes,
      indices: {
        count: indicesData._all?.indices?.['_all']?.primaries?.['_all']?.total ?? 0,
        shards: health.activeShards,
        docs: indicesData._all?.primaries?.docs?.count ?? 0,
        store: indicesData._all?.primaries?.store?.size_in_bytes ?? 0,
      }
    };
  } catch (error) {
    console.error('Ошибка при получении статистики кластера:', error);
    handleCorsError(error, host);
    return null;
  }
}

// Вспомогательная функция для обработки CORS ошибок с более детальными сообщениями
function handleCorsError(error: any, host: OpenSearchHost) {
  if (error instanceof TypeError && error.message.includes('CORS')) {
    toast({
      title: "Ошибка CORS",
      description: `
        Невозможно подключиться к ${host.url} из-за политики CORS. 
        
        Возможные причины:
        1. CORS не настроен в OpenSearch
        2. Неверный URL хоста (проверьте протокол http/https)
        3. Если хост запущен в Docker, используйте правильное сетевое имя или IP
        
        Для Docker: если экспортер запущен на хосте, используйте localhost:9200
        Для Docker-сети: если в одной сети, используйте имя контейнера (opensearch:9200)
        
        Проверьте следующие настройки в docker-compose.yml:
          - "http.cors.enabled=true"
          - "http.cors.allow-origin=*"
          - "http.cors.allow-methods=OPTIONS,HEAD,GET,POST,PUT,DELETE"
          - "http.cors.allow-headers=X-Requested-With,X-Auth-Token,Content-Type,Content-Length,Authorization"
        
        Для протокола HTTPS дополнительно проверьте:
          - Вы используете правильный протокол: https://hostname
          - Ваш браузер принимает самоподписанные сертификаты
      `,
      variant: "destructive"
    });
  } else if (error instanceof DOMException && error.name === "NetworkError") {
    toast({
      title: "Ошибка сети",
      description: `
        Невозможно подключиться к ${host.url}.
        
        Возможные причины:
        1. OpenSearch недоступен по указанному адресу
        2. Сетевые ограничения (брандмауэр, Docker сеть)
        3. Смешанный контент (HTTP/HTTPS)
        
        Проверьте доступность хоста и сетевые настройки.
      `,
      variant: "destructive"
    });
  }
}

// Функция для форматирования размера в байтах в человекочитаемый формат
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Функция для форматирования длительности в миллисекундах
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}д ${hours % 24}ч`;
  } else if (hours > 0) {
    return `${hours}ч ${minutes % 60}м`;
  } else if (minutes > 0) {
    return `${minutes}м ${seconds % 60}с`;
  } else {
    return `${seconds}с`;
  }
}
