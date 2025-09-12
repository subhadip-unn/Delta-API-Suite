import { apiLibrary } from './api-library';

// Platform configurations
export const PLATFORMS = [
  { id: 'i', name: 'iOS', prefix: '/i/', description: 'iOS Mobile App' },
  { id: 'm', name: 'MSite', prefix: '/m/', description: 'Mobile Website' },
  { id: 'w', name: 'Website', prefix: '/w/', description: 'Desktop Website' },
  { id: 'a', name: 'Android', prefix: '/a/', description: 'Android Mobile App' },
  { id: 't', name: 'TV', prefix: '/t/', description: 'TV App' },
  { id: 'b', name: 'Backend', prefix: '/b/', description: 'Backend Services' },
  { id: 'v', name: 'Vernacular', prefix: '/v/', description: 'Vernacular App' }
];

// Environment configurations
export const ENVIRONMENTS = [
  { id: 'prod', name: 'Production', baseUrl: 'https://apiprv.cricbuzz.com' },
  { id: 'staging', name: 'Staging', baseUrl: 'http://api.cricbuzz.stg' },
  { id: 'legacy', name: 'Legacy', baseUrl: 'http://apiprv.cricbuzz.com' },
  { id: 'server', name: 'API Server', baseUrl: 'https://apiserver.cricbuzz.com' }
];

// API Endpoint interface
export interface APIEndpoint {
  id: string;
  category: string;
  key: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  pathTemplate: string;
  platformPrefix: string;
  versionHint: string;
  parameters: ParameterDef[];
  examples?: string[];
}

