// IndexedDB Service for Local API Configuration Storage
// This implements your brilliant idea of storing everything locally on user's laptop

export interface APIConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonHistory {
  id: string;
  name: string;
  leftConfig: APIConfig;
  rightConfig: APIConfig;
  result: any;
  createdAt: Date;
}

class IndexedDBService {
  private dbName = 'CBZ-API-Delta-DB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // API Configs store
        if (!db.objectStoreNames.contains('apiConfigs')) {
          const configStore = db.createObjectStore('apiConfigs', { keyPath: 'id' });
          configStore.createIndex('name', 'name', { unique: false });
          configStore.createIndex('tags', 'tags', { unique: false });
          configStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Comparison History store
        if (!db.objectStoreNames.contains('comparisonHistory')) {
          const historyStore = db.createObjectStore('comparisonHistory', { keyPath: 'id' });
          historyStore.createIndex('name', 'name', { unique: false });
          historyStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  // API Configuration Management
  async saveAPIConfig(config: Omit<APIConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) await this.init();
    
    const id = crypto.randomUUID();
    const now = new Date();
    const fullConfig: APIConfig = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiConfigs'], 'readwrite');
      const store = transaction.objectStore('apiConfigs');
      const request = store.add(fullConfig);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAPIConfig(id: string, updates: Partial<APIConfig>): Promise<void> {
    if (!this.db) await this.init();
    
    const config = await this.getAPIConfig(id);
    if (!config) throw new Error('API config not found');

    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiConfigs'], 'readwrite');
      const store = transaction.objectStore('apiConfigs');
      const request = store.put(updatedConfig);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAPIConfig(id: string): Promise<APIConfig | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiConfigs'], 'readonly');
      const store = transaction.objectStore('apiConfigs');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAPIConfigs(): Promise<APIConfig[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiConfigs'], 'readonly');
      const store = transaction.objectStore('apiConfigs');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async searchAPIConfigs(query: string): Promise<APIConfig[]> {
    const allConfigs = await this.getAllAPIConfigs();
    const lowerQuery = query.toLowerCase();
    
    return allConfigs.filter(config => 
      config.name.toLowerCase().includes(lowerQuery) ||
      config.url.toLowerCase().includes(lowerQuery) ||
      config.description?.toLowerCase().includes(lowerQuery) ||
      config.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async deleteAPIConfig(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiConfigs'], 'readwrite');
      const store = transaction.objectStore('apiConfigs');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Comparison History Management
  async saveComparison(comparison: Omit<ComparisonHistory, 'id' | 'createdAt'>): Promise<string> {
    if (!this.db) await this.init();
    
    const id = crypto.randomUUID();
    const now = new Date();
    const fullComparison: ComparisonHistory = {
      ...comparison,
      id,
      createdAt: now
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['comparisonHistory'], 'readwrite');
      const store = transaction.objectStore('comparisonHistory');
      const request = store.add(fullComparison);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getComparisonHistory(): Promise<ComparisonHistory[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['comparisonHistory'], 'readonly');
      const store = transaction.objectStore('comparisonHistory');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteComparison(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['comparisonHistory'], 'readwrite');
      const store = transaction.objectStore('comparisonHistory');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Export/Import functionality
  async exportAllData(): Promise<string> {
    const configs = await this.getAllAPIConfigs();
    const history = await this.getComparisonHistory();
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      apiConfigs: configs,
      comparisonHistory: history
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    if (data.apiConfigs) {
      for (const config of data.apiConfigs) {
        // Remove existing id to create new one
        const { id, ...configWithoutId } = config;
        await this.saveAPIConfig(configWithoutId);
      }
    }
    
    if (data.comparisonHistory) {
      for (const comparison of data.comparisonHistory) {
        const { id, ...comparisonWithoutId } = comparison;
        await this.saveComparison(comparisonWithoutId);
      }
    }
  }

  // Utility functions
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['apiConfigs', 'comparisonHistory'], 'readwrite');
    const configStore = transaction.objectStore('apiConfigs');
    const historyStore = transaction.objectStore('comparisonHistory');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = configStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = historyStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ]);
  }

  async getDatabaseSize(): Promise<number> {
    if (!this.db) await this.init();
    
    // This is a rough estimate - IndexedDB doesn't provide exact size
    const configs = await this.getAllAPIConfigs();
    const history = await this.getComparisonHistory();
    
    const configSize = JSON.stringify(configs).length;
    const historySize = JSON.stringify(history).length;
    
    return configSize + historySize;
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();

// Initialize on import
indexedDBService.init().catch(console.error);
