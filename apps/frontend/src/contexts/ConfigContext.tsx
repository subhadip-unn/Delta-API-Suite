import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigState, defaultConfig, sampleConfig } from '../types/config';

interface ConfigContextType {
  config: ConfigState;
  setEndpoints: (endpoints: ConfigState['endpoints']) => void;
  setJobs: (jobs: ConfigState['jobs']) => void;
  setHeaders: (headers: ConfigState['headers']) => void;
  setIds: (ids: ConfigState['ids']) => void;
  resetConfig: () => void;
  loadSampleConfig: () => void;
  saveToLocalStorage: () => void;
}

const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ConfigState>(defaultConfig);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('cbzApiDeltaConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse saved config:', e);
      }
    }
  }, []);

  const setEndpoints = (endpoints: ConfigState['endpoints']) => {
    setConfig({ ...config, endpoints });
    showSaveMessage();
  };

  const setJobs = (jobs: ConfigState['jobs']) => {
    setConfig({ ...config, jobs });
    showSaveMessage();
  };

  const setHeaders = (headers: ConfigState['headers']) => {
    setConfig({ ...config, headers });
    showSaveMessage();
  };

  const setIds = (ids: ConfigState['ids']) => {
    setConfig({ ...config, ids });
    showSaveMessage();
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('cbzApiDeltaConfig');
    setSaveMessage('Configuration reset');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const loadSampleConfig = () => {
    setConfig(sampleConfig);
    saveToLocalStorage();
    setSaveMessage('Sample configuration loaded');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('cbzApiDeltaConfig', JSON.stringify(config));
  };

  const showSaveMessage = () => {
    saveToLocalStorage();
    setSaveMessage('Saved to browser');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  // Auto-save whenever config changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [config]);

  return (
    <ConfigContext.Provider
      value={{
        config,
        setEndpoints,
        setJobs,
        setHeaders,
        setIds,
        resetConfig,
        loadSampleConfig,
        saveToLocalStorage,
      }}
    >
      {children}
      {saveMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          {saveMessage}
        </div>
      )}
    </ConfigContext.Provider>
  );
};
