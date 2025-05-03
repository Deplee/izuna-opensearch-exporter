
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricValue } from '@/types/opensearch';

interface StatusCardProps {
  title: string;
  metrics: MetricValue[];
  icon?: React.ReactNode;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, metrics, icon }) => {
  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{metric.name}</span>
              <span className={
                metric.status === 'error' ? 'text-opensearch-red' :
                metric.status === 'warning' ? 'text-opensearch-orange' :
                metric.status === 'healthy' ? 'text-opensearch-green' :
                ''
              }>
                {metric.value} {metric.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
