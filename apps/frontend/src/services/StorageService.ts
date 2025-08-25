// StorageService.ts - Professional LocalStorage wrapper for Delta API Suite
// Provides namespaces, JSON safety, size monitoring, and change events

export interface StorageItem {
  id: string;
  key: string;
  value: any;
  size: number;
  lastModified: string;
  namespace: string;
}

export interface StorageNamespace {
  name: string;
  description: string;
  icon: string;
  color: string;
  keys: string[];
}

export interface StorageChangeEvent {
  type: 'set' | 'remove' | 'clear';
  key: string;
  namespace: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

class StorageService {
  private static instance: StorageService;
  private listeners: Map<string, Set<(event: StorageChangeEvent) => void>> = new Map();
  private namespaces: Map<string, StorageNamespace> = new Map();

  constructor() {
    this.initializeNamespaces();
    this.setupStorageListener();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Initialize default namespaces
  private initializeNamespaces() {
    this.namespaces.set('user', {
      name: 'User Settings',
      description: 'User preferences, authentication, and personal settings',
      icon: '👤',
      color: 'from-blue-500 to-blue-600',
      keys: ['cbz-qa-name', 'cbz-user-role', 'cbz-user-settings', 'darkMode']
    });

    this.namespaces.set('deltapro', {
      name: 'DeltaPro+',
      description: 'Advanced JSON comparison tool data and configurations',
      icon: '🔍',
      color: 'from-green-500 to-green-600',
      keys: ['deltapro-endpoint-configs', 'deltapro-comparison-data']
    });

    this.namespaces.set('system', {
      name: 'System',
      description: 'Application system data and navigation',
      icon: '⚙️',
      color: 'from-purple-500 to-purple-600',
      keys: ['cbz-delta-last-visited']
    });
  }

  // Setup cross-tab storage listener
  private setupStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key && event.newValue !== null) {
        this.notifyListeners({
          type: 'set',
          key: event.key,
          namespace: this.getNamespaceForKey(event.key),
          oldValue: event.oldValue ? this.safeParse(event.oldValue) : undefined,
          newValue: this.safeParse(event.newValue),
          timestamp: new Date().toISOString()
        });
      } else if (event.key && event.newValue === null) {
        this.notifyListeners({
          type: 'remove',
          key: event.key,
          namespace: this.getNamespaceForKey(event.key),
          oldValue: event.oldValue ? this.safeParse(event.oldValue) : undefined,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Safe JSON parsing with error handling
  private safeParse(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  // Get namespace for a given key
  private getNamespaceForKey(key: string): string {
    for (const [namespace, config] of this.namespaces) {
      if (config.keys.includes(key)) {
        return namespace;
      }
    }
    return 'unknown';
  }

  // Set item with namespace awareness
  setItem(key: string, value: any, namespace?: string): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      
      // Auto-detect namespace if not provided
      const detectedNamespace = namespace || this.getNamespaceForKey(key);
      
      this.notifyListeners({
        type: 'set',
        key,
        namespace: detectedNamespace,
        oldValue: this.getItem(key),
        newValue: value,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      throw new Error(`Storage quota exceeded or invalid data for key: ${key}`);
    }
  }

  // Get item with safe parsing
  getItem(key: string): any {
    try {
      const value = localStorage.getItem(key);
      return value ? this.safeParse(value) : null;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  // Remove item
  removeItem(key: string): void {
    const oldValue = this.getItem(key);
    const namespace = this.getNamespaceForKey(key);
    
    localStorage.removeItem(key);
    
    this.notifyListeners({
      type: 'remove',
      key,
      namespace,
      oldValue,
      timestamp: new Date().toISOString()
    });
  }

  // Clear all items in a namespace
  clearNamespace(namespace: string): void {
    const config = this.namespaces.get(namespace);
    if (config) {
      config.keys.forEach(key => {
        if (localStorage.getItem(key)) {
          this.removeItem(key);
        }
      });
    }
  }

  // Get all items in a namespace
  getNamespaceItems(namespace: string): StorageItem[] {
    const config = this.namespaces.get(namespace);
    if (!config) return [];

    return config.keys
      .map(key => {
        const value = this.getItem(key);
        if (value !== null) {
          return {
            id: key,
            key,
            value,
            size: JSON.stringify(value).length,
            lastModified: new Date().toISOString(),
            namespace
          };
        }
        return null;
      })
      .filter(Boolean) as StorageItem[];
  }

  // Get all namespaces with their data
  getAllNamespaces(): Map<string, StorageNamespace> {
    return this.namespaces;
  }

  // Get storage usage statistics
  getStorageStats(): {
    totalItems: number;
    totalSize: number;
    namespaces: { [key: string]: { count: number; size: number } };
  } {
    const stats = {
      totalItems: 0,
      totalSize: 0,
      namespaces: {} as { [key: string]: { count: number; size: number } }
    };

    this.namespaces.forEach((_config, namespace) => {
      const items = this.getNamespaceItems(namespace);
      const size = items.reduce((sum, item) => sum + item.size, 0);
      
      stats.namespaces[namespace] = {
        count: items.length,
        size
      };
      
      stats.totalItems += items.length;
      stats.totalSize += size;
    });

    return stats;
  }

  // Export all data as JSON
  exportData(): string {
    const data: { [key: string]: any } = {};
    
    this.namespaces.forEach((_config, _namespace) => {
      _config.keys.forEach(key => {
        const value = this.getItem(key);
        if (value !== null) {
          data[key] = value;
        }
      });
    });
    
    return JSON.stringify(data, null, 2);
  }

  // Import data from JSON
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      Object.entries(data).forEach(([key, value]) => {
        this.setItem(key, value);
      });
      
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid JSON data format');
    }
  }

  // Event listener management
  addListener(namespace: string, callback: (event: StorageChangeEvent) => void): () => void {
    if (!this.listeners.has(namespace)) {
      this.listeners.set(namespace, new Set());
    }
    
    this.listeners.get(namespace)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const namespaceListeners = this.listeners.get(namespace);
      if (namespaceListeners) {
        namespaceListeners.delete(callback);
      }
    };
  }

  private notifyListeners(event: StorageChangeEvent): void {
    // Notify namespace-specific listeners
    const namespaceListeners = this.listeners.get(event.namespace);
    if (namespaceListeners) {
      namespaceListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in storage listener:', error);
        }
      });
    }
    
    // Notify global listeners
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in global storage listener:', error);
        }
      });
    }
  }

  // Check storage quota
  getStorageQuota(): { used: number; available: number; percentage: number } {
    try {
      const testKey = '__storage_test__';
      const testValue = 'x'.repeat(1024 * 1024); // 1MB test
      
      let used = 0;
      let available = 0;
      
      // Calculate used space
      this.namespaces.forEach((_config, _namespace) => {
        _config.keys.forEach(key => {
          const value = this.getItem(key);
          if (value !== null) {
            used += JSON.stringify(value).length;
          }
        });
      });
      
      // Test available space
      try {
        localStorage.setItem(testKey, testValue);
        localStorage.removeItem(testKey);
        available = 5 * 1024 * 1024; // Assume 5MB available (typical for LocalStorage)
      } catch {
        available = 0;
      }
      
      return {
        used,
        available,
        percentage: available > 0 ? Math.round((used / available) * 100) : 0
      };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();

// Export types for external use
export type { StorageService };