// Parameter definition
export interface ParameterDef {
  key: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  required: boolean;
  description: string;
  placeholder: string;
  options?: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

// Parameter definitions based on your API patterns
const PARAMETER_DEFINITIONS: Record<string, ParameterDef> = {
  'id': {
    key: 'id',
    type: 'number',
    required: true,
    description: 'Match/Team/Player ID',
    placeholder: 'Enter ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'matchId': {
    key: 'matchId',
    type: 'number',
    required: true,
    description: 'Match ID',
    placeholder: 'Enter Match ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'playerId': {
    key: 'playerId',
    type: 'number',
    required: true,
    description: 'Player ID',
    placeholder: 'Enter Player ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'teamId': {
    key: 'teamId',
    type: 'number',
    required: true,
    description: 'Team ID',
    placeholder: 'Enter Team ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'seriesId': {
    key: 'seriesId',
    type: 'number',
    required: true,
    description: 'Series ID',
    placeholder: 'Enter Series ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'videoId': {
    key: 'videoId',
    type: 'number',
    required: true,
    description: 'Video ID',
    placeholder: 'Enter Video ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'venueId': {
    key: 'venueId',
    type: 'number',
    required: true,
    description: 'Venue ID',
    placeholder: 'Enter Venue ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'couponId': {
    key: 'couponId',
    type: 'number',
    required: true,
    description: 'Coupon ID',
    placeholder: 'Enter Coupon ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'buzzId': {
    key: 'buzzId',
    type: 'number',
    required: true,
    description: 'Buzz ID',
    placeholder: 'Enter Buzz ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'iid': {
    key: 'iid',
    type: 'number',
    required: true,
    description: 'Inning ID',
    placeholder: 'Enter Inning ID (e.g., 1 or 2)',
    validation: { pattern: '^[0-9]+$', min: 1, max: 2 }
  },
  'inningId': {
    key: 'inningId',
    type: 'number',
    required: true,
    description: 'Inning ID',
    placeholder: 'Enter Inning ID (e.g., 1 or 2)',
    validation: { pattern: '^[0-9]+$', min: 1, max: 2 }
  },
  'lastPt': {
    key: 'lastPt',
    type: 'number',
    required: false,
    description: 'Last Point (Pagination)',
    placeholder: 'Enter Last Point (e.g., 0)',
    validation: { pattern: '^[0-9]+$', min: 0 }
  },
  'lastTimestamp': {
    key: 'lastTimestamp',
    type: 'number',
    required: false,
    description: 'Last Timestamp (Pagination)',
    placeholder: 'Enter Last Timestamp (e.g., 1640995200)',
    validation: { pattern: '^[0-9]+$', min: 0 }
  },
  'lastNewsId': {
    key: 'lastNewsId',
    type: 'number',
    required: false,
    description: 'Last News ID (Pagination)',
    placeholder: 'Enter Last News ID (e.g., 12345)',
    validation: { pattern: '^[0-9]+$', min: 0 }
  },
  'publishTime': {
    key: 'publishTime',
    type: 'number',
    required: false,
    description: 'Publish Time (Pagination)',
    placeholder: 'Enter Publish Time (e.g., 1640995200)',
    validation: { pattern: '^[0-9]+$', min: 0 }
  },
  'matchTypeId': {
    key: 'matchTypeId',
    type: 'number',
    required: true,
    description: 'Match Type ID',
    placeholder: 'Enter Match Type ID (e.g., 1)',
    validation: { pattern: '^[0-9]+$', min: 1 }
  },
  'seasonId': {
    key: 'seasonId',
    type: 'number',
    required: true,
    description: 'Season ID',
    placeholder: 'Enter Season ID (e.g., 2024)',
    validation: { pattern: '^[0-9]+$', min: 2020 }
  },
  'searchText': {
    key: 'searchText',
    type: 'text',
    required: true,
    description: 'Search Text',
    placeholder: 'Enter search text (e.g., "Virat Kohli")',
    validation: { pattern: '^[a-zA-Z0-9\\s]+$' }
  },
  'pageName': {
    key: 'pageName',
    type: 'text',
    required: true,
    description: 'Page Name',
    placeholder: 'Enter page name (e.g., "home")',
    validation: { pattern: '^[a-zA-Z0-9_-]+$' }
  },
  'code': {
    key: 'code',
    type: 'text',
    required: true,
    description: 'Code',
    placeholder: 'Enter code',
    validation: { pattern: '^[a-zA-Z0-9]+$' }
  },
  'identifier': {
    key: 'identifier',
    type: 'text',
    required: true,
    description: 'Identifier',
    placeholder: 'Enter identifier',
    validation: { pattern: '^[a-zA-Z0-9_-]+$' }
  },
  'imageName': {
    key: 'imageName',
    type: 'text',
    required: true,
    description: 'Image Name',
    placeholder: 'Enter image name (e.g., "player.jpg")',
    validation: { pattern: '^[a-zA-Z0-9._-]+\\.(jpg|jpeg|png|gif|webp)$' }
  },
  'calback_code': {
    key: 'calback_code',
    type: 'text',
    required: true,
    description: 'Callback Code',
    placeholder: 'Enter callback code',
    validation: { pattern: '^[a-zA-Z0-9]+$' }
  },
  'pageType': {
    key: 'pageType',
    type: 'select',
    required: true,
    description: 'Page Type',
    placeholder: 'Select page type',
    options: ['live', 'upcoming', 'completed', 'recent']
  },
  'category': {
    key: 'category',
    type: 'select',
    required: true,
    description: 'Category',
    placeholder: 'Select category',
    options: ['international', 'domestic', 'league', 'women']
  },
  'format': {
    key: 'format',
    type: 'select',
    required: true,
    description: 'Format Type',
    placeholder: 'Select format',
    options: ['test', 'odi', 't20', 't10']
  },
  'type': {
    key: 'type',
    type: 'select',
    required: true,
    description: 'Type',
    placeholder: 'Select type',
    options: ['batting', 'bowling', 'fielding', 'all']
  },
  'sort': {
    key: 'sort',
    type: 'select',
    required: false,
    description: 'Sort Order',
    placeholder: 'Select sort order',
    options: ['asc', 'desc', 'name', 'date']
  },
  'currency': {
    key: 'currency',
    type: 'select',
    required: false,
    description: 'Currency',
    placeholder: 'Select currency',
    options: ['USD', 'INR', 'EUR', 'GBP']
  },
  'socialAuthType': {
    key: 'socialAuthType',
    type: 'select',
    required: true,
    description: 'Social Auth Type',
    placeholder: 'Select auth type',
    options: ['google', 'apple', 'facebook']
  },
  'imageType': {
    key: 'imageType',
    type: 'select',
    required: true,
    description: 'Image Type',
    placeholder: 'Select image type',
    options: ['jpg', 'jpeg', 'png', 'webp', 'gif']
  },
  'buzzType': {
    key: 'buzzType',
    type: 'select',
    required: true,
    description: 'Buzz Type',
    placeholder: 'Select buzz type',
    options: ['video', 'image', 'text', 'poll']
  },
  'seriesType': {
    key: 'seriesType',
    type: 'select',
    required: true,
    description: 'Series Type',
    placeholder: 'Select series type',
    options: ['international', 'domestic', 'league', 'women']
  },
  'tab': {
    key: 'tab',
    type: 'select',
    required: true,
    description: 'Tab',
    placeholder: 'Select tab',
    options: ['overview', 'stats', 'news', 'videos']
  },
  'order': {
    key: 'order',
    type: 'select',
    required: true,
    description: 'Order',
    placeholder: 'Select order',
    options: ['latest', 'popular', 'trending', 'featured']
  },
  'userState': {
    key: 'userState',
    type: 'select',
    required: true,
    description: 'User State',
    placeholder: 'Select user state',
    options: ['active', 'inactive', 'suspended', 'pending']
  },
  'w': {
    key: 'w',
    type: 'number',
    required: true,
    description: 'Width',
    placeholder: 'Enter width (e.g., 300)',
    validation: { pattern: '^[0-9]+$', min: 50, max: 2000 }
  },
  'h': {
    key: 'h',
    type: 'number',
    required: true,
    description: 'Height',
    placeholder: 'Enter height (e.g., 200)',
    validation: { pattern: '^[0-9]+$', min: 50, max: 2000 }
  },
  'year': {
    key: 'year',
    type: 'number',
    required: true,
    description: 'Year',
    placeholder: 'Enter year (e.g., 2024)',
    validation: { pattern: '^[0-9]{4}$', min: 2020, max: 2030 }
  },
  'tournament': {
    key: 'tournament',
    type: 'text',
    required: true,
    description: 'Tournament',
    placeholder: 'Enter tournament name (e.g., "IPL 2024")',
    validation: { pattern: '^[a-zA-Z0-9\\s]+$' }
  }
};

// Extract parameters from path template
function extractParametersFromPath(path: string): ParameterDef[] {
  const matches = path.match(/\{([^}]+)\}/g);
  if (!matches) return [];

