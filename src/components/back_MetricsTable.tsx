
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBytes, formatDuration } from '@/utils/opensearch';
import { NodeStats } from '@/types/opensearch';

interface MetricsTableProps {
  nodes: NodeStats[];
}

const MetricsTable: React.FC<MetricsTableProps> = ({ nodes }) => {
  if (!nodes || nodes.length === 0) {
    return <div className="text-center py-4">Нет данных об узлах</div>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя узла</TableHead>
            <TableHead>CPU %</TableHead>
            <TableHead>Нагрузка (LA)</TableHead>
            <TableHead>Память</TableHead>
            <TableHead>JVM Heap</TableHead>
            <TableHead>Время работы</TableHead>
            <TableHead>Документы</TableHead>
            <TableHead>Размер</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nodes.map((node, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{node.name}</TableCell>
              <TableCell className={node.cpu > 80 ? 'text-opensearch-red' : (node.cpu > 60 ? 'text-opensearch-orange' : '')}>
                {node.cpu.toFixed(1)}%
              </TableCell>
              <TableCell>
                {node.load1m.toFixed(2)} / {node.load5m.toFixed(2)} / {node.load15m.toFixed(2)}
              </TableCell>
              <TableCell className={node.memory.freePercent < 20 ? 'text-opensearch-red' : (node.memory.freePercent < 40 ? 'text-opensearch-orange' : '')}>
                {formatBytes(node.memory.used)} / {formatBytes(node.memory.total)}
              </TableCell>
              <TableCell className={node.jvm.heapPercent > 80 ? 'text-opensearch-red' : (node.jvm.heapPercent > 60 ? 'text-opensearch-orange' : '')}>
                {formatBytes(node.jvm.heapUsed)} / {formatBytes(node.jvm.heapMax)} ({node.jvm.heapPercent}%)
              </TableCell>
              <TableCell>{formatDuration(node.jvm.uptime)}</TableCell>
              <TableCell>{node.indices.docsCount.toLocaleString()}</TableCell>
              <TableCell>{formatBytes(node.indices.storeSize)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MetricsTable;
