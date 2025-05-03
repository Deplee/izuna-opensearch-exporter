
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfig } from '@/contexts/ConfigContext';
import { checkHostAvailability } from '@/utils/opensearch';
import { useToast } from '@/components/ui/use-toast';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const HostsList: React.FC = () => {
  const { hosts, removeHost } = useConfig();
  const { toast } = useToast();
  const [hostStatuses, setHostStatuses] = React.useState<Record<number, boolean>>({});

  // Проверяем доступность хостов при монтировании компонента
  React.useEffect(() => {
    const checkHosts = async () => {
      const statuses: Record<number, boolean> = {};
      
      for (let i = 0; i < hosts.length; i++) {
        statuses[i] = await checkHostAvailability(hosts[i]);
      }
      
      setHostStatuses(statuses);
    };
    
    checkHosts();
    
    // Периодически проверяем хосты
    const interval = setInterval(checkHosts, 60000); // Каждую минуту
    return () => clearInterval(interval);
  }, [hosts]);

  const handleRemoveHost = (index: number) => {
    removeHost(index);
    toast({
      title: "Хост удален",
      description: "Хост успешно удален из мониторинга",
      variant: "default"
    });
  };

  const handleTestConnection = async (index: number) => {
    const isAvailable = await checkHostAvailability(hosts[index]);
    
    setHostStatuses({ ...hostStatuses, [index]: isAvailable });
    
    if (isAvailable) {
      toast({
        title: "Соединение успешно",
        description: `Соединение с ${hosts[index].url} установлено успешно`,
        variant: "default"
      });
    } else {
      toast({
        title: "Ошибка соединения",
        description: `Не удаётся подключиться к ${hosts[index].url}`,
        variant: "destructive"
      });
    }
  };

  if (hosts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Хосты OpenSearch не добавлены
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мониторинг хостов OpenSearch</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hosts.map((host, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-md border"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {hostStatuses[index] !== undefined && (
                  hostStatuses[index] ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )
                )}
                <div className="truncate">
                  <div className="font-medium truncate">{host.url}</div>
                  {host.username && (
                    <div className="text-xs text-muted-foreground truncate">
                      Пользователь: {host.username}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleTestConnection(index)}
                >
                  Проверить
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleRemoveHost(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HostsList;
