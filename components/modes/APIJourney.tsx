'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Simple icon components to avoid hydration issues
const Play = ({ className }: { className?: string }) => <span className={className}>▶️</span>;
const Loader2 = ({ className }: { className?: string }) => <span className={`${className} animate-spin`}>⟳</span>;
const CheckCircle = ({ className }: { className?: string }) => <span className={className}>✅</span>;
const AlertCircle = ({ className }: { className?: string }) => <span className={className}>⚠️</span>;
const Globe = ({ className }: { className?: string }) => <span className={className}>🌐</span>;
const Settings = ({ className }: { className?: string }) => <span className={className}>⚙️</span>;
const Zap = ({ className }: { className?: string }) => <span className={className}>⚡</span>;
const Code = ({ className }: { className?: string }) => <span className={className}>💻</span>;
const ArrowRight = ({ className }: { className?: string }) => <span className={className}>→</span>;
const RefreshCw = ({ className }: { className?: string }) => <span className={className}>🔄</span>;
const Search = ({ className }: { className?: string }) => <span className={className}>🔍</span>;
import { 
  apiCatalog, 
  PLATFORMS, 
  ENVIRONMENTS, 
  getAPIsByCategory, 
  generateFullURL,
  validateParameter,
  type APIEndpoint 
} from '@/lib/apiRegistry';

interface APIJourneyProps {
  onAPIExecute: (side: 'left' | 'right', request: any) => void;
  leftResponse: any;
  rightResponse: any;
  loading: { left: boolean; right: boolean };
  error: { left: string | null; right: string | null };
}

