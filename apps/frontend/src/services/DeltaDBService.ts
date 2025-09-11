// DeltaDB Service - Connects DeltaPro+ with DeltaDB for real data sync
export interface DeltaDBConfig {
  id: string;
  name: string;
  baseUrl: string;
  endpoint: string;
  headers: Record<string, string>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DeltaDBPlatformHeaders {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'mobile' | 'web';
  headers: Record<string, string | undefined>;
  createdAt: string;
  updatedAt: string;
}

export interface DeltaDBBaseURL {
  id: string;
  name: string;
  url: string;
  environment: 'staging' | 'production' | 'development';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DeltaDBEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

class DeltaDBService {
  private readonly STORAGE_KEYS = {
    CONFIGS: 'deltadb-configs',
    PLATFORM_HEADERS: 'deltadb-platform-headers',
    BASE_URLS: 'deltadb-base-urls',
    ENDPOINTS: 'deltadb-endpoints',
    COMPARISON_DATA: 'deltadb-comparison-data'
  };

  // Save API configuration
  async saveConfig(config: Omit<DeltaDBConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeltaDBConfig> {
    const configs = this.getConfigs();
    const newConfig: DeltaDBConfig = {
      ...config,
      id: `config-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    configs.push(newConfig);
    this.saveConfigs(configs);
    
    // Also save to legacy storage for backward compatibility
    this.saveLegacyConfig(newConfig);
    
    return newConfig;
  }

  // Get all API configurations
  getConfigs(): DeltaDBConfig[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.CONFIGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save platform headers
  async savePlatformHeaders(headers: Omit<DeltaDBPlatformHeaders, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeltaDBPlatformHeaders> {
    const allHeaders = this.getPlatformHeaders();
    const newHeaders: DeltaDBPlatformHeaders = {
      ...headers,
      id: `headers-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update existing or add new
    const existingIndex = allHeaders.findIndex(h => h.platform === headers.platform);
    if (existingIndex >= 0) {
      allHeaders[existingIndex] = newHeaders;
    } else {
      allHeaders.push(newHeaders);
    }
    
    this.savePlatformHeadersData(allHeaders);
    return newHeaders;
  }

  // Get platform headers
  getPlatformHeaders(): DeltaDBPlatformHeaders[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.PLATFORM_HEADERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save base URL
  async saveBaseURL(baseURL: Omit<DeltaDBBaseURL, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeltaDBBaseURL> {
    const baseURLs = this.getBaseURLs();
    const newBaseURL: DeltaDBBaseURL = {
      ...baseURL,
      id: `baseurl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    baseURLs.push(newBaseURL);
    this.saveBaseURLsData(baseURLs);
    return newBaseURL;
  }

  // Get base URLs
  getBaseURLs(): DeltaDBBaseURL[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.BASE_URLS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save endpoint
  async saveEndpoint(endpoint: Omit<DeltaDBEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeltaDBEndpoint> {
    const endpoints = this.getEndpoints();
    const newEndpoint: DeltaDBEndpoint = {
      ...endpoint,
      id: `endpoint-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    endpoints.push(newEndpoint);
    this.saveEndpointsData(endpoints);
    return newEndpoint;
  }

  // Get endpoints
  getEndpoints(): DeltaDBEndpoint[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.ENDPOINTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save comparison data
  async saveComparisonData(data: any): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEYS.COMPARISON_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save comparison data:', error);
    }
  }

  // Get comparison data
  getComparisonData(): any {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.COMPARISON_DATA);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  // Initialize default data if none exists
  async initializeDefaultData(): Promise<void> {
    // Initialize default platform headers if none exist
    if (this.getPlatformHeaders().length === 0) {
      const defaultHeaders = [
        {
          name: 'iOS Default Headers',
          platform: 'ios' as const,
          headers: {
            'accept': 'application/json',
            'cb-loc': 'IN',
            'cb-tz': '+0530',
            'cb-appver': '15.8',
            'user-agent': 'CricbuzzMobile/15.8 (com.sports.iCric; build:198; iOS 17.7.1) Alamofire/4.9.1'
          }
        },
        {
          name: 'Android Default Headers',
          platform: 'android' as const,
          headers: {
            'accept': 'application/json',
            'cb-loc': 'IN',
            'cb-appver': '6.23.05',
            'cb-src': 'playstore',
            'user-agent': 'okhttp/4.12.0'
          }
        },
        {
          name: 'Mobile Web Default Headers',
          platform: 'mobile' as const,
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'cb-loc': 'IN',
            'cb-tz': '+0530',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
          }
        },
        {
          name: 'Web Default Headers',
          platform: 'web' as const,
          headers: {
            'accept': 'application/json, text/plain, */*',
            'cb-loc': 'IN',
            'cb-tz': '+0530',
            'user-agent': 'Mozilla/5.0 (X11; Linux x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
          }
        }
      ];

      for (const header of defaultHeaders) {
        await this.savePlatformHeaders(header);
      }
    }

    // NO MORE FAKE DATA! Only platform headers are initialized
    // Base URLs and endpoints will be created by user when needed
  }

  // Private methods for saving data
  private saveConfigs(configs: DeltaDBConfig[]): void {
    localStorage.setItem(this.STORAGE_KEYS.CONFIGS, JSON.stringify(configs));
  }

  private savePlatformHeadersData(headers: DeltaDBPlatformHeaders[]): void {
    localStorage.setItem(this.STORAGE_KEYS.PLATFORM_HEADERS, JSON.stringify(headers));
  }

  private saveBaseURLsData(baseURLs: DeltaDBBaseURL[]): void {
    localStorage.setItem(this.STORAGE_KEYS.BASE_URLS, JSON.stringify(baseURLs));
  }

  private saveEndpointsData(endpoints: DeltaDBEndpoint[]): void {
    localStorage.setItem(this.STORAGE_KEYS.ENDPOINTS, JSON.stringify(endpoints));
  }

  // Legacy support - save to old storage format
  private saveLegacyConfig(config: DeltaDBConfig): void {
    try {
      const legacyKey = 'deltapro-endpoint-configs';
      const existing = localStorage.getItem(legacyKey);
      const parsed = existing ? JSON.parse(existing) : {};
      
      if (config.name.includes('Live API')) {
        parsed.left = {
          baseUrl: config.baseUrl,
          endpoint: config.endpoint,
          headers: config.headers
        };
      } else if (config.name.includes('New API')) {
        parsed.right = {
          baseUrl: config.baseUrl,
          endpoint: config.endpoint,
          headers: config.headers
        };
      }
      
      localStorage.setItem(legacyKey, JSON.stringify(parsed));
    } catch (error) {
      console.warn('Failed to save legacy config:', error);
    }
  }
}

// Export singleton instance
export const deltaDBService = new DeltaDBService();
