
import { ClusterStats, PrometheusMetric } from '@/types/opensearch';
import { convertToPrometheusMetrics, formatPrometheusMetrics } from '@/utils/prometheus';

// Function to generate metrics in Prometheus format
// export function generatePrometheusMetricsOutput(clusterStats: ClusterStats | null): string {
//   if (!clusterStats) {
//     return '# No metrics available\n';
//   }
  
//   const metrics = convertToPrometheusMetrics(clusterStats);
//   return formatPrometheusMetrics(metrics);
// }
export function generatePrometheusMetricsOutput(stats: any): string {
  const lines: string[] = [];

  for (const [nodeId, node] of Object.entries(stats.nodes)) {
    const name = node.name.replace(/-/g, '_');

    lines.push(`# HELP opensearch_node_fs_total_bytes Total FS size`);
    lines.push(`# TYPE opensearch_node_fs_total_bytes gauge`);
    lines.push(`opensearch_node_fs_total_bytes{node="${name}"} ${node.fs.total_in_bytes}`);

    lines.push(`# HELP opensearch_node_mem_total_bytes Total memory`);
    lines.push(`# TYPE opensearch_node_mem_total_bytes gauge`);
    lines.push(`opensearch_node_mem_total_bytes{node="${name}"} ${node.os.mem.total_in_bytes}`);

    lines.push(`# HELP opensearch_node_cpu_percent CPU usage percent`);
    lines.push(`# TYPE opensearch_node_cpu_percent gauge`);
    lines.push(`opensearch_node_cpu_percent{node="${name}"} ${node.os.cpu.percent}`);
    
    lines.push("");
  }

  return lines.join('\n');
}

// This function can be used to handle metrics endpoint request
export function handleMetricsRequest(clusterStats: ClusterStats | null): Response {
  const metricsText = generatePrometheusMetricsOutput(clusterStats);
  
  return new Response(metricsText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