  return matches.map(match => {
    const paramKey = match.slice(1, -1);
    
    // Skip system parameters that are handled by dropdowns
    if (paramKey === 'platform' || paramKey === 'version') {
      return null;
    }
    
    return PARAMETER_DEFINITIONS[paramKey] || {
      key: paramKey,
      type: 'text',
      required: true,
      description: paramKey,
      placeholder: `Enter ${paramKey}`,
      validation: { pattern: '^.+$' }
    };
  }).filter((param): param is ParameterDef => param !== null); // Remove null values with type guard
}

// Generate API catalog from api-library.ts
function generateAPICatalog(): APIEndpoint[] {
  const catalog: APIEndpoint[] = [];
  
  // Process each category in apiLibrary
  Object.entries(apiLibrary).forEach(([categoryKey, categoryValue]) => {
    if (typeof categoryValue === 'object' && categoryValue !== null) {
      Object.entries(categoryValue).forEach(([apiKey, apiPath]) => {
        if (typeof apiPath === 'string') {
          // Extract platform prefix from path
          const platformMatch = apiPath.match(/^\/([imwabvt])\//);
          const platformPrefix = platformMatch ? platformMatch[1] : 'm';
          
          // Extract version from path - handle both /v1/ and ${setAPIVersion()}
          let versionHint = 'v1';
          if (apiPath.includes('${setAPIVersion()}')) {
            versionHint = 'v1'; // Default for dynamic version
          } else {
            const versionMatch = apiPath.match(/\/v(\d+)\//);
            versionHint = versionMatch ? `v${versionMatch[1]}` : 'v1';
          }
          
          // Extract parameters
          const parameters = extractParametersFromPath(apiPath);
          
          // Determine HTTP method based on API type
          let method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET';
          
          // Auth APIs are typically POST
          if (categoryKey === 'authentication' || categoryKey === 'auth' || 
              apiKey.includes('login') || apiKey.includes('sign') || 
              apiKey.includes('auth') || apiKey.includes('verify') ||
              apiKey.includes('logout') || apiKey.includes('update') ||
              apiKey.includes('delete') || apiKey.includes('redeem') ||
              apiKey.includes('unlock')) {
            method = 'POST';
          }
          
          // Update/Modify operations
          if (apiKey.includes('update') || apiKey.includes('modify') || 
              apiKey.includes('edit') || apiKey.includes('change')) {
            method = 'PUT';
          }
          
          // Delete operations
          if (apiKey.includes('delete') || apiKey.includes('remove')) {
            method = 'DELETE';
          }

          catalog.push({
            id: `${categoryKey}-${apiKey}`,
            category: categoryKey,
            key: apiKey,
            name: apiKey.charAt(0).toUpperCase() + apiKey.slice(1),
            description: `${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)} - ${apiKey}`,
            method,
            pathTemplate: apiPath,
            platformPrefix,
            versionHint,
            parameters,
            examples: generateExamples(apiPath, parameters)
          });
        }
      });
    }
  });
  
  return catalog;
}

// Generate example URLs
function generateExamples(path: string, parameters: ParameterDef[]): string[] {
  const examples: string[] = [];
  
  // Generate example with sample values
  let examplePath = path;
  parameters.forEach(param => {
    let exampleValue = '';
    switch (param.type) {
      case 'number':
        exampleValue = '12345';
        break;
      case 'text':
        exampleValue = 'example';
        break;
      case 'select':
        exampleValue = param.options?.[0] || 'example';
        break;
      default:
        exampleValue = 'example';
    }
    examplePath = examplePath.replace(`{${param.key}}`, exampleValue);
  });
  
  examples.push(examplePath);
  return examples;
}

// Export the generated catalog
export const apiCatalog = generateAPICatalog();

// Get APIs by category
export function getAPIsByCategory(category: string): APIEndpoint[] {
  return apiCatalog.filter(api => api.category === category);
}

// Get API by ID
export function getAPIById(id: string): APIEndpoint | undefined {
  return apiCatalog.find(api => api.id === id);
}

// Search APIs
export function searchAPIs(query: string): APIEndpoint[] {
  const lowercaseQuery = query.toLowerCase();
  return apiCatalog.filter(api => 
    api.name.toLowerCase().includes(lowercaseQuery) ||
    api.description.toLowerCase().includes(lowercaseQuery) ||
    api.category.toLowerCase().includes(lowercaseQuery) ||
    api.pathTemplate.toLowerCase().includes(lowercaseQuery)
  );
}

// Get categories
export function getCategories(): string[] {
  return Array.from(new Set(apiCatalog.map(api => api.category)));
}

// Generate full URL
export function generateFullURL(
  baseUrl: string,
  pathTemplate: string,
  platform: string,
  version: string,
  parameters: Record<string, string>
): string {
  let fullPath = pathTemplate;
  
  // Replace platform placeholder
  fullPath = fullPath.replace(/{platform}/g, platform);
  
  // Replace version placeholder
  fullPath = fullPath.replace(/{version}/g, version);
  
  // Replace other parameters
  Object.entries(parameters).forEach(([key, value]) => {
    fullPath = fullPath.replace(`{${key}}`, value);
  });
  
  return baseUrl + fullPath;
}

// Validate parameter value
export function validateParameter(key: string, value: string): { valid: boolean; error?: string } {
  const config = PARAMETER_DEFINITIONS[key];
  if (!config) return { valid: true };
  
  if (config.required && !value.trim()) {
    return { valid: false, error: `${config.description} is required` };
  }
  
  if (value && config.validation?.pattern) {
    const regex = new RegExp(config.validation.pattern);
    if (!regex.test(value)) {
      return { valid: false, error: `Invalid format for ${config.description}` };
    }
  }
  
  if (value && config.validation?.min !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < config.validation.min) {
      return { valid: false, error: `${config.description} must be at least ${config.validation.min}` };
    }
  }
  
  if (value && config.validation?.max !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > config.validation.max) {
      return { valid: false, error: `${config.description} must be at most ${config.validation.max}` };
    }
  }
  
  return { valid: true };
}