
// import { ClusterStats, PrometheusMetric } from '@/types/opensearch';
// import { convertToPrometheusMetrics, formatPrometheusMetrics } from '@/utils/prometheus';

// // Function to generate metrics in Prometheus format
// export function generatePrometheusMetricsOutput(clusterStats: ClusterStats | null): string {
//   if (!clusterStats) {
//     return '# No metrics available\n';
//   }
  
//   const metrics = convertToPrometheusMetrics(clusterStats);
//   return formatPrometheusMetrics(metrics);
// }


// // This function can be used to handle metrics endpoint request
// export function handleMetricsRequest(clusterStats: ClusterStats | null): Response {
//   const metricsText = generatePrometheusMetricsOutput(clusterStats);
  
//   return new Response(metricsText, {
//     headers: {
//       'Content-Type': 'text/plain; charset=utf-8',
//     },
//   });
// }

// src/api/metricsEndpoint.ts
import { ClusterStats, PrometheusMetric } from '@/types/opensearch';
import { convertToPrometheusMetrics, formatPrometheusMetrics } from '@/utils/prometheus';

// Экспортируем функцию явно
export function generatePrometheusMetricsOutput(clusterStats: ClusterStats | null): string {
  if (!clusterStats) {
    return '# No metrics available\n';
  }
  
  const metrics = convertToPrometheusMetrics(clusterStats);
  return formatPrometheusMetrics(metrics);
}

// Экспортируем handleMetricsRequest, если она используется
export function handleMetricsRequest(clusterStats: ClusterStats | null): Response {
  const metricsText = generatePrometheusMetricsOutput(clusterStats);
  
  return new Response(metricsText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
