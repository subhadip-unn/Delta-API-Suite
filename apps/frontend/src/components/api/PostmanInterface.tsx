import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  FileText,
  Settings,
  Plus,
  Trash2,
  Copy,
  Edit,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Database,
  Zap,
  Shield,
  Code,
  Send
} from 'lucide-react';
import { apiConfig } from '@/lib/api-config';

interface PostmanInterfaceProps {
  onApiExecute: (request: any) => void;
  onResponseReceived: (response: any, status: number, responseTime: number) => void;
  loading: boolean;
  error?: string;
}

interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
  queryParams: Array<{ key: string; value: string; enabled: boolean }>;
  pathParams: Array<{ key: string; value: string }>;
}

const PostmanInterface: React.FC<PostmanInterfaceProps> = ({
  onApiExecute,
  onResponseReceived,
  loading,
  error
}) => {
  const [currentView, setCurrentView] = useState<'explorer' | 'custom' | 'compare'>('explorer');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('m');
  const [selectedCategory, setSelectedCategory] = useState<string>('home');
  const [selectedAPI, setSelectedAPI] = useState<string>('');
  const [request, setRequest] = useState<APIRequest>({
    method: 'GET',
    url: '',
    headers: {},
    queryParams: [],
    pathParams: []
  });
  const [response1, setResponse1] = useState<string>('');
  const [response2, setResponse2] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params');

  // Base URLs
  const baseURLs = [
    { id: 'apiprv-https', name: 'API PRV (HTTPS)', url: 'https://apiprv.cricbuzz.com' },
    { id: 'apiprv-http', name: 'API PRV (HTTP)', url: 'http://apiprv.cricbuzz.com' },
    { id: 'apiserver', name: 'API Server', url: 'https://apiserver.cricbuzz.com' },
    { id: 'api-stg', name: 'API Staging', url: 'http://api.cricbuzz.stg' }
  ];

  // Platforms
  const platforms = [
    { id: 'i', name: 'iOS', prefix: '/i/', description: 'iOS Mobile App' },
    { id: 'm', name: 'Mobile', prefix: '/m/', description: 'Mobile Website' },
    { id: 'w', name: 'Website', prefix: '/w/', description: 'Desktop Website' },
    { id: 'a', name: 'Android', prefix: '/a/', description: 'Android Mobile App' },
    { id: 't', name: 'TV', prefix: '/t/', description: 'TV App' },
    { id: 'b', name: 'Backend', prefix: '/b/', description: 'Backend Services' },
    { id: 'v', name: 'Vernacular', prefix: '/v/', description: 'Vernacular App' }
  ];

  // API Categories
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

  // Get current APIs
  const getCurrentAPIs = () => {
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return [];
    
    return Object.entries(category.apis).map(([key, path]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      path: path,
      method: 'GET',
      description: `${category.name} - ${key}`
    }));
  };

  // Extract parameters from API path
  const extractParameters = (path: string) => {
    const pathMatches = path.match(/\{([^}]+)\}/g);
    const queryMatches = path.match(/\?([^=]+)=/g);
    
    const pathParams = pathMatches ? pathMatches.map(match => ({
      key: match.slice(1, -1),
      value: ''
    })) : [];
    
    const queryParams = queryMatches ? queryMatches.map(match => ({
      key: match.slice(1, -1),
      value: '',
      enabled: true
    })) : [];
    
    return { pathParams, queryParams };
  };

  // Generate full URL
  const generateFullURL = () => {
    let fullUrl = request.url;
    
    // Replace path parameters
    request.pathParams.forEach(param => {
      fullUrl = fullUrl.replace(`{${param.key}}`, param.value);
    });
    
    // Add query parameters
    const enabledQueryParams = request.queryParams.filter(p => p.enabled && p.value);
    if (enabledQueryParams.length > 0) {
      const queryString = enabledQueryParams
        .map(p => `${p.key}=${encodeURIComponent(p.value)}`)
        .join('&');
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
    
    return fullUrl;
  };

  // Handle API selection
  const handleApiSelect = (api: any) => {
    const { pathParams, queryParams } = extractParameters(api.path);
    const platform = platforms.find(p => p.id === selectedPlatform);
    const baseUrl = baseURLs[0].url;
    const fullPath = platform ? platform.prefix + api.path.replace(/^\//, '') : api.path;
    
    setRequest({
      method: 'GET',
      url: baseUrl + fullPath,
      headers: {},
      pathParams,
      queryParams
    });
  };

  // Execute request
  const executeRequest = async () => {
    const fullUrl = generateFullURL();
    onApiExecute({
      method: request.method,
      url: fullUrl,
      headers: request.headers,
      body: request.body
    });
  };

  // Add query parameter
  const addQueryParam = () => {
    setRequest(prev => ({
      ...prev,
      queryParams: [...prev.queryParams, { key: '', value: '', enabled: true }]
    }));
  };

  // Remove query parameter
  const removeQueryParam = (index: number) => {
    setRequest(prev => ({
      ...prev,
      queryParams: prev.queryParams.filter((_, i) => i !== index)
    }));
  };

  // Update query parameter
  const updateQueryParam = (index: number, field: 'key' | 'value' | 'enabled', value: any) => {
    setRequest(prev => ({
      ...prev,
      queryParams: prev.queryParams.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  // Add header
  const addHeader = () => {
    setRequest(prev => ({
      ...prev,
      headers: { ...prev.headers, '': '' }
    }));
  };

  // Remove header
  const removeHeader = (key: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  // Update header
  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[oldKey];
      if (newKey && value) {
        newHeaders[newKey] = value;
      }
      return { ...prev, headers: newHeaders };
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* View Selector */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant={currentView === 'explorer' ? 'default' : 'outline'}
          onClick={() => setCurrentView('explorer')}
          className="flex items-center space-x-2"
        >
          <Database className="w-4 h-4" />
          <span>API Explorer</span>
        </Button>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <Button
          variant={currentView === 'custom' ? 'default' : 'outline'}
          onClick={() => setCurrentView('custom')}
          className="flex items-center space-x-2"
        >
          <Globe className="w-4 h-4" />
          <span>Custom API</span>
        </Button>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <Button
          variant={currentView === 'compare' ? 'default' : 'outline'}
          onClick={() => setCurrentView('compare')}
          className="flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Compare</span>
        </Button>
      </div>

      {/* API Explorer View */}
      {currentView === 'explorer' && (
        <div className="space-y-6">
          {/* API Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>API Explorer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

                <div>
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedAPI('');
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

                <div>
                  <Label>API Endpoint</Label>
                  <Select value={selectedAPI} onValueChange={(value) => {
                    setSelectedAPI(value);
                    const api = getCurrentAPIs().find(a => a.id === value);
                    if (api) handleApiSelect(api);
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
            </CardContent>
          </Card>

          {/* Request Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Request Builder</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Method and URL */}
              <div className="flex space-x-2 mb-4">
                <Select value={request.method} onValueChange={(value: any) => 
                  setRequest(prev => ({ ...prev, method: value }))
                }>
                  <SelectTrigger className="w-32">
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
                <Input
                  value={request.url}
                  onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.example.com/endpoint"
                  className="flex-1"
                />
                <Button onClick={executeRequest} disabled={loading} className="px-6">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Generated URL Preview */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-muted-foreground">Generated URL</Label>
                <div className="p-2 bg-muted rounded text-sm font-mono break-all">
                  {generateFullURL()}
                </div>
              </div>

              {/* Request Tabs */}
              <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="params" className="flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>Params</span>
                  </TabsTrigger>
                  <TabsTrigger value="headers" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Headers</span>
                  </TabsTrigger>
                  <TabsTrigger value="body" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Body</span>
                  </TabsTrigger>
                  <TabsTrigger value="auth" className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Auth</span>
                  </TabsTrigger>
                </TabsList>

                {/* Path Parameters */}
                {request.pathParams.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Path Parameters</Label>
                    <div className="space-y-2 mt-2">
                      {request.pathParams.map((param, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={param.key}
                            disabled
                            className="w-32 bg-muted"
                            placeholder="Parameter"
                          />
                          <Input
                            value={param.value}
                            onChange={(e) => setRequest(prev => ({
                              ...prev,
                              pathParams: prev.pathParams.map((p, i) => 
                                i === index ? { ...p, value: e.target.value } : p
                              )
                            }))}
                            placeholder="Enter value"
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Query Parameters */}
                <TabsContent value="params" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Query Parameters</Label>
                      <Button variant="outline" size="sm" onClick={addQueryParam}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Parameter
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {request.queryParams.map((param, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={param.enabled}
                            onChange={(e) => updateQueryParam(index, 'enabled', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Input
                            value={param.key}
                            onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                            placeholder="Parameter name"
                            className="flex-1"
                          />
                          <Input
                            value={param.value}
                            onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                            placeholder="Parameter value"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQueryParam(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Headers */}
                <TabsContent value="headers" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Headers</Label>
                      <Button variant="outline" size="sm" onClick={addHeader}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Header
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(request.headers).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Input
                            value={key}
                            onChange={(e) => updateHeader(key, e.target.value, value)}
                            placeholder="Header name"
                            className="flex-1"
                          />
                          <Input
                            value={value}
                            onChange={(e) => updateHeader(key, key, e.target.value)}
                            placeholder="Header value"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHeader(key)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Body */}
                <TabsContent value="body" className="mt-4">
                  <div className="space-y-4">
                    <Label>Request Body</Label>
                    <textarea
                      value={request.body || ''}
                      onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Enter JSON body..."
                      className="w-full h-32 p-3 border rounded-md resize-none font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                {/* Auth */}
                <TabsContent value="auth" className="mt-4">
                  <div className="space-y-4">
                    <Label>Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Authentication settings will be added here
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom API View */}
      {currentView === 'custom' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Custom API Request</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left API */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Live API (Current)</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Base URL</Label>
                      <Input placeholder="https://api.example.com" />
                    </div>
                    <div>
                      <Label>Endpoint</Label>
                      <Input placeholder="/v1/users" />
                    </div>
                    <div>
                      <Label>Method</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="GET" />
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
                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Fetch
                    </Button>
                  </div>
                </div>

                {/* Right API */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">New API (Updated)</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Base URL</Label>
                      <Input placeholder="https://api.example.com" />
                    </div>
                    <div>
                      <Label>Endpoint</Label>
                      <Input placeholder="/v1/users" />
                    </div>
                    <div>
                      <Label>Method</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="GET" />
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
                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Fetch
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button size="lg" className="px-8">
                  <FileText className="w-5 h-5 mr-2" />
                  Compare APIs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Response Comparison View */}
      {currentView === 'compare' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Response Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Response 1</Label>
                  <textarea
                    value={response1}
                    onChange={(e) => setResponse1(e.target.value)}
                    placeholder="Paste first API response here..."
                    className="w-full h-64 p-3 border rounded-md resize-none font-mono text-sm"
                  />
                </div>
                <div>
                  <Label>Response 2</Label>
                  <textarea
                    value={response2}
                    onChange={(e) => setResponse2(e.target.value)}
                    placeholder="Paste second API response here..."
                    className="w-full h-64 p-3 border rounded-md resize-none font-mono text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button size="lg" className="px-8">
                  <FileText className="w-5 h-5 mr-2" />
                  Compare Responses
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PostmanInterface;
