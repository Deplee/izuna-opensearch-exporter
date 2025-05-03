
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClusterHealth } from '@/types/opensearch';

interface ClusterStatusProps {
  clusterName: string;
  health: ClusterHealth | null;
}

const ClusterStatus: React.FC<ClusterStatusProps> = ({ clusterName, health }) => {
  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Состояние кластера</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">Нет данных о состоянии кластера</div>
        </CardContent>
      </Card>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'green': return 'status-healthy';
      case 'yellow': return 'status-warning';
      case 'red': return 'status-error';
      default: return '';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`pb-3 border-b flex flex-row items-center justify-between ${health.status === 'green' ? 'bg-opensearch-green/10' : health.status === 'yellow' ? 'bg-opensearch-orange/10' : 'bg-opensearch-red/10'}`}>
        <div className="flex items-center gap-2">
          <span className={`status-indicator ${getStatusClass(health.status)}`}></span>
          <CardTitle className="text-lg font-medium">Кластер: {clusterName}</CardTitle>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          {health.numNodes} узлов ({health.numDataNodes} узлов данных)
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Активных шардов</span>
            <span className="text-2xl font-bold">{health.activeShards}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Перемещаемых</span>
            <span className={`text-2xl font-bold ${health.relocatingShards > 0 ? 'text-opensearch-orange' : ''}`}>
              {health.relocatingShards}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Инициализирующихся</span>
            <span className={`text-2xl font-bold ${health.initializingShards > 0 ? 'text-opensearch-orange' : ''}`}>
              {health.initializingShards}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Нераспределенных</span>
            <span className={`text-2xl font-bold ${health.unassignedShards > 0 ? 'text-opensearch-red' : ''}`}>
              {health.unassignedShards}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClusterStatus;
