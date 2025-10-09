// Centralized Swagger Configuration
// This ensures consistent API handling across all Swagger implementations

export interface SwaggerConfig {
  baseUrl: string;
  proxyEndpoint: string;
  corsEnabled: boolean;
}

export const SWAGGER_CONFIG: SwaggerConfig = {
  baseUrl: 'https://apiserver.cricbuzz.com',
  proxyEndpoint: '/api/proxy',
  corsEnabled: true
};

// Professional request interceptor factory
export const createSwaggerRequestInterceptor = (config: SwaggerConfig) => {
  return (request: any) => {
    console.log('Swagger Request Interceptor - Original request:', request);
    
    // Skip if already proxied
    if (request.url && !request.url.startsWith('/api/')) {
      let fullUrl = request.url;
      
      // Handle both absolute and relative URLs
      if (!request.url.startsWith('http')) {
        // Relative URL - construct full API URL
        fullUrl = `${config.baseUrl}${request.url}`;
      }
      
      const proxyUrl = `${config.proxyEndpoint}?url=${encodeURIComponent(fullUrl)}`;
      
      console.log('Swagger Request Interceptor:');
      console.log('Original URL:', request.url);
      console.log('Is Absolute URL:', request.url.startsWith('http'));
      console.log('Full URL:', fullUrl);
      console.log('Proxy URL:', proxyUrl);
      
      request.url = proxyUrl;
    }
    
    console.log('Swagger Request Interceptor - Modified request:', request);
    return request;
  };
};

// Professional response interceptor factory
export const createSwaggerResponseInterceptor = () => {
  return (response: any) => {
    // Handle proxy response format
    if (response.body && typeof response.body === 'object' && response.body.body) {
      response.body = response.body.body;
    }
    return response;
  };
};

// Generate OpenAPI spec with proper server configuration
export const generateSwaggerServers = (config: SwaggerConfig) => {
  return [
    {
      url: config.baseUrl,
      description: 'Cricbuzz API Server (via CORS Proxy)'
    }
  ];
};
