
import React, { createContext, useState, useContext, useEffect } from 'react';
import { OpenSearchHost } from '@/types/opensearch';

interface ConfigContextType {
  hosts: OpenSearchHost[];
  addHost: (host: OpenSearchHost) => void;
  removeHost: (index: number) => void;
  updateHost: (index: number, host: OpenSearchHost) => void;
  pollingInterval: number;
  setPollingInterval: (interval: number) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Инициализация из localStorage или значения по умолчанию
  const [hosts, setHosts] = useState<OpenSearchHost[]>(() => {
    const savedHosts = localStorage.getItem('opensearch_hosts');
    return savedHosts ? JSON.parse(savedHosts) : [];
  });
  
  const [pollingInterval, setPollingInterval] = useState<number>(() => {
    const savedInterval = localStorage.getItem('opensearch_polling_interval');
    return savedInterval ? parseInt(savedInterval) : 30000; // По умолчанию 30 сек
  });

  // Сохраняем изменения в localStorage
  useEffect(() => {
    localStorage.setItem('opensearch_hosts', JSON.stringify(hosts));
  }, [hosts]);

  useEffect(() => {
    localStorage.setItem('opensearch_polling_interval', pollingInterval.toString());
  }, [pollingInterval]);

  const addHost = (host: OpenSearchHost) => {
    setHosts(prevHosts => [...prevHosts, host]);
  };

  const removeHost = (index: number) => {
    setHosts(prevHosts => prevHosts.filter((_, i) => i !== index));
  };

  const updateHost = (index: number, host: OpenSearchHost) => {
    setHosts(prevHosts => 
      prevHosts.map((h, i) => i === index ? host : h)
    );
  };

  return (
    <ConfigContext.Provider value={{
      hosts,
      addHost,
      removeHost,
      updateHost,
      pollingInterval,
      setPollingInterval
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
