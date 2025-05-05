import React, { useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { fetchClusterStats } from '@/utils/opensearch';
import { generatePrometheusMetricsOutput } from '@/api/metricsEndpoint';

const MetricsUpdater: React.FC = () => {
  const { hosts } = useConfig();

  useEffect(() => {
    const sendMetricsToServer = async (metricsText: string) => {
      try {
        await fetch('http://metrics-server:3000/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: metricsText,
        });
        // Можно добавить console.log('Metrics sent');
      } catch (e) {
        // Можно добавить обработку ошибок
        // console.error('Failed to send metrics', e);
      }
    };

    const getAndSendMetrics = async () => {
      if (hosts.length === 0) return;
      try {
        const stats = await fetchClusterStats(hosts[0]);
        if (stats) {
          const formattedMetrics = generatePrometheusMetricsOutput(stats);
          await sendMetricsToServer(formattedMetrics);
        }
      } catch (e) {
        // Можно добавить обработку ошибок
      }
    };

    getAndSendMetrics();
    const intervalId = setInterval(getAndSendMetrics, 60000); // раз в минуту

    return () => clearInterval(intervalId);
  }, [hosts]);

  return null; // ничего не рендерим
};

export default MetricsUpdater;
