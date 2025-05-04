
import React, { useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { fetchClusterStats } from '@/utils/opensearch';
import { generatePrometheusMetricsOutput } from '@/api/metricsEndpoint';
import { ClusterStats } from '@/types/opensearch';

const MetricsEndpoint: React.FC = () => {
  const { hosts } = useConfig();
  const [metricsText, setMetricsText] = React.useState<string>('# Loading metrics...\n');

  // useEffect(() => {
  //   const getMetrics = async () => {
  //     if (hosts.length === 0) {
  //       setMetricsText('# No OpenSearch hosts configured\n');
  //       return;
  //     }

  //     try {
  //       // Get metrics from first host
  //       const stats = await fetchClusterStats(hosts[0]);
        
  //       if (stats) {
  //         const formattedMetrics = generatePrometheusMetricsOutput(stats);
  //         setMetricsText(formattedMetrics);
  //       } else {
  //         setMetricsText('# Failed to fetch metrics from OpenSearch\n');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching metrics:', error);
  //       setMetricsText(`# Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  //     }
  //   };

  //   getMetrics();
  useEffect(() => {
    const getMetrics = async () => {
      if (hosts.length === 0) {
        setMetricsText('# No OpenSearch hosts configured\n');
        return;
      }
  
      try {
        const stats = await fetchClusterStats(hosts[0]); // Один хост вернет все ноды
        if (stats) {
          const formatted = generatePrometheusMetricsOutput(stats); // возможно, тут потребуется адаптация
          setMetricsText(formatted);
        } else {
          setMetricsText('# Failed to fetch metrics from OpenSearch\n');
        }
      } catch (error) {
        setMetricsText(`# Error: ${error}\n`);
      }
    };
  
    getMetrics();
  }, [hosts]);    
    // Set up a regular update
    const intervalId = setInterval(getMetrics, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [hosts]);

  // This will render plain text for Prometheus to scrape
  return (
    <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      {metricsText}
    </pre>
  );
};

export default MetricsEndpoint;
