/**
 * 🎯 DELTA API SUITE - API REGISTRY
 * 
 * Professional API registry builder that generates endpoints from configuration
 * Clean separation of concerns with proper typing
 */

import type {
  ApiCategoryId,
  ApiEndpoint,
  EnvironmentId,
  ParameterDefinition,
  PlatformId,
  VersionId
} from '@/types';
import { apiLibrary } from './api-library';
import { API_CATEGORIES, ENVIRONMENTS, PLATFORMS, VERSIONS } from './constants';

// 🎯 API REGISTRY BUILDER
export const buildApiRegistry = (): ApiEndpoint[] => {
  const registry: ApiEndpoint[] = [];
  
  Object.entries(apiLibrary).forEach(([category, endpoints]) => {
    Object.entries(endpoints).forEach(([key, pathTemplate]) => {
      if (typeof pathTemplate === 'string') {
        registry.push({
          id: `${category}-${key}`,
          category: category as ApiCategoryId,
          key,
          name: formatEndpointName(key),
          description: generateDescription(category, key),
          method: inferMethod(key),
          pathTemplate,
          platformPrefix: '/{platform}',
          versionHint: '{version}',
          parameters: extractParameters(pathTemplate),
          examples: generateExamples(pathTemplate)
        });
      } else if (typeof pathTemplate === 'object') {
        // Handle nested endpoints
        Object.entries(pathTemplate).forEach(([subKey, subPathTemplate]) => {
          if (typeof subPathTemplate === 'string') {
            registry.push({
              id: `${category}-${key}-${subKey}`,
              category: category as ApiCategoryId,
              group: key,
              key: subKey,
              name: formatEndpointName(subKey),
              description: generateDescription(category, subKey),
              method: inferMethod(subKey),
              pathTemplate: subPathTemplate,
              platformPrefix: '/{platform}',
              versionHint: '{version}',
              parameters: extractParameters(subPathTemplate),
              examples: generateExamples(subPathTemplate)
            });
          }
        });
      }
    });
  });
  
  return registry;
};

// 🛠️ UTILITY FUNCTIONS
const formatEndpointName = (key: string): string => {
  return key
    .split(/(?=[A-Z])/)
    .join(' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const generateDescription = (category: string, _key: string): string => {
  const categoryDescriptions: Record<string, string> = {
    home: 'Home and dashboard related endpoints',
    match: 'Match center and live score endpoints',
    news: 'News and content management endpoints',
    videos: 'Video and media streaming endpoints',
    teams: 'Team and player information endpoints',
    series: 'Series and tournament endpoints',
    stats: 'Statistics and analytics endpoints',
    schedule: 'Schedule and fixture endpoints',
    authentication: 'User authentication and authorization',
    cbplus: 'CB Plus premium content endpoints',
    iplAuction: 'IPL auction related endpoints',
    search: 'Search and discovery endpoints',
    quiz: 'Quiz and interactive content',
    special: 'Special content and features'
  };
  
  return categoryDescriptions[category] || 'API endpoint for data retrieval';
};

const inferMethod = (key: string): 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' => {
  const methodHints: Record<string, string> = {
    'create': 'POST',
    'add': 'POST',
    'update': 'PUT',
    'edit': 'PUT',
    'modify': 'PUT',
    'delete': 'DELETE',
    'remove': 'DELETE',
    'patch': 'PATCH'
  };
  
  const lowerKey = key.toLowerCase();
  for (const [hint, method] of Object.entries(methodHints)) {
    if (lowerKey.includes(hint)) {
      return method as any;
    }
  }
  
  return 'GET';
};

const extractParameters = (pathTemplate: string): ParameterDefinition[] => {
  const parameters: ParameterDefinition[] = [];
  const paramRegex = /\{([^}]+)\}/g;
  let match;
  
  while ((match = paramRegex.exec(pathTemplate)) !== null) {
    const paramName = match[1];
    
    if (!paramName) continue;
    
    // Skip platform and version as they're handled separately
    if (paramName === 'platform' || paramName === 'version') continue;
    
    parameters.push({
      name: paramName,
      key: paramName,
      type: inferParameterType(paramName),
      required: true,
      description: generateParameterDescription(paramName),
      placeholder: `Enter ${paramName}`,
      example: generateParameterExample(paramName)
    });
  }
  
  return parameters;
};

const inferParameterType = (paramName: string): 'string' | 'number' | 'boolean' => {
  const typeHints: Record<string, string> = {
    'id': 'string',
    'matchId': 'string',
    'playerId': 'string',
    'teamId': 'string',
    'seriesId': 'string',
    'venueId': 'string',
    'videoId': 'string',
    'articleId': 'string',
    'page': 'number',
    'limit': 'number',
    'offset': 'number',
    'year': 'number',
    'month': 'number',
    'day': 'number',
    'isActive': 'boolean',
    'enabled': 'boolean'
  };
  
  const lowerParam = paramName.toLowerCase();
  for (const [hint, type] of Object.entries(typeHints)) {
    if (lowerParam.includes(hint)) {
      return type as any;
    }
  }
  
  return 'string';
};

