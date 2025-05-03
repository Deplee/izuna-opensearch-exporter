
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/contexts/ConfigContext';
import { useToast } from '@/components/ui/use-toast';

const ConfigPanel: React.FC = () => {
  const { pollingInterval, setPollingInterval } = useConfig();
  const { toast } = useToast();
  const [interval, setInterval] = React.useState(pollingInterval / 1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInterval = Math.max(5, interval) * 1000; // Минимум 5 секунд
    setPollingInterval(newInterval);
    toast({
      title: "Настройки обновлены",
      description: `Интервал опроса установлен на ${newInterval / 1000} секунд`,
      variant: "default"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки экспортера</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interval">Интервал опроса (секунды)</Label>
            <div className="flex gap-2">
              <Input
                id="interval"
                type="number"
                min="5"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 30)}
              />
              <Button type="submit">Сохранить</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Рекомендуемый интервал: 30-60 секунд. Слишком частый опрос может создать дополнительную нагрузку на кластер.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConfigPanel;
