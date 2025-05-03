
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ClusterStats } from '@/types/opensearch';
import { formatBytes } from '@/utils/opensearch';

interface ClusterMetricsProps {
  metricsHistory: ClusterStats[];
}

interface DataPoint {
  timestamp: Date;
  [key: string]: any;
}

const ClusterMetrics: React.FC<ClusterMetricsProps> = ({ metricsHistory }) => {
  if (!metricsHistory || metricsHistory.length === 0) {
    return <div className="text-center py-4">История метрик недоступна</div>;
  }

  // Преобразуем историю метрик в формат для графиков
  const formatDataForCharts = (history: ClusterStats[]): {
    cpuData: DataPoint[];
    memoryData: DataPoint[];
    jvmData: DataPoint[];
    indicesData: DataPoint[];
  } => {
    const cpuData: DataPoint[] = [];
    const memoryData: DataPoint[] = [];
    const jvmData: DataPoint[] = [];
    const indicesData: DataPoint[] = [];

    history.forEach((stats, index) => {
      const timestamp = new Date(Date.now() - (history.length - 1 - index) * 30000); // Предполагаем 30с интервал
      
      // Средняя загрузка CPU по узлам
      const cpuPoint: DataPoint = { timestamp };
      stats.nodes.forEach(node => {
        cpuPoint[node.name] = node.cpu;
      });
      cpuData.push(cpuPoint);

      // Использование памяти
      const memoryPoint: DataPoint = { timestamp };
      stats.nodes.forEach(node => {
        memoryPoint[node.name] = node.memory.used / (1024 * 1024); // МБ
      });
      memoryData.push(memoryPoint);

      // Использование JVM Heap
      const jvmPoint: DataPoint = { timestamp };
      stats.nodes.forEach(node => {
        jvmPoint[node.name] = node.jvm.heapPercent;
      });
      jvmData.push(jvmPoint);

      // Размер индексов
      indicesData.push({
        timestamp,
        size: stats.indices.store / (1024 * 1024), // МБ
        docs: stats.indices.docs
      });
    });

    return { cpuData, memoryData, jvmData, indicesData };
  };

  const { cpuData, memoryData, jvmData, indicesData } = formatDataForCharts(metricsHistory);
  
  const nodeNames = metricsHistory[0]?.nodes?.map(node => node.name) || [];
  
  // Создание случайных цветов для узлов
  const getColorForNode = (index: number) => {
    const colors = [
      '#2196F3', '#4CAF50', '#FF9800', '#E91E63', 
      '#9C27B0', '#673AB7', '#3F51B5', '#00BCD4',
      '#009688', '#FFC107', '#FF5722', '#795548'
    ];
    return colors[index % colors.length];
  };

  const formatTime = (time: any) => {
    const date = new Date(time);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Использование CPU (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cpuData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }} 
                  stroke="#666"
                  tickFormatter={formatTime}
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, '']}
                  labelFormatter={(label) => formatTime(label)}
                />
                <Legend />
                {nodeNames.map((nodeName, index) => (
                  <Line 
                    key={nodeName}
                    type="monotone" 
                    dataKey={nodeName}
                    name={nodeName}
                    stroke={getColorForNode(index)} 
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Использование памяти (МБ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }} 
                  stroke="#666"
                  tickFormatter={formatTime}
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(2)} МБ`, '']}
                  labelFormatter={(label) => formatTime(label)}
                />
                <Legend />
                {nodeNames.map((nodeName, index) => (
                  <Line 
                    key={nodeName}
                    type="monotone" 
                    dataKey={nodeName}
                    name={nodeName}
                    stroke={getColorForNode(index)} 
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Использование JVM Heap (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={jvmData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }} 
                  stroke="#666"
                  tickFormatter={formatTime}
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, '']}
                  labelFormatter={(label) => formatTime(label)}
                />
                <Legend />
                {nodeNames.map((nodeName, index) => (
                  <Line 
                    key={nodeName}
                    type="monotone" 
                    dataKey={nodeName}
                    name={nodeName}
                    stroke={getColorForNode(index)} 
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Размер индексов и документы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indicesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }} 
                  stroke="#666"
                  tickFormatter={formatTime}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#2196F3" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#4CAF50" />
                <Tooltip 
                  formatter={(value: any, name: any) => {
                    return name === 'size' 
                      ? [`${value.toFixed(2)} МБ`, 'Размер'] 
                      : [`${value}`, 'Документы'];
                  }}
                  labelFormatter={(label) => formatTime(label)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="size"
                  name="Размер (МБ)"
                  stroke="#2196F3" 
                  dot={false}
                  activeDot={{ r: 5 }}
                  yAxisId="left"
                />
                <Line 
                  type="monotone" 
                  dataKey="docs"
                  name="Документы"
                  stroke="#4CAF50" 
                  dot={false}
                  activeDot={{ r: 5 }}
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClusterMetrics;