const generateParameterDescription = (paramName: string): string => {
  const descriptions: Record<string, string> = {
    'id': 'Unique identifier',
    'matchId': 'Match identifier',
    'playerId': 'Player identifier',
    'teamId': 'Team identifier',
    'seriesId': 'Series identifier',
    'venueId': 'Venue identifier',
    'videoId': 'Video identifier',
    'articleId': 'Article identifier',
    'page': 'Page number for pagination',
    'limit': 'Number of items per page',
    'offset': 'Number of items to skip',
    'year': 'Year value',
    'month': 'Month value',
    'day': 'Day value',
    'searchText': 'Search query text',
    'category': 'Content category',
    'format': 'Response format',
    'type': 'Content type'
  };
  
  return descriptions[paramName] || `Parameter: ${paramName}`;
};

const generateParameterExample = (paramName: string): string => {
  const examples: Record<string, string> = {
    'id': '12345',
    'matchId': '12345',
    'playerId': '12345',
    'teamId': '12345',
    'seriesId': '12345',
    'venueId': '12345',
    'videoId': '12345',
    'articleId': '12345',
    'page': '1',
    'limit': '20',
    'offset': '0',
    'year': '2024',
    'month': '1',
    'day': '15',
    'searchText': 'cricket',
    'category': 'international',
    'format': 'json',
    'type': 'news'
  };
  
  return examples[paramName] || 'example';
};

const generateExamples = (pathTemplate: string): string[] => {
  const examples: string[] = [];
  
  // Generate example with common values
  let example = pathTemplate
    .replace(/{platform}/g, 'm')
    .replace(/{version}/g, 'v1')
    .replace(/{id}/g, '12345')
    .replace(/{matchId}/g, '12345')
    .replace(/{playerId}/g, '12345')
    .replace(/{teamId}/g, '12345')
    .replace(/{seriesId}/g, '12345')
    .replace(/{venueId}/g, '12345')
    .replace(/{videoId}/g, '12345')
    .replace(/{articleId}/g, '12345')
    .replace(/{page}/g, '1')
    .replace(/{limit}/g, '20')
    .replace(/{offset}/g, '0')
    .replace(/{year}/g, '2024')
    .replace(/{month}/g, '1')
    .replace(/{day}/g, '15')
    .replace(/{searchText}/g, 'cricket')
    .replace(/{category}/g, 'international')
    .replace(/{format}/g, 'json')
    .replace(/{type}/g, 'news');
  
  examples.push(example);
  
  // Generate example with different platform
  if (pathTemplate.includes('{platform}')) {
    const altExample = example.replace('/m/', '/w/');
    if (altExample !== example) {
      examples.push(altExample);
    }
  }
  
  return examples;
};

// 🎯 EXPORT REGISTRY AND UTILITIES
export const API_REGISTRY = buildApiRegistry();

export const getAPIsByCategory = (category: ApiCategoryId): ApiEndpoint[] => {
  return API_REGISTRY.filter(api => api.category === category);
};

export const getAPIById = (id: string): ApiEndpoint | undefined => {
  return API_REGISTRY.find(api => api.id === id);
};

export const searchAPIs = (query: string): ApiEndpoint[] => {
  const lowerQuery = query.toLowerCase();
  return API_REGISTRY.filter(api => 
    api.name.toLowerCase().includes(lowerQuery) ||
    api.description.toLowerCase().includes(lowerQuery) ||
    api.key.toLowerCase().includes(lowerQuery)
  );
};

export const generateFullURL = (
  endpoint: ApiEndpoint,
  platform: PlatformId = 'm',
  version: VersionId = '{version}',
  environment: EnvironmentId = 'prod',
  parameters: Record<string, string> = {}
): string => {
  const env = ENVIRONMENTS.find(e => e.id === environment);
  const baseUrl = env?.baseUrl || ENVIRONMENTS[0]?.baseUrl || '';
  
  let url = endpoint.pathTemplate
    .replace(/{platform}/g, platform)
    .replace(/{version}/g, version);
  
  // Replace parameters
  Object.entries(parameters).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, value);
  });
  
  return `${baseUrl}${url}`;
};

export const validateParameter = (
  parameter: ParameterDefinition,
  value: string
): { isValid: boolean; error?: string } => {
  if (parameter.required && (!value || value.trim() === '')) {
    return { isValid: false, error: `${parameter.name} is required` };
  }
  
  if (parameter.type === 'number' && value && isNaN(Number(value))) {
    return { isValid: false, error: `${parameter.name} must be a number` };
  }
  
  if (parameter.type === 'boolean' && value && !['true', 'false'].includes(value.toLowerCase())) {
    return { isValid: false, error: `${parameter.name} must be true or false` };
  }
  
  return { isValid: true };
};

// Re-export constants and types for convenience
export { API_CATEGORIES, ENVIRONMENTS, PLATFORMS, VERSIONS };
export type { ApiEndpoint };

