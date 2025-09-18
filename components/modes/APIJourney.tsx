'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { compareJsonData, ComparisonResult } from '@/lib/comparison-engine';

interface APIJourneyProps {
  onAPIExecute: (side: 'source' | 'target', request: any) => void;
  sourceResponse: any;
  targetResponse: any;
  loading: { source: boolean; target: boolean };
  error: { source: string | null; target: string | null };
}

export default function APIJourney({ onAPIExecute, sourceResponse, targetResponse, loading, error }: APIJourneyProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [sourceAPI, setSourceAPI] = useState<APIEndpoint | null>(null);
  const [targetAPI, setTargetAPI] = useState<APIEndpoint | null>(null);
  const [autofillTarget, setAutofillTarget] = useState(true);
  const [sourceParams, setSourceParams] = useState<Record<string, string>>({});
  const [targetParams, setTargetParams] = useState<Record<string, string>>({});
  const [sourceConfig, setSourceConfig] = useState({
    platform: 'm',
    environment: 'prod',
    version: 'v1'
  });
  const [targetConfig, setTargetConfig] = useState({
    platform: 'm',
    environment: 'staging',
    version: 'v1'
  });
  const [diffAnalysis, setDiffAnalysis] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

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
  const handleAPISelection = (side: 'source' | 'target', api: APIEndpoint) => {
    if (side === 'source') {
      setSourceAPI(api);
      setSourceParams({});
      // Auto-fill target with the same API for quicker comparison
      if (autofillTarget) {
        setTargetAPI(api);
        setTargetParams({});
        // Keep platform same, suggest a different env/version for comparison
        setTargetConfig(prev => ({
          platform: sourceConfig.platform,
          environment: sourceConfig.environment === 'prod' ? 'staging' : sourceConfig.environment,
          version: sourceConfig.version === 'v1' ? 'v2' : sourceConfig.version
        }));
      }
    } else {
      setTargetAPI(api);
      setTargetParams({});
    }
  };

  // Handle parameter change
  const handleParameterChange = (side: 'source' | 'target', key: string, value: string) => {
    if (side === 'source') {
      setSourceParams(prev => ({ ...prev, [key]: value }));
    } else {
      setTargetParams(prev => ({ ...prev, [key]: value }));
    }
  };

  // Execute API
  const executeAPI = async (side: 'source' | 'target') => {
    const api = side === 'source' ? sourceAPI : targetAPI;
    const params = side === 'source' ? sourceParams : targetParams;
    const config = side === 'source' ? sourceConfig : targetConfig;

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

  // Compare responses
  const compareResponses = async () => {
    if (!sourceResponse || !targetResponse) return;
    
    setIsComparing(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = compareJsonData(sourceResponse, targetResponse, false);
    setDiffAnalysis(result);
    setIsComparing(false);
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
          {/* Autofill toggle */}
          <div className="mt-4 flex items-center space-x-2">
            <Switch id="autofill-target" checked={autofillTarget} onCheckedChange={setAutofillTarget} />
            <Label htmlFor="autofill-target" className="text-sm">
              Auto-fill Target with selected Source API
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* API Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Source API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Selection */}
            <div>
              <Label>Select API</Label>
              <Select value={sourceAPI?.id} onValueChange={(value) => {
                const api = filteredAPIs.find(a => a.id === value);
                if (api) handleAPISelection('source', api);
              }}>
              <SelectTrigger className="mt-1 h-11 text-sm">
                  <SelectValue placeholder="Choose an API..." />
                </SelectTrigger>
              <SelectContent className="text-[13px] leading-5">
                  {filteredAPIs.map(api => (
                    <SelectItem key={api.id} value={api.id}>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{api.name}</span>
                      <span className="text-xs text-muted-foreground/90">{api.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuration */}
            {sourceAPI && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Platform</Label>
                    <Select value={sourceConfig.platform} onValueChange={(value) => 
                      setSourceConfig(prev => ({ ...prev, platform: value }))
                    }>
                      <SelectTrigger className="mt-1 h-10 text-sm">
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
                    <Select value={sourceConfig.environment} onValueChange={(value) => 
                      setSourceConfig(prev => ({ ...prev, environment: value }))
                    }>
                      <SelectTrigger className="mt-1 h-10 text-sm">
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
                    <Select value={sourceConfig.version} onValueChange={(value) => 
                      setSourceConfig(prev => ({ ...prev, version: value }))
                    }>
                      <SelectTrigger className="mt-1 h-10 text-sm">
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
                {sourceAPI.parameters.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Parameters</Label>
                    {sourceAPI.parameters.map(param => (
                      <div key={param.key} className="space-y-1">
                        <Label htmlFor={`source-${param.key}`} className="text-xs flex items-center space-x-1">
                          <span>{param.description}</span>
                          {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </Label>
                        <Input
                          id={`source-${param.key}`}
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={sourceParams[param.key] || ''}
                          onChange={(e) => handleParameterChange('source', param.key, e.target.value)}
                          placeholder={param.placeholder}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Request Body for POST/PUT requests */}
                {(sourceAPI.method === 'POST' || sourceAPI.method === 'PUT') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Request Body</Label>
                    <textarea
                      className="w-full p-2 border rounded text-sm font-mono"
                      rows={4}
                      placeholder="Enter JSON request body..."
                      value={sourceParams['_body'] || ''}
                      onChange={(e) => handleParameterChange('source', '_body', e.target.value)}
                    />
                  </div>
                )}

                {/* Method and Preview URL */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs">Method:</Label>
                    <Badge variant={sourceAPI.method === 'GET' ? 'default' : sourceAPI.method === 'POST' ? 'destructive' : 'secondary'}>
                      {sourceAPI.method}
                    </Badge>
                  </div>
                  <Label className="text-xs">Preview URL</Label>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                    {generatePreviewURL(sourceAPI, sourceParams, sourceConfig)}
                  </div>
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={() => executeAPI('source')}
                  disabled={loading.source || !sourceAPI}
                  className="w-full bg-cricbuzz-500 hover:bg-cricbuzz-600 text-white transition-transform duration-200 will-change-transform hover:scale-[1.01]"
                >
                  {loading.source ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Execute Source API
                    </>
                  )}
                </Button>

                {/* Error Display */}
                {error.source && (
                  <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{error.source}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Target API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Target API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Selection */}
            <div>
              <Label>Select API</Label>
              <Select value={targetAPI?.id} onValueChange={(value) => {
                const api = filteredAPIs.find(a => a.id === value);
                if (api) handleAPISelection('target', api);
              }}>
                <SelectTrigger className="mt-1 h-11 text-sm">
                  <SelectValue placeholder="Choose an API..." />
                </SelectTrigger>
                <SelectContent className="text-[13px] leading-5">
                  {filteredAPIs.map(api => (
                    <SelectItem key={api.id} value={api.id}>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{api.name}</span>
                        <span className="text-xs text-muted-foreground/90">{api.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuration */}
            {targetAPI && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Platform</Label>
                    <Select value={targetConfig.platform} onValueChange={(value) => 
                      setTargetConfig(prev => ({ ...prev, platform: value }))
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
                    <Select value={targetConfig.environment} onValueChange={(value) => 
                      setTargetConfig(prev => ({ ...prev, environment: value }))
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
                    <Select value={targetConfig.version} onValueChange={(value) => 
                      setTargetConfig(prev => ({ ...prev, version: value }))
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
                {targetAPI.parameters.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Parameters</Label>
                    {targetAPI.parameters.map(param => (
                      <div key={param.key} className="space-y-1">
                        <Label htmlFor={`target-${param.key}`} className="text-xs flex items-center space-x-1">
                          <span>{param.description}</span>
                          {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </Label>
                        <Input
                          id={`target-${param.key}`}
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={targetParams[param.key] || ''}
                          onChange={(e) => handleParameterChange('target', param.key, e.target.value)}
                          placeholder={param.placeholder}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Request Body for POST/PUT requests */}
                {(targetAPI.method === 'POST' || targetAPI.method === 'PUT') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Request Body</Label>
                    <textarea
                      className="w-full p-2 border rounded text-sm font-mono"
                      rows={4}
                      placeholder="Enter JSON request body..."
                      value={targetParams['_body'] || ''}
                      onChange={(e) => handleParameterChange('target', '_body', e.target.value)}
                    />
                  </div>
                )}

                {/* Method and Preview URL */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs">Method:</Label>
                    <Badge variant={targetAPI.method === 'GET' ? 'default' : targetAPI.method === 'POST' ? 'destructive' : 'secondary'}>
                      {targetAPI.method}
                    </Badge>
                  </div>
                  <Label className="text-xs">Preview URL</Label>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                    {generatePreviewURL(targetAPI, targetParams, targetConfig)}
                  </div>
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={() => executeAPI('target')}
                  disabled={loading.target || !targetAPI}
                  className="w-full bg-cricbuzz-500 hover:bg-cricbuzz-600 text-white transition-transform duration-200 will-change-transform hover:scale-[1.01]"
                >
                  {loading.target ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Execute Target API
                    </>
                  )}
                </Button>

                {/* Error Display */}
                {error.target && (
                  <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{error.target}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Section */}
      {sourceResponse && targetResponse && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Response Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={compareResponses}
                    disabled={isComparing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isComparing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Compare Responses
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Source: {sourceResponse?.size || 0} bytes | Target: {targetResponse?.size || 0} bytes
                </div>
              </div>
              
              {diffAnalysis && (
                <div className="space-y-4">
                  {diffAnalysis.identical ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-700 mb-2">
                        🎉 Perfect Match!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Both API responses are completely identical
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-red-600">{diffAnalysis.summary.missingFields}</div>
                          <div className="text-sm text-red-700">Missing</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{diffAnalysis.summary.extraFields}</div>
                          <div className="text-sm text-green-700">Extra</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600">{diffAnalysis.summary.differentFields}</div>
                          <div className="text-sm text-yellow-700">Changed</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">{diffAnalysis.summary.identicalFields}</div>
                          <div className="text-sm text-blue-700">Identical</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {diffAnalysis.differences.slice(0, 10).map((diff, index) => (
                          <div key={index} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge className={
                                  diff.type === 'missing' ? 'bg-red-100 text-red-800' :
                                  diff.type === 'extra' ? 'bg-green-100 text-green-800' :
                                  diff.type === 'changed' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-orange-100 text-orange-800'
                                }>
                                  {diff.type.toUpperCase()}
                                </Badge>
                                <span className="font-mono text-sm text-gray-600">{diff.path}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{diff.description}</p>
                          </div>
                        ))}
                        {diffAnalysis.differences.length > 10 && (
                          <div className="text-center text-sm text-gray-500">
                            ... and {diffAnalysis.differences.length - 10} more differences
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
