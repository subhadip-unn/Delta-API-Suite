import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
// @ts-ignore - curl-to-fetch doesn't have TypeScript definitions
import curlToFetch from 'curl-to-fetch';
import { 
  Play, 
  Copy, 
  Trash2, 
  Plus, 
  Download, 
  Upload, 
  Globe, 
  Code,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface APIRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  queryParams: Array<{key: string, value: string, enabled: boolean}>;
  body: string;
  bodyType: 'json' | 'form' | 'raw' | 'none';
}

interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  duration: number;
  size: number;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const COMMON_HEADERS = [
  'Content-Type', 'Authorization', 'Accept', 'User-Agent', 
  'X-API-Key', 'X-Requested-With', 'Cache-Control'
];

export default function UniversalAPIBuilder() {
  const [request, setRequest] = useState<APIRequest>({
    method: 'GET',
    url: '',
    headers: {},
    queryParams: [],
    body: '',
    bodyType: 'json'
  });

  const [response, setResponse] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [requestHistory, setRequestHistory] = useState<APIRequest[]>([]);

  // Fallback custom cURL parser
  const parseCurlCustom = (curlString: string): Partial<APIRequest> => {
    try {
      // Extract method (default to GET if not specified)
      const methodMatch = curlString.match(/-X\s+(\w+)/);
      const method = methodMatch?.[1]?.toUpperCase() || 'GET';
      
      // Extract URL - handle both quoted and unquoted URLs
      const urlMatch = curlString.match(/curl\s+(?:--location\s+)?['"]([^'"]+)['"]/) || 
                      curlString.match(/curl\s+(?:--location\s+)?([^\s]+)/);
      let url = urlMatch?.[1] || '';
      
      // Add protocol if missing
      if (url && !url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      // Extract headers - handle both -H and --header
      const headers: Record<string, string> = {};
      const headerMatches = [
        ...curlString.matchAll(/-H\s+['"]([^'"]+)['"]/g),
        ...curlString.matchAll(/--header\s+['"]([^'"]+)['"]/g)
      ];
      
      headerMatches.forEach(match => {
        const headerLine = match[1];
        const colonIndex = headerLine.indexOf(':');
        if (colonIndex > 0) {
          const key = headerLine.substring(0, colonIndex).trim();
          const value = headerLine.substring(colonIndex + 1).trim();
          if (key && value) {
            headers[key] = value;
          }
        }
      });

      // Extract body - handle --data, --data-raw, -d
      let body = '';
      const bodyMatches = [
        curlString.match(/--data-raw\s+['"]([^'"]+)['"]/s),
        curlString.match(/--data\s+['"]([^'"]+)['"]/s),
        curlString.match(/-d\s+['"]([^'"]+)['"]/s)
      ];
      
      for (const bodyMatch of bodyMatches) {
        if (bodyMatch && bodyMatch[1]) {
          body = bodyMatch[1];
          break;
        }
      }

      // Parse query parameters from URL
      const queryParams: Array<{key: string, value: string, enabled: boolean}> = [];
      if (url.includes('?')) {
        const [baseUrl, queryString] = url.split('?');
        const params = new URLSearchParams(queryString);
        params.forEach((value, key) => {
          queryParams.push({ key, value, enabled: true });
        });
      }

      // Determine body type
      let bodyType: 'json' | 'form' | 'raw' | 'none' = 'none';
      if (body) {
        if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
          bodyType = 'json';
        } else if (body.includes('=') && body.includes('&')) {
          bodyType = 'form';
        } else {
          bodyType = 'raw';
        }
      }

      return {
        method,
        url: url.split('?')[0], // Remove query string from URL
        headers,
        queryParams,
        body,
        bodyType
      };
    } catch (error) {
      console.error('Error in custom cURL parser:', error);
      return {};
    }
  };

  // Parse cURL command using curl-to-fetch library with fallback
  const parseCurl = (curlString: string): Partial<APIRequest> => {
    try {
      console.log('Parsing cURL with curl-to-fetch:', curlString);
      
      // Try curl-to-fetch library first
      const parsed = curlToFetch(curlString);
      
      console.log('curl-to-fetch result:', parsed);
      
      // Extract method
      const method = parsed.options?.method || 'GET';
      
      // Extract URL
      let url = parsed.url || '';
      
      // Add protocol if missing
      if (url && !url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      // Extract headers
      const headers: Record<string, string> = {};
      if (parsed.options?.headers) {
        Object.entries(parsed.options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        });
      }
      
      // Extract body
      const body = parsed.options?.body || '';
      
      // Parse query parameters from URL
      const queryParams: Array<{key: string, value: string, enabled: boolean}> = [];
      if (url.includes('?')) {
        const [baseUrl, queryString] = url.split('?');
        const params = new URLSearchParams(queryString);
        params.forEach((value, key) => {
          queryParams.push({ key, value, enabled: true });
        });
      }

      // Determine body type
      let bodyType: 'json' | 'form' | 'raw' | 'none' = 'none';
      if (body) {
        if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
          bodyType = 'json';
        } else if (body.includes('=') && body.includes('&')) {
          bodyType = 'form';
        } else {
          bodyType = 'raw';
        }
      }

      const result = {
        method,
        url: url.split('?')[0], // Remove query string from URL
        headers,
        queryParams,
        body,
        bodyType
      };
      
      console.log('Final parsed result:', result);
      return result;
      
    } catch (error) {
      console.error('Error parsing cURL with curl-to-fetch, trying custom parser:', error);
      
      // Fallback to custom parser
      const customResult = parseCurlCustom(curlString);
      if (customResult.url) {
        console.log('Custom parser succeeded:', customResult);
        return customResult;
      }
      
      console.error('Both parsers failed for cURL:', curlString);
      return {};
    }
  };

  // Parse raw HTTP request
  const parseRawHTTP = (rawText: string): Partial<APIRequest> => {
    try {
      const lines = rawText.split('\n');
      const firstLine = lines[0];
      const [method, url, version] = firstLine.split(' ');
      
      const headers: Record<string, string> = {};
      let bodyStart = -1;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') {
          bodyStart = i + 1;
          break;
        }
        const [key, ...valueParts] = line.split(': ');
        if (key && valueParts.length > 0) {
          headers[key] = valueParts.join(': ');
        }
      }

      const body = bodyStart > 0 ? lines.slice(bodyStart).join('\n') : '';

      return {
        method: method || 'GET',
        url: url || '',
        headers,
        body,
        bodyType: body ? 'raw' : 'none'
      };
    } catch (error) {
      console.error('Error parsing raw HTTP:', error);
      return {};
    }
  };

  // Auto-detect and parse input
  const handleImport = () => {
    if (!importText.trim()) return;

    let parsed: Partial<APIRequest> = {};
    
    if (importText.trim().startsWith('curl')) {
      parsed = parseCurl(importText);
      console.log('Parsed cURL:', parsed);
    } else if (importText.includes('HTTP/')) {
      parsed = parseRawHTTP(importText);
      console.log('Parsed HTTP:', parsed);
    } else if (importText.startsWith('http')) {
      // Simple URL
      parsed = { url: importText, method: 'GET' };
      console.log('Parsed URL:', parsed);
    }

    if (parsed.url) {
      setRequest(prev => ({ ...prev, ...parsed }));
      setShowImport(false);
      setImportText('');
      console.log('Updated request:', { ...request, ...parsed });
    } else {
      console.error('Failed to parse input:', importText);
      alert('Failed to parse the input. Please check the format.');
    }
  };

  // Execute API request
  const executeRequest = async () => {
    if (!request.url) return;

    setIsLoading(true);
    setResponse(null);

    // Build full URL with query params
    const fullUrl = new URL(request.url);
    request.queryParams.forEach(param => {
      if (param.enabled && param.key) {
        fullUrl.searchParams.append(param.key, param.value);
      }
    });

    try {
      const startTime = Date.now();
      
      // Use GET for GET requests, POST for others
      const isGetRequest = request.method === 'GET';
      
      const response = await fetch(
        isGetRequest 
          ? `/api/proxy?url=${encodeURIComponent(fullUrl.toString())}&headers=${encodeURIComponent(JSON.stringify(request.headers))}`
          : '/api/proxy',
        {
          method: isGetRequest ? 'GET' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: isGetRequest ? undefined : JSON.stringify({
            method: request.method,
            url: fullUrl.toString(),
            headers: request.headers,
            body: request.body || undefined
          })
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      const responseData = await response.json();
      
      setResponse({
        status: responseData.status,
        statusText: responseData.statusText,
        headers: responseData.headers || {},
        body: responseData.body,
        duration: responseData.durationMs || duration,
        size: responseData.size || 0
      });

      // Add to history
      setRequestHistory(prev => [request, ...prev.slice(0, 9)]); // Keep last 10

    } catch (error) {
      console.error('Request failed:', error);
      console.error('Request details:', {
        method: request.method,
        url: fullUrl.toString(),
        headers: request.headers,
        body: request.body
      });
      
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: { 
          error: 'Request failed', 
          details: error instanceof Error ? error.message : 'Unknown error',
          request: {
            method: request.method,
            url: fullUrl.toString(),
            headers: request.headers,
            body: request.body
          }
        },
        duration: 0,
        size: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate cURL command
  const generateCurl = () => {
    let curl = `curl -X ${request.method}`;
    
    // Add headers
    Object.entries(request.headers).forEach(([key, value]) => {
      curl += ` -H "${key}: ${value}"`;
    });

    // Add body
    if (request.body && request.method !== 'GET') {
      curl += ` --data-raw '${request.body}'`;
    }

    // Add URL with query params
    const url = new URL(request.url);
    request.queryParams.forEach(param => {
      if (param.enabled && param.key) {
        url.searchParams.append(param.key, param.value);
      }
    });

    curl += ` "${url.toString()}"`;
    return curl;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import API Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowImport(!showImport)}
                className="flex items-center gap-2"
              >
                <Code className="w-4 h-4" />
                Import cURL/HTTP
              </Button>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(generateCurl())}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Export cURL
              </Button>
            </div>
            
            {showImport && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste cURL command, raw HTTP request, or URL..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleImport} size="sm">
                    Parse & Import
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setImportText('');
                      setShowImport(false);
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            API Request Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Method and URL */}
            <div className="flex gap-2">
              <Select 
                value={request.method} 
                onValueChange={(value) => setRequest(prev => ({ ...prev, method: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map(method => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="https://api.example.com/endpoint"
                value={request.url}
                onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
                className="flex-1"
              />
              
              <Button 
                onClick={executeRequest} 
                disabled={isLoading || !request.url}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Send
              </Button>
            </div>

            <Tabs defaultValue="params" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="params">Query Params</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Query Parameters */}
              <TabsContent value="params" className="space-y-4">
                <div className="space-y-2">
                  {request.queryParams.map((param, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Switch
                        checked={param.enabled}
                        onCheckedChange={(checked) => 
                          setRequest(prev => ({
                            ...prev,
                            queryParams: prev.queryParams.map((p, i) => 
                              i === index ? { ...p, enabled: checked } : p
                            )
                          }))
                        }
                      />
                      <Input
                        placeholder="Key"
                        value={param.key}
                        onChange={(e) => 
                          setRequest(prev => ({
                            ...prev,
                            queryParams: prev.queryParams.map((p, i) => 
                              i === index ? { ...p, key: e.target.value } : p
                            )
                          }))
                        }
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => 
                          setRequest(prev => ({
                            ...prev,
                            queryParams: prev.queryParams.map((p, i) => 
                              i === index ? { ...p, value: e.target.value } : p
                            )
                          }))
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => 
                          setRequest(prev => ({
                            ...prev,
                            queryParams: prev.queryParams.filter((_, i) => i !== index)
                          }))
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => 
                      setRequest(prev => ({
                        ...prev,
                        queryParams: [...prev.queryParams, { key: '', value: '', enabled: true }]
                      }))
                    }
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Parameter
                  </Button>
                </div>
              </TabsContent>

              {/* Headers */}
              <TabsContent value="headers" className="space-y-4">
                <div className="space-y-2">
                  {Object.entries(request.headers).map(([key, value], index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Select
                        value={key}
                        onValueChange={(newKey) => {
                          const newHeaders = { ...request.headers };
                          delete newHeaders[key];
                          newHeaders[newKey] = value;
                          setRequest(prev => ({ ...prev, headers: newHeaders }));
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_HEADERS.map(header => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={value}
                        onChange={(e) => 
                          setRequest(prev => ({
                            ...prev,
                            headers: { ...prev.headers, [key]: e.target.value }
                          }))
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newHeaders = { ...request.headers };
                          delete newHeaders[key];
                          setRequest(prev => ({ ...prev, headers: newHeaders }));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newKey = `Header-${Object.keys(request.headers).length + 1}`;
                      setRequest(prev => ({
                        ...prev,
                        headers: { ...prev.headers, [newKey]: '' }
                      }));
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Header
                  </Button>
                </div>
              </TabsContent>

              {/* Body */}
              <TabsContent value="body" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Label>Body Type:</Label>
                    <Select 
                      value={request.bodyType} 
                      onValueChange={(value: any) => setRequest(prev => ({ ...prev, bodyType: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="form">Form Data</SelectItem>
                        <SelectItem value="raw">Raw</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {request.bodyType !== 'none' && (
                    <Textarea
                      placeholder={
                        request.bodyType === 'json' ? '{"key": "value"}' :
                        request.bodyType === 'form' ? 'key=value&key2=value2' :
                        'Raw text...'
                      }
                      value={request.body}
                      onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                      rows={8}
                      className="font-mono"
                    />
                  )}
                </div>
              </TabsContent>

              {/* History */}
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-2">
                  {requestHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No requests in history yet
                    </p>
                  ) : (
                    requestHistory.map((req, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{req.method}</Badge>
                          <span className="font-mono text-sm">{req.url}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRequest(req)}
                        >
                          Use
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {response.status >= 200 && response.status < 300 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              Response
              <Badge variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}>
                {response.status} {response.statusText}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Duration: {response.duration}ms</span>
                <span>Size: {response.size} bytes</span>
              </div>
              
              <div className="space-y-2">
                <Label>Response Body:</Label>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  {typeof response.body === 'string' 
                    ? response.body 
                    : JSON.stringify(response.body, null, 2)
                  }
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
