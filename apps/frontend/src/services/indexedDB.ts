// IndexedDB Service for DeltaDB
class IndexedDBService {
  private dbName = 'DeltaDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for each cluster
        if (!db.objectStoreNames.contains('baseUrls')) {
          const baseUrlsStore = db.createObjectStore('baseUrls', { keyPath: 'id' });
          baseUrlsStore.createIndex('name', 'name', { unique: false });
          baseUrlsStore.createIndex('environment', 'environment', { unique: false });
        }

        if (!db.objectStoreNames.contains('endpoints')) {
          const endpointsStore = db.createObjectStore('endpoints', { keyPath: 'id' });
          endpointsStore.createIndex('name', 'name', { unique: false });
          endpointsStore.createIndex('category', 'category', { unique: false });
          endpointsStore.createIndex('method', 'method', { unique: false });
        }

        if (!db.objectStoreNames.contains('headers')) {
          const headersStore = db.createObjectStore('headers', { keyPath: 'id' });
          headersStore.createIndex('name', 'name', { unique: false });
          headersStore.createIndex('platform', 'platform', { unique: false });
        }

        if (!db.objectStoreNames.contains('apiConfigs')) {
          const configsStore = db.createObjectStore('apiConfigs', { keyPath: 'id' });
          configsStore.createIndex('name', 'name', { unique: false });
          configsStore.createIndex('baseUrlId', 'baseUrlId', { unique: false });
          configsStore.createIndex('endpointId', 'endpointId', { unique: false });
          configsStore.createIndex('headerId', 'headerId', { unique: false });
        }
      };
    });
  }

  // Base URLs CRUD
  async getBaseUrls(): Promise<any[]> {
    return this.getAllFromStore('baseUrls');
  }

  async addBaseUrl(baseUrl: any): Promise<void> {
    return this.addToStore('baseUrls', baseUrl);
  }

  async updateBaseUrl(id: string, baseUrl: any): Promise<void> {
    return this.updateInStore('baseUrls', id, baseUrl);
  }

  async deleteBaseUrl(id: string): Promise<void> {
    return this.deleteFromStore('baseUrls', id);
  }

  // Endpoints CRUD
  async getEndpoints(): Promise<any[]> {
    return this.getAllFromStore('endpoints');
  }

  async addEndpoint(endpoint: any): Promise<void> {
    return this.addToStore('endpoints', endpoint);
  }

  async updateEndpoint(id: string, endpoint: any): Promise<void> {
    return this.updateInStore('endpoints', id, endpoint);
  }

  async deleteEndpoint(id: string): Promise<void> {
    return this.deleteFromStore('endpoints', id);
  }

  // Headers CRUD
  async getHeaders(): Promise<any[]> {
    return this.getAllFromStore('headers');
  }

  async addHeader(header: any): Promise<void> {
    return this.addToStore('headers', header);
  }

  async updateHeader(id: string, header: any): Promise<void> {
    return this.updateInStore('headers', id, header);
  }

  async deleteHeader(id: string): Promise<void> {
    return this.deleteFromStore('headers', id);
  }

  // API Configs (for DeltaPro+ integration)
  async getAPIConfigs(): Promise<any[]> {
    return this.getAllFromStore('apiConfigs');
  }

  async addAPIConfig(config: any): Promise<void> {
    return this.addToStore('apiConfigs', config);
  }

  async updateAPIConfig(id: string, config: any): Promise<void> {
    return this.updateInStore('apiConfigs', id, config);
  }

  async deleteAPIConfig(id: string): Promise<void> {
    return this.deleteFromStore('apiConfigs', id);
  }

  // Generic CRUD operations
  private async getAllFromStore(storeName: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        try {
          // Auto-initialize if not already done
          await this.initDB();
        } catch (error) {
          reject(new Error('Failed to initialize database'));
          return;
        }
      }

      if (!this.db) {
        reject(new Error('Database still not initialized after init attempt'));
        return;
      }
      
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private async addToStore(storeName: string, item: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        try {
          await this.initDB();
        } catch (error) {
          reject(new Error('Failed to initialize database'));
          return;
        }
      }
      
      if (!this.db) {
        reject(new Error('Database still not initialized after init attempt'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async updateInStore(storeName: string, id: string, item: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ ...item, id });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async deleteFromStore(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Export/Import functionality
  async exportAllData(): Promise<any> {
    const data = {
      baseUrls: await this.getBaseUrls(),
      endpoints: await this.getEndpoints(),
      headers: await this.getHeaders(),
      apiConfigs: await this.getAPIConfigs(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    return data;
  }

  async importData(data: any): Promise<void> {
    // Clear existing data
    await this.clearAllData();

    // Import new data
    for (const baseUrl of data.baseUrls || []) {
      await this.addBaseUrl(baseUrl);
    }

    for (const endpoint of data.endpoints || []) {
      await this.addEndpoint(endpoint);
    }

    for (const header of data.headers || []) {
      await this.addHeader(header);
    }

    for (const config of data.apiConfigs || []) {
      await this.addAPIConfig(config);
    }
  }

  private async clearAllData(): Promise<void> {
    const stores = ['baseUrls', 'endpoints', 'headers', 'apiConfigs'];
    
    for (const storeName of stores) {
      if (this.db?.objectStoreNames.contains(storeName)) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.clear();
      }
    }
  }
}

export const indexedDBService = new IndexedDBService();
