'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertCircle,
  Check,
  Copy,
  Edit2,
  Loader2,
  Play,
  Trash2,
  X
} from 'lucide-react';
import { useState } from 'react';

interface AdhocCompareProps {
  onAPIExecute: (side: 'source' | 'target', request: Record<string, unknown>) => void;
  sourceResponse: unknown;
  targetResponse: unknown;
  loading: { source: boolean; target: boolean };
  error: { source: string | null; target: string | null };
}

export default function AdhocCompare({ onAPIExecute, loading, error }: AdhocCompareProps) {
  const [sourceRequest, setSourceRequest] = useState({
    method: 'GET',
    environment: 'prod',
    path: '/m/home/v1/index',
    headers: {} as Record<string, string>,
    body: ''
  });

  const [targetRequest, setTargetRequest] = useState({
    method: 'GET',
    environment: 'staging',
    path: '/m/home/v2/index',
    headers: {} as Record<string, string>,
    body: ''
  });

  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  // URL editing states
  const [editingURL, setEditingURL] = useState<string | null>(null);
  const [editedURL, setEditedURL] = useState<string>('');
  const [customURLs, setCustomURLs] = useState<Record<string, string>>({});

  // Environment to base URL mapping
  const getBaseUrl = (environment: string) => {
    switch (environment) {
      case 'prod':
        return 'https://apiprv.cricbuzz.com';
      case 'staging':
        return 'http://api.cricbuzz.stg';
      case 'dev':
        return 'https://api.cricbuzz.com';
      default:
        return 'https://apiserver.cricbuzz.com';
    }
  };

  // Generate full URL
  const generateURL = (request: typeof sourceRequest) => {
    const baseUrl = getBaseUrl(request.environment);
    // Ensure path starts with /
    const cleanPath = request.path.startsWith('/') ? request.path : `/${request.path}`;
    return `${baseUrl}${cleanPath}`;
  };

  // URL editing functions
  const handleEditURL = (url: string, key: string) => {
    setEditingURL(key);
    setEditedURL(url);
  };

  const handleSaveURL = (key: string) => {
    setCustomURLs(prev => ({ ...prev, [key]: editedURL }));
    setEditingURL(null);
    setEditedURL('');
  };

  const handleCancelEdit = () => {
    setEditingURL(null);
    setEditedURL('');
  };

  const handleCopyURL = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (_err) {
      // Failed to copy URL - handled by UI feedback
    }
  };

  const getDisplayURL = (originalURL: string, key: string) => {
    return customURLs[key] || originalURL;
  };

  // Reusable URL Editor Component
  const URLEditor = ({ url, urlKey, label }: { url: string; urlKey: string; label: string }) => {
    const displayURL = getDisplayURL(url, urlKey);
    const isEditing = editingURL === urlKey;

    return (
      <div className="space-y-2">
        <Label className="text-xs">{label}</Label>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Input
                value={editedURL}
                onChange={(e) => setEditedURL(e.target.value)}
                className="flex-1 text-xs font-mono"
                placeholder="Enter custom URL..."
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSaveURL(urlKey)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1 text-xs font-mono bg-muted/50 p-2 rounded border break-all">
                {displayURL}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditURL(displayURL, urlKey)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopyURL(displayURL)}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Execute request
  const executeRequest = async (side: 'source' | 'target') => {
    const request = side === 'source' ? sourceRequest : targetRequest;
    const generatedURL = generateURL(request);
    const customURL = customURLs[`${side}-request`];
    const finalURL = customURL || generatedURL;

    // Execute request with generated or custom URL

    // Parse body safely
    let parsedBody = undefined;
    if (request.body && request.body.trim()) {
      try {
        parsedBody = JSON.parse(request.body);
      } catch (_error) {
        // Invalid JSON in request body - handled by UI validation
        return; // Don't execute if JSON is invalid
      }
    }

    onAPIExecute(side, {
      method: request.method,
      url: finalURL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Delta-API-Suite/1.0',
        ...request.headers
      },
      body: parsedBody
    });
  };

  // Add header
  const addHeader = (side: 'source' | 'target') => {
    if (!newHeaderKey || !newHeaderValue) return;

    const updateRequest = (prev: typeof sourceRequest) => ({
      ...prev,
      headers: { ...prev.headers, [newHeaderKey]: newHeaderValue }
    });

    if (side === 'source') {
      setSourceRequest(updateRequest);
    } else {
      setTargetRequest(updateRequest);
    }

    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  // Remove header
  const removeHeader = (side: 'source' | 'target', key: string) => {
    const updateRequest = (prev: typeof sourceRequest) => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    };

    if (side === 'source') {
      setSourceRequest(updateRequest);
    } else {
      setTargetRequest(updateRequest);
    }
  };

  // Parse cURL
  const parseCURL = async (side: 'source' | 'target', curlText: string) => {
    try {
      const response = await fetch('/api/curl/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curlText })
      });

      if (!response.ok) throw new Error('Failed to parse cURL');

      const data = await response.json();
      
      if (data.success && data.url) {
        // Parse the URL to extract path and determine environment
        const url = new URL(data.url);
        const path = url.pathname + url.search; // Include query params
        
        // Determine environment based on hostname
        let environment = 'prod';
        if (url.hostname.includes('apiserver')) {
          environment = 'dev';
        } else if (url.hostname.includes('stg') || url.hostname.includes('staging')) {
          environment = 'staging';
        }
        
        const updateRequest = (prev: typeof sourceRequest) => ({
          ...prev,
          method: data.method,
          environment,
          path,
          headers: data.headers || {},
          body: data.body ? JSON.stringify(data.body, null, 2) : ''
        });

        if (side === 'source') {
          setSourceRequest(updateRequest);
        } else {
          setTargetRequest(updateRequest);
        }
      }
    } catch (_error) {
      // cURL parse error - handled by UI validation
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Source Request</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method and Environment */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">Method</Label>
                <Select value={sourceRequest.method || 'GET'} onValueChange={(value) => 
                  setSourceRequest(prev => ({ ...prev, method: value }))
                }>
                  <SelectTrigger className="mt-1">
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
              <div className="col-span-3">
                <Label className="text-xs">Environment</Label>
                <Select value={sourceRequest.environment || 'prod'} onValueChange={(value) => 
                  setSourceRequest(prev => ({ ...prev, environment: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prod">Production (apiprv.cricbuzz.com)</SelectItem>
                    <SelectItem value="dev">Development (apiserver.cricbuzz.com)</SelectItem>
                    <SelectItem value="staging">Staging (api.cricbuzz.stg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Path with platform and version */}
            <div>
              <Label className="text-xs">API Path (include platform & version)</Label>
              <Input
                value={sourceRequest.path}
                onChange={(e) => setSourceRequest(prev => ({ ...prev, path: e.target.value }))}
                placeholder="/m/home/v1/index"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: /m/home/v1/index or /w/mcenter/v2/12345/info
              </p>
            </div>

            {/* Preview URL */}
            <URLEditor 
              url={generateURL(sourceRequest)}
              urlKey="source-request"
              label="Preview URL"
            />

            {/* Headers */}
            <div>
              <Label className="text-xs">Headers</Label>
              <div className="space-y-2 mt-1">
                {Object.entries(sourceRequest.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Input
                      value={key}
                      readOnly
                      className="text-xs"
                    />
                    <Input
                      value={value}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeHeader('source', key)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    placeholder="Header name"
                    className="text-xs"
                  />
                  <Input
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    placeholder="Header value"
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addHeader('source')}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div>
              <Label className="text-xs">Body (JSON)</Label>
              <textarea
                value={sourceRequest.body}
                onChange={(e) => setSourceRequest(prev => ({ ...prev, body: e.target.value }))}
                placeholder='{"key": "value"}'
                className="w-full h-20 p-2 border rounded text-xs font-mono mt-1"
              />
            </div>

            {/* cURL Paste */}
            <div>
              <Label className="text-xs">Paste cURL</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  placeholder="curl -X GET https://..."
                  className="text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      parseCURL('source', e.currentTarget.value);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="curl -X GET https://..."]') as HTMLInputElement;
                    if (input?.value) parseCURL('source', input.value);
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Execute Button */}
            <Button 
              onClick={() => executeRequest('source')}
              disabled={loading.source}
              className="w-full"
            >
              {loading.source ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute Source Request
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
          </CardContent>
        </Card>

        {/* Target Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Target Request</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method and Environment */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">Method</Label>
                <Select value={targetRequest.method || 'GET'} onValueChange={(value) => 
                  setTargetRequest(prev => ({ ...prev, method: value }))
                }>
                  <SelectTrigger className="mt-1">
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
              <div className="col-span-3">
                <Label className="text-xs">Environment</Label>
                <Select value={targetRequest.environment || 'staging'} onValueChange={(value) => 
                  setTargetRequest(prev => ({ ...prev, environment: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prod">Production (apiprv.cricbuzz.com)</SelectItem>
                    <SelectItem value="dev">Development (apiserver.cricbuzz.com)</SelectItem>
                    <SelectItem value="staging">Staging (api.cricbuzz.stg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Path with platform and version */}
            <div>
              <Label className="text-xs">API Path (include platform & version)</Label>
              <Input
                value={targetRequest.path}
                onChange={(e) => setTargetRequest(prev => ({ ...prev, path: e.target.value }))}
                placeholder="/m/home/v2/index"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: /m/home/v2/index or /w/mcenter/v2/12345/info
              </p>
            </div>

            {/* Preview URL */}
            <URLEditor 
              url={generateURL(targetRequest)}
              urlKey="target-request"
              label="Preview URL"
            />

            {/* Headers */}
            <div>
              <Label className="text-xs">Headers</Label>
              <div className="space-y-2 mt-1">
                {Object.entries(targetRequest.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Input
                      value={key}
                      readOnly
                      className="text-xs"
                    />
                    <Input
                      value={value}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeHeader('target', key)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    placeholder="Header name"
                    className="text-xs"
                  />
                  <Input
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    placeholder="Header value"
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addHeader('target')}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div>
              <Label className="text-xs">Body (JSON)</Label>
              <textarea
                value={targetRequest.body}
                onChange={(e) => setTargetRequest(prev => ({ ...prev, body: e.target.value }))}
                placeholder='{"key": "value"}'
                className="w-full h-20 p-2 border rounded text-xs font-mono mt-1"
              />
            </div>

            {/* cURL Paste */}
            <div>
              <Label className="text-xs">Paste cURL</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  placeholder="curl -X GET https://..."
                  className="text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      parseCURL('target', e.currentTarget.value);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="curl -X GET https://..."]') as HTMLInputElement;
                    if (input?.value) parseCURL('target', input.value);
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Execute Button */}
            <Button 
              onClick={() => executeRequest('target')}
              disabled={loading.target}
              className="w-full"
            >
              {loading.target ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute Target Request
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
