
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, Download } from 'lucide-react';
import { ClusterStats, PrometheusMetric } from '@/types/opensearch';
import { convertToPrometheusMetrics, formatPrometheusMetrics } from '@/utils/prometheus';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface PrometheusMetricsViewerProps {
  clusterStats: ClusterStats | null;
}

const PrometheusMetricsViewer: React.FC<PrometheusMetricsViewerProps> = ({ clusterStats }) => {
  const { toast } = useToast();
  const [showFullMetrics, setShowFullMetrics] = useState(false);
  
  const metricsText = React.useMemo(() => {
    if (!clusterStats) return '';
    const metrics = convertToPrometheusMetrics(clusterStats);
    return formatPrometheusMetrics(metrics);
  }, [clusterStats]);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(metricsText).then(() => {
      toast({
        title: "Скопировано",
        description: "Метрики скопированы в буфер обмена",
        variant: "default"
      });
    });
  };

  const handleDownloadMetrics = () => {
    const blob = new Blob([metricsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opensearch-metrics.prom';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Скачивание начато",
      description: "Файл с метриками загружается",
      variant: "default"
    });
  };
  
  // Get the current hostname to display in the endpoint URL
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Метрики Prometheus</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
              <Clipboard className="h-4 w-4 mr-2" />
              Копировать
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadMetrics}>
              <Download className="h-4 w-4 mr-2" />
              Скачать
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Эти метрики доступны по пути /metrics для Prometheus
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Доступ к метрикам</AlertTitle>
          <AlertDescription>
            Метрики в формате Prometheus доступны по адресу: <code className="bg-muted px-1 py-0.5 rounded">{`http://${hostname}${port ? `:${port}` : ''}/metrics`}</code>
            <br />
            Добавьте этот эндпоинт в конфигурацию Prometheus для сбора метрик.
          </AlertDescription>
        </Alert>

        {!clusterStats ? (
          <div className="text-center p-4 text-muted-foreground">
            Нет данных о кластере для генерации метрик
          </div>
        ) : (
          <div className="relative">
            <pre className="p-4 bg-sidebar rounded-md text-sm overflow-auto max-h-[400px] text-muted-foreground">
              {showFullMetrics 
                ? metricsText 
                : metricsText.split('\n').slice(0, 20).join('\n') + '\n...\n(показаны первые 20 строк)'}
            </pre>
            {!showFullMetrics && metricsText.split('\n').length > 20 && (
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => setShowFullMetrics(true)}
              >
                Показать все метрики
              </Button>
            )}
            {showFullMetrics && (
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => setShowFullMetrics(false)}
              >
                Скрыть полные метрики
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrometheusMetricsViewer;
