
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useConfig } from '@/contexts/ConfigContext';
import { OpenSearchHost } from '@/types/opensearch';
import { checkHostAvailability } from '@/utils/opensearch';
import { useToast } from '@/components/ui/use-toast';

const AddHostForm: React.FC = () => {
  const { addHost } = useConfig();
  const { toast } = useToast();
  const [url, setUrl] = useState('http://localhost:9200');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newHost: OpenSearchHost = {
        url: url.trim(),
        ...(username && { username }),
        ...(password && { password }),
      };

      const isAvailable = await checkHostAvailability(newHost);

      if (!isAvailable) {
        toast({
          title: "Ошибка соединения",
          description: "Не удаётся подключиться к указанному хосту OpenSearch",
          variant: "destructive"
        });
        return;
      }

      addHost(newHost);
      toast({
        title: "Хост добавлен",
        description: `Хост ${url} успешно добавлен в мониторинг`,
        variant: "default"
      });

      // Сбросить форму
      setUrl('http://localhost:9200');
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Error adding host:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при добавлении хоста",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle>Добавить хост OpenSearch</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL хоста OpenSearch</Label>
            <Input
              id="url"
              placeholder="http://localhost:9200"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя (опционально)</Label>
              <Input
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль (опционально)</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Проверка соединения..." : "Добавить хост"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddHostForm;
