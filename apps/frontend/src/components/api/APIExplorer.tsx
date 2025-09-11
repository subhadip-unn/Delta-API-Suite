import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Globe, 
  FileText,
  Zap,
  Settings,
  RefreshCw
} from 'lucide-react';

// Import your API config
import { apiConfig } from '@/lib/api-config';

interface APIExplorerProps {
  onApiSelect: (baseUrl: string, endpoint: string, headers: Record<string, string>) => void;
  onResponseReceived: (response: any, status: number, responseTime: number) => void;
  loading: boolean;
  error?: string;
}

interface Parameter {
  key: string;
  value: string;
  type: 'text' | 'number' | 'select' | 'date';
  required: boolean;
  description: string;
  options?: string[];
}

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: string;
  description: string;
  parameters: Parameter[];
  category: string;
  platform: string;
}

const APIExplorer: React.FC<APIExplorerProps> = ({
  onApiSelect,
  onResponseReceived,
  loading,
  error
}) => {
  const [selectedMode, setSelectedMode] = useState<'hardcoded' | 'custom' | 'compare'>('hardcoded');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('m');
  const [selectedCategory, setSelectedCategory] = useState<string>('home');
  const [selectedAPI, setSelectedAPI] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customMethod, setCustomMethod] = useState<string>('GET');
  const [customHeaders, setCustomHeaders] = useState<Record<string, string>>({});
  const [response1, setResponse1] = useState<string>('');
  const [response2, setResponse2] = useState<string>('');

  // Base URLs configuration
  const baseURLs = [
    { id: 'apiprv-https', name: 'API PRV (HTTPS)', url: 'https://apiprv.cricbuzz.com' },
    { id: 'apiprv-http', name: 'API PRV (HTTP)', url: 'http://apiprv.cricbuzz.com' },
    { id: 'apiserver', name: 'API Server', url: 'https://apiserver.cricbuzz.com' },
    { id: 'api-stg', name: 'API Staging', url: 'http://api.cricbuzz.stg' }
  ];

  // Platform configuration
  const platforms = [
    { id: 'i', name: 'iOS', prefix: '/i/', description: 'iOS Mobile App' },
    { id: 'm', name: 'Mobile', prefix: '/m/', description: 'Mobile Website' },
    { id: 'w', name: 'Website', prefix: '/w/', description: 'Desktop Website' },
    { id: 'a', name: 'Android', prefix: '/a/', description: 'Android Mobile App' },
    { id: 't', name: 'TV', prefix: '/t/', description: 'TV App' },
    { id: 'b', name: 'Backend', prefix: '/b/', description: 'Backend Services' },
    { id: 'v', name: 'Vernacular', prefix: '/v/', description: 'Vernacular App' }
  ];

  // API Categories from your config
  const categories = [
    { id: 'home', name: 'Home', apis: apiConfig.home },
    { id: 'match', name: 'Match', apis: apiConfig.match },
    { id: 'news', name: 'News', apis: apiConfig.news },
    { id: 'videos', name: 'Videos', apis: apiConfig.videos },
    { id: 'teams', name: 'Teams', apis: apiConfig.teams },
    { id: 'players', name: 'Players', apis: apiConfig.players },
    { id: 'series', name: 'Series', apis: apiConfig.series },
    { id: 'stats', name: 'Statistics', apis: apiConfig.stats },
    { id: 'auth', name: 'Authentication', apis: apiConfig.cbplus?.authentication || {} }
  ];

  // Extract parameters from API path
  const extractParameters = (path: string): Parameter[] => {
    const matches = path.match(/\{([^}]+)\}/g);
    if (!matches) return [];

    return matches.map(match => {
      const paramName = match.slice(1, -1);
      return {
        key: paramName,
        value: parameters[paramName] || '',
        type: getParameterType(paramName),
        required: true,
        description: getParameterDescription(paramName),
        options: getParameterOptions(paramName)
      };
    });
  };

  // Get parameter type based on name
  const getParameterType = (paramName: string): 'text' | 'number' | 'select' | 'date' => {
    if (paramName.includes('id') || paramName.includes('Id')) return 'number';
    if (paramName.includes('date') || paramName.includes('time')) return 'date';
    if (paramName.includes('type') || paramName.includes('format') || paramName.includes('category')) return 'select';
    return 'text';
  };

  // Get parameter description
  const getParameterDescription = (paramName: string): string => {
    const descriptions: Record<string, string> = {
      'id': 'Match/Team/Player ID',
      'matchId': 'Match ID',
      'playerId': 'Player ID',
      'teamId': 'Team ID',
      'seriesId': 'Series ID',
      'videoId': 'Video ID',
      'iid': 'Inning ID',
      'pageType': 'Page Type (live, upcoming, completed)',
      'category': 'Category (international, domestic, league)',
      'format': 'Format Type (test, odi, t20)',
      'year': 'Year',
      'tournament': 'Tournament Name',
      'searchText': 'Search Text',
      'pageName': 'Page Name',
      'buzzType': 'Buzz Type',
      'buzzId': 'Buzz ID',
      'code': 'Code',
      'socialAuthType': 'Social Auth Type (google, apple)',
      'couponId': 'Coupon ID',
      'identifier': 'Identifier',
      'w': 'Width',
      'h': 'Height',
      'imageName': 'Image Name',
      'imageType': 'Image Type',
      'type': 'Type',
      'lastPt': 'Last Point',
      'lastTimestamp': 'Last Timestamp',
      'lastNewsId': 'Last News ID',
      'inningId': 'Inning ID',
      'videoType': 'Video Type',
      'matchTypeId': 'Match Type ID',
      'seasonId': 'Season ID',
      'publishTime': 'Publish Time',
      'seriesType': 'Series Type',
      'tab': 'Tab',
      'order': 'Order',
      'currency': 'Currency',
      'sort': 'Sort',
      'userState': 'User State',
      'calback_code': 'Callback Code'
    };
    return descriptions[paramName] || paramName;
  };

  // Get parameter options for select types
  const getParameterOptions = (paramName: string): string[] => {
    const options: Record<string, string[]> = {
      'pageType': ['live', 'upcoming', 'completed', 'recent'],
      'category': ['international', 'domestic', 'league', 'women'],
      'format': ['test', 'odi', 't20', 't10'],
      'type': ['batting', 'bowling', 'fielding', 'all'],
      'sort': ['asc', 'desc', 'name', 'date'],
      'currency': ['USD', 'INR', 'EUR', 'GBP'],
      'socialAuthType': ['google', 'apple', 'facebook'],
      'imageType': ['jpg', 'png', 'webp', 'gif']
    };
    return options[paramName] || [];
  };

  // Get current API endpoints
  const getCurrentAPIs = () => {
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return [];
    
    return Object.entries(category.apis).map(([key, path]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      path: path,
      method: 'GET',
      description: `${category.name} - ${key}`,
      parameters: extractParameters(path),
      category: selectedCategory,
      platform: selectedPlatform
    }));
  };

  // Generate full URL
  const generateFullURL = (baseUrl: string, endpoint: string, params: Record<string, string>): string => {
    let fullPath = endpoint;
    
    // Replace parameters in the path
    Object.entries(params).forEach(([key, value]) => {
      fullPath = fullPath.replace(`{${key}}`, value);
    });

    // Ensure the path starts with the platform prefix
    const platform = platforms.find(p => p.id === selectedPlatform);
    if (platform && !fullPath.startsWith(platform.prefix)) {
      fullPath = platform.prefix + fullPath.replace(/^\//, '');
    }

    return `${baseUrl}${fullPath}`;
  };

  // Handle API selection
  const handleApiSelect = async (baseUrl: string, endpoint: string, headers: Record<string, string>) => {
    onApiSelect(baseUrl, endpoint, headers);
  };

  // Handle parameter change
  const handleParameterChange = (key: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle API selection from hardcoded list
  const handleHardcodedApiSelect = () => {
    const api = getCurrentAPIs().find(a => a.id === selectedAPI);
    if (!api) return;

    const baseUrl = baseURLs[0].url; // Default to first base URL
    const fullUrl = generateFullURL(baseUrl, api.path, parameters);
    
    // Extract base URL and endpoint from full URL
    const urlParts = fullUrl.split('/');
    const baseUrlPart = urlParts.slice(0, 3).join('/');
    const endpointPart = '/' + urlParts.slice(3).join('/');
    
    onApiSelect(baseUrlPart, endpointPart, {});
  };

  // Handle custom API
  const handleCustomApiSelect = () => {
    if (!customUrl) return;
    
    const urlParts = customUrl.split('/');
    const baseUrl = urlParts.slice(0, 3).join('/');
    const endpoint = '/' + urlParts.slice(3).join('/');
    
    onApiSelect(baseUrl, endpoint, customHeaders);
  };

  // Handle response comparison
  const handleResponseComparison = () => {
    try {
      const parsedResponse1 = JSON.parse(response1);
      const parsedResponse2 = JSON.parse(response2);
      
      // You can implement comparison logic here
      console.log('Comparing responses:', parsedResponse1, parsedResponse2);
    } catch (error) {
      console.error('Invalid JSON in responses:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>API Explorer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedMode} onValueChange={(value) => setSelectedMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hardcoded" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Hardcoded APIs</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Custom API</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Compare Responses</span>
            </TabsTrigger>
          </TabsList>

          {/* Hardcoded API Selection */}
          <TabsContent value="hardcoded" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Platform Selection */}
              <div>
                <Label>Platform</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name} - {platform.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selection */}
              <div>
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedAPI('');
                  setParameters({});
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* API Selection */}
              <div>
                <Label>API Endpoint</Label>
                <Select value={selectedAPI} onValueChange={(value) => {
                  setSelectedAPI(value);
                  setParameters({});
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select API" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentAPIs().map(api => (
                      <SelectItem key={api.id} value={api.id}>
                        {api.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parameters */}
            {selectedAPI && getCurrentAPIs().find(a => a.id === selectedAPI)?.parameters.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <Label className="text-lg font-semibold">Parameters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {getCurrentAPIs().find(a => a.id === selectedAPI)?.parameters.map(param => (
                      <div key={param.key} className="space-y-2">
                        <Label htmlFor={param.key} className="flex items-center space-x-2">
                          <span>{param.description}</span>
                          {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </Label>
                        {param.type === 'select' && param.options ? (
                          <Select 
                            value={parameters[param.key] || ''} 
                            onValueChange={(value) => handleParameterChange(param.key, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${param.key}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {param.options.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={param.key}
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={parameters[param.key] || ''}
                            onChange={(e) => handleParameterChange(param.key, e.target.value)}
                            placeholder={`Enter ${param.key}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generated URL */}
            {selectedAPI && (
              <div className="space-y-2">
                <Label>Generated URL</Label>
                <div className="p-3 bg-muted rounded-md">
                  <code className="text-sm break-all">
                    {generateFullURL(baseURLs[0].url, getCurrentAPIs().find(a => a.id === selectedAPI)?.path || '', parameters)}
                  </code>
                </div>
              </div>
            )}

            {/* Test Button */}
            <Button 
              onClick={handleHardcodedApiSelect}
              disabled={!selectedAPI || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test API
                </>
              )}
            </Button>
          </TabsContent>

          {/* Custom API */}
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>API URL</Label>
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://api.example.com/v1/endpoint"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>HTTP Method</Label>
                  <Select value={customMethod} onValueChange={setCustomMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Base URL</Label>
                  <Select onValueChange={(value) => {
                    const baseUrl = baseURLs.find(b => b.id === value);
                    if (baseUrl) {
                      setCustomUrl(baseUrl.url);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Base URL" />
                    </SelectTrigger>
                    <SelectContent>
                      {baseURLs.map(baseUrl => (
                        <SelectItem key={baseUrl.id} value={baseUrl.id}>
                          {baseUrl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCustomApiSelect}
                disabled={!customUrl || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Test Custom API
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Response Comparison */}
          <TabsContent value="compare" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Response 1</Label>
                <textarea
                  value={response1}
                  onChange={(e) => setResponse1(e.target.value)}
                  placeholder="Paste first API response here..."
                  className="w-full h-32 p-3 border rounded-md resize-none"
                />
              </div>
              <div>
                <Label>Response 2</Label>
                <textarea
                  value={response2}
                  onChange={(e) => setResponse2(e.target.value)}
                  placeholder="Paste second API response here..."
                  className="w-full h-32 p-3 border rounded-md resize-none"
                />
              </div>
            </div>

            <Button 
              onClick={handleResponseComparison}
              disabled={!response1 || !response2}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Compare Responses
            </Button>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIExplorer;
