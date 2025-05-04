
import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

import { ConfigProvider, useConfig } from '@/contexts/ConfigContext';
import { ClusterStats } from '@/types/opensearch';
import { fetchClusterStats } from '@/utils/opensearch';

import AddHostForm from '@/components/AddHostForm';
import HostsList from '@/components/HostsList';
import ConfigPanel from '@/components/ConfigPanel';
import ClusterStatus from '@/components/ClusterStatus';
import MetricsTable from '@/components/MetricsTable';
import ClusterMetrics from '@/components/ClusterMetrics';
import PrometheusMetricsViewer from '@/components/PrometheusMetricsViewer';

const MAX_HISTORY_LENGTH = 20;

const Dashboard: React.FC = () => {
  const { hosts, pollingInterval } = useConfig();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [clusterStats, setClusterStats] = useState<ClusterStats | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<ClusterStats[]>([]);

  // Функция для обновления метрик
  const updateMetrics = async () => {
    if (hosts.length === 0) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Используем первый хост для получения метрик
      const stats = await fetchClusterStats(hosts[0]);
      
      if (stats) {
        setClusterStats(stats);
        setMetricsHistory(prev => {
          const newHistory = [...prev, stats];
          if (newHistory.length > MAX_HISTORY_LENGTH) {
            return newHistory.slice(-MAX_HISTORY_LENGTH);
          }
          return newHistory;
        });
        setLastUpdated(new Date());
      } else {
        console.error('Не удалось получить данные о кластере');
        toast({
          title: "Ошибка получения метрик",
          description: "Не удалось получить данные от OpenSearch",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении метрик:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Автоматическое обновление метрик
  useEffect(() => {
    if (hosts.length === 0) {
      return;
    }
    
    // Обновляем сразу при монтировании
    updateMetrics();
    
    // Настраиваем интервал обновления
    const intervalId = setInterval(updateMetrics, pollingInterval);
    
    return () => clearInterval(intervalId);
  }, [hosts, pollingInterval]);

  return (
    <div className="container py-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">OpenSearch Exporter</h1>
          {hosts.length > 0 && (
            <Button 
              onClick={updateMetrics} 
              disabled={isLoading}
            >
              {isLoading ? "Обновление..." : "Обновить метрики"}
            </Button>
          )}
        </div>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Последнее обновление: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </header>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
          <TabsTrigger value="configuration">Конфигурация</TabsTrigger>
          <TabsTrigger value="metrics">Метрики Prometheus</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {hosts.length === 0 ? (
            <div className="bg-accent p-6 rounded-lg text-center">
              <h3 className="text-xl font-medium mb-2">Добавьте хост OpenSearch для начала мониторинга</h3>
              <p className="text-muted-foreground mb-4">
                Перейдите на вкладку "Конфигурация" и добавьте хотя бы один хост OpenSearch
              </p>
              <AddHostForm />
            </div>
          ) : clusterStats ? (
            <div className="space-y-6">
              <ClusterStatus 
                clusterName={clusterStats.clusterName} 
                health={clusterStats.health} 
              />
              
              <Separator className="my-4" />
              
              <h2 className="text-xl font-semibold">Статистика узлов</h2>
              <MetricsTable nodes={clusterStats.nodes} />
              
              <Separator className="my-4" />
              
              <h2 className="text-xl font-semibold mb-4">Графики метрик</h2>
              <ClusterMetrics metricsHistory={metricsHistory} />
            </div>
          ) : (
            <div className="bg-accent p-6 rounded-lg text-center">
              <h3 className="text-xl font-medium">Загрузка данных...</h3>
              <p className="text-muted-foreground mt-2">
                Подождите, выполняется сбор метрик с OpenSearch кластера
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddHostForm />
            <div className="space-y-4">
              <HostsList />
              <ConfigPanel />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="metrics" className="space-y-4">
          <PrometheusMetricsViewer clusterStats={clusterStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <Dashboard />
    </ConfigProvider>
  );
};

export default App;