export default function APIJourney({ onAPIExecute, leftResponse, rightResponse, loading, error }: APIJourneyProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [leftAPI, setLeftAPI] = useState<APIEndpoint | null>(null);
  const [rightAPI, setRightAPI] = useState<APIEndpoint | null>(null);
  const [leftParams, setLeftParams] = useState<Record<string, string>>({});
  const [rightParams, setRightParams] = useState<Record<string, string>>({});
  const [leftConfig, setLeftConfig] = useState({
    platform: 'm',
    environment: 'prod',
    version: 'v1'
  });
  const [rightConfig, setRightConfig] = useState({
    platform: 'm',
    environment: 'staging',
    version: 'v1'
  });

  // Get filtered APIs
  const filteredAPIs = searchQuery 
    ? apiCatalog.filter(api => 
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.pathTemplate.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getAPIsByCategory(selectedCategory);


  // Get categories
  const categories = [...new Set(apiCatalog.map(api => api.category))];

  // Handle API selection
  const handleAPISelection = (side: 'left' | 'right', api: APIEndpoint) => {
    if (side === 'left') {
      setLeftAPI(api);
      setLeftParams({});
    } else {
      setRightAPI(api);
      setRightParams({});
    }
  };

  // Handle parameter change
  const handleParameterChange = (side: 'left' | 'right', key: string, value: string) => {
    if (side === 'left') {
      setLeftParams(prev => ({ ...prev, [key]: value }));
    } else {
      setRightParams(prev => ({ ...prev, [key]: value }));
    }
  };

  // Execute API
  const executeAPI = async (side: 'left' | 'right') => {
    const api = side === 'left' ? leftAPI : rightAPI;
    const params = side === 'left' ? leftParams : rightParams;
    const config = side === 'left' ? leftConfig : rightConfig;

    if (!api) return;

    // Validate parameters
    const errors: Record<string, string> = {};
    let hasErrors = false;

    api.parameters.forEach(param => {
      const value = params[param.key] || '';
      const validation = validateParameter(param.key, value);
      if (!validation.valid) {
        errors[param.key] = validation.error || '';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      console.error('Validation errors:', errors);
      return;
    }

    // Generate URL
    const environment = ENVIRONMENTS.find(env => env.id === config.environment);
    const fullURL = generateFullURL(
      environment?.baseUrl || '',
      api.pathTemplate,
      config.platform,
      config.version,
      params
    );

    // Prepare request body for POST/PUT requests
    let requestBody = undefined;
    if ((api.method === 'POST' || api.method === 'PUT') && params['_body']) {
      try {
        requestBody = JSON.parse(params['_body']);
      } catch (e) {
        console.error('Invalid JSON in request body:', e);
        return;
      }
    }

    // Execute request
    onAPIExecute(side, {
      method: api.method,
      url: fullURL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Delta-API-Suite/1.0'
      },
      body: requestBody
    });
  };

  // Generate preview URL
  const generatePreviewURL = (api: APIEndpoint | null, params: Record<string, string>, config: any) => {
    if (!api) return '';
    
    const environment = ENVIRONMENTS.find(env => env.id === config.environment);
    return generateFullURL(
      environment?.baseUrl || '',
      api.pathTemplate,
      config.platform,
      config.version,
      params
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>API Explorer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Search APIs</Label>
              <Input
                placeholder="Search by name, description, or path..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
              {searchQuery && (
                <p className="text-xs text-muted-foreground mt-1">
                  Found {filteredAPIs.length} APIs matching "{searchQuery}"
                </p>
              )}
            </div>
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Left API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Selection */}
            <div>
              <Label>Select API</Label>
              <Select onValueChange={(value) => {
                const api = filteredAPIs.find(a => a.id === value);
                if (api) handleAPISelection('left', api);
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose an API..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredAPIs.map(api => (
                    <SelectItem key={api.id} value={api.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{api.name}</span>
                        <span className="text-xs text-muted-foreground">{api.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuration */}
            {leftAPI && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Platform</Label>
                    <Select value={leftConfig.platform} onValueChange={(value) => 
                      setLeftConfig(prev => ({ ...prev, platform: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(platform => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Environment</Label>
                    <Select value={leftConfig.environment} onValueChange={(value) => 
                      setLeftConfig(prev => ({ ...prev, environment: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENVIRONMENTS.map(env => (
                          <SelectItem key={env.id} value={env.id}>
                            {env.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Version</Label>
                    <Select value={leftConfig.version} onValueChange={(value) => 
                      setLeftConfig(prev => ({ ...prev, version: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">v1</SelectItem>
                        <SelectItem value="v2">v2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Parameters */}
                {leftAPI.parameters.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Parameters</Label>
                    {leftAPI.parameters.map(param => (
                      <div key={param.key} className="space-y-1">
                        <Label htmlFor={`left-${param.key}`} className="text-xs flex items-center space-x-1">
                          <span>{param.description}</span>
                          {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </Label>
                        <Input
                          id={`left-${param.key}`}
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={leftParams[param.key] || ''}
                          onChange={(e) => handleParameterChange('left', param.key, e.target.value)}
                          placeholder={param.placeholder}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Request Body for POST/PUT requests */}
                {(leftAPI.method === 'POST' || leftAPI.method === 'PUT') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Request Body</Label>
                    <textarea
                      className="w-full p-2 border rounded text-sm font-mono"
                      rows={4}
                      placeholder="Enter JSON request body..."
                      value={leftParams['_body'] || ''}
                      onChange={(e) => handleParameterChange('left', '_body', e.target.value)}
                    />
                  </div>
                )}

                {/* Method and Preview URL */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs">Method:</Label>
                    <Badge variant={leftAPI.method === 'GET' ? 'default' : leftAPI.method === 'POST' ? 'destructive' : 'secondary'}>
                      {leftAPI.method}
                    </Badge>
                  </div>
                  <Label className="text-xs">Preview URL</Label>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                    {generatePreviewURL(leftAPI, leftParams, leftConfig)}
                  </div>
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={() => executeAPI('left')}
                  disabled={loading.left || !leftAPI}
                  className="w-full"
                >
                  {loading.left ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Left API
                    </>
                  )}
                </Button>

                {/* Error Display */}
                {error.left && (
                  <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{error.left}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Right API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Right API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Selection */}
            <div>
              <Label>Select API</Label>
              <Select onValueChange={(value) => {
                const api = filteredAPIs.find(a => a.id === value);
                if (api) handleAPISelection('right', api);
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose an API..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredAPIs.map(api => (
                    <SelectItem key={api.id} value={api.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{api.name}</span>
                        <span className="text-xs text-muted-foreground">{api.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuration */}
            {rightAPI && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Platform</Label>
                    <Select value={rightConfig.platform} onValueChange={(value) => 
                      setRightConfig(prev => ({ ...prev, platform: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(platform => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Environment</Label>
                    <Select value={rightConfig.environment} onValueChange={(value) => 
                      setRightConfig(prev => ({ ...prev, environment: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENVIRONMENTS.map(env => (
                          <SelectItem key={env.id} value={env.id}>
                            {env.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Version</Label>
                    <Select value={rightConfig.version} onValueChange={(value) => 
                      setRightConfig(prev => ({ ...prev, version: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">v1</SelectItem>
                        <SelectItem value="v2">v2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Parameters */}
                {rightAPI.parameters.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Parameters</Label>
                    {rightAPI.parameters.map(param => (
                      <div key={param.key} className="space-y-1">
                        <Label htmlFor={`right-${param.key}`} className="text-xs flex items-center space-x-1">
                          <span>{param.description}</span>
                          {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </Label>
                        <Input
                          id={`right-${param.key}`}
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={rightParams[param.key] || ''}
                          onChange={(e) => handleParameterChange('right', param.key, e.target.value)}
                          placeholder={param.placeholder}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Request Body for POST/PUT requests */}
                {(rightAPI.method === 'POST' || rightAPI.method === 'PUT') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Request Body</Label>
                    <textarea
                      className="w-full p-2 border rounded text-sm font-mono"
                      rows={4}
                      placeholder="Enter JSON request body..."
                      value={rightParams['_body'] || ''}
                      onChange={(e) => handleParameterChange('right', '_body', e.target.value)}
                    />
                  </div>
                )}

                {/* Method and Preview URL */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs">Method:</Label>
                    <Badge variant={rightAPI.method === 'GET' ? 'default' : rightAPI.method === 'POST' ? 'destructive' : 'secondary'}>
                      {rightAPI.method}
                    </Badge>
                  </div>
                  <Label className="text-xs">Preview URL</Label>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                    {generatePreviewURL(rightAPI, rightParams, rightConfig)}
                  </div>
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={() => executeAPI('right')}
                  disabled={loading.right || !rightAPI}
                  className="w-full"
                >
                  {loading.right ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Right API
                    </>
                  )}
                </Button>

                {/* Error Display */}
                {error.right && (
                  <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{error.right}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
