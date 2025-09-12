'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Loader2, 
  AlertCircle, 
  Globe, 
  Code,
  ArrowRight,
  Copy,
  Trash2
} from 'lucide-react';

interface AdhocCompareProps {
  onAPIExecute: (side: 'left' | 'right', request: any) => void;
  leftResponse: any;
  rightResponse: any;
  loading: { left: boolean; right: boolean };
  error: { left: string | null; right: string | null };
}

export default function AdhocCompare({ onAPIExecute, leftResponse, rightResponse, loading, error }: AdhocCompareProps) {
  const [leftRequest, setLeftRequest] = useState({
    method: 'GET',
    baseUrl: 'https://apiprv.cricbuzz.com',
    platform: '/m/',
    version: 'v1',
    path: '/home/{version}/index',
    headers: {} as Record<string, string>,
    body: ''
  });

  const [rightRequest, setRightRequest] = useState({
    method: 'GET',
    baseUrl: 'https://apiprv.cricbuzz.com',
    platform: '/m/',
    version: 'v1',
    path: '/home/{version}/index',
    headers: {} as Record<string, string>,
    body: ''
  });

  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  // Generate full URL
  const generateURL = (request: typeof leftRequest) => {
    // Replace {version} in path with selected version to prevent duplication
    const dynamicPath = request.path.replace(/{version}/g, request.version);
    return `${request.baseUrl}${request.platform}${dynamicPath}`;
  };

  // Execute request
  const executeRequest = async (side: 'left' | 'right') => {
    const request = side === 'left' ? leftRequest : rightRequest;
    const fullURL = generateURL(request);

    onAPIExecute(side, {
      method: request.method,
      url: fullURL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Delta-API-Suite/1.0',
        ...request.headers
      },
      body: request.body ? JSON.parse(request.body) : undefined
    });
  };

  // Add header
  const addHeader = (side: 'left' | 'right') => {
    if (!newHeaderKey || !newHeaderValue) return;

    const updateRequest = (prev: typeof leftRequest) => ({
      ...prev,
      headers: { ...prev.headers, [newHeaderKey]: newHeaderValue }
    });

    if (side === 'left') {
      setLeftRequest(updateRequest);
    } else {
      setRightRequest(updateRequest);
    }

    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  // Remove header
  const removeHeader = (side: 'left' | 'right', key: string) => {
    const updateRequest = (prev: typeof leftRequest) => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    };

    if (side === 'left') {
      setLeftRequest(updateRequest);
    } else {
      setRightRequest(updateRequest);
    }
  };

  // Parse cURL
  const parseCURL = async (side: 'left' | 'right', curlText: string) => {
    try {
      const response = await fetch('/api/curl/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curlText })
      });

      if (!response.ok) throw new Error('Failed to parse cURL');

      const data = await response.json();
      
      if (data.success) {
        const updateRequest = (prev: typeof leftRequest) => ({
          ...prev,
          method: data.method,
          url: data.url,
          headers: data.headers || {},
          body: data.body ? JSON.stringify(data.body, null, 2) : ''
        });

        if (side === 'left') {
          setLeftRequest(updateRequest);
        } else {
          setRightRequest(updateRequest);
        }
      }
    } catch (error) {
      console.error('cURL parse error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Left Request</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method and URL */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">Method</Label>
                <Select value={leftRequest.method} onValueChange={(value) => 
                  setLeftRequest(prev => ({ ...prev, method: value }))
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
                <Label className="text-xs">Base URL</Label>
                <Input
                  value={leftRequest.baseUrl}
                  onChange={(e) => setLeftRequest(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://apiprv.cricbuzz.com"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Platform and Version */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Platform</Label>
                <Select value={leftRequest.platform} onValueChange={(value) => 
                  setLeftRequest(prev => ({ ...prev, platform: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/i/">iOS (/i/)</SelectItem>
                    <SelectItem value="/m/">MSite (/m/)</SelectItem>
                    <SelectItem value="/w/">Website (/w/)</SelectItem>
                    <SelectItem value="/a/">Android (/a/)</SelectItem>
                    <SelectItem value="/t/">TV (/t/)</SelectItem>
                    <SelectItem value="/b/">Backend (/b/)</SelectItem>
                    <SelectItem value="/v/">Vernacular (/v/)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Version</Label>
                <Select value={leftRequest.version} onValueChange={(value) => 
                  setLeftRequest(prev => ({ ...prev, version: value }))
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

            {/* Path */}
            <div>
              <Label className="text-xs">Path</Label>
              <Input
                value={leftRequest.path}
                onChange={(e) => setLeftRequest(prev => ({ ...prev, path: e.target.value }))}
                placeholder="/home/v1/index"
                className="mt-1"
              />
            </div>

            {/* Preview URL */}
            <div>
              <Label className="text-xs">Preview URL</Label>
              <div className="p-2 bg-muted rounded text-xs font-mono break-all mt-1">
                {generateURL(leftRequest)}
              </div>
            </div>

            {/* Headers */}
            <div>
              <Label className="text-xs">Headers</Label>
              <div className="space-y-2 mt-1">
                {Object.entries(leftRequest.headers).map(([key, value]) => (
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
                      onClick={() => removeHeader('left', key)}
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
                    onClick={() => addHeader('left')}
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
                value={leftRequest.body}
                onChange={(e) => setLeftRequest(prev => ({ ...prev, body: e.target.value }))}
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
                      parseCURL('left', e.currentTarget.value);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="curl -X GET https://..."]') as HTMLInputElement;
                    if (input?.value) parseCURL('left', input.value);
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Execute Button */}
            <Button 
              onClick={() => executeRequest('left')}
              disabled={loading.left}
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
                  Execute Left Request
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
          </CardContent>
        </Card>

        {/* Right Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Right Request</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method and URL */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">Method</Label>
                <Select value={rightRequest.method} onValueChange={(value) => 
                  setRightRequest(prev => ({ ...prev, method: value }))
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
                <Label className="text-xs">Base URL</Label>
                <Input
                  value={rightRequest.baseUrl}
                  onChange={(e) => setRightRequest(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://apiprv.cricbuzz.com"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Platform and Version */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Platform</Label>
                <Select value={rightRequest.platform} onValueChange={(value) => 
                  setRightRequest(prev => ({ ...prev, platform: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/i/">iOS (/i/)</SelectItem>
                    <SelectItem value="/m/">MSite (/m/)</SelectItem>
                    <SelectItem value="/w/">Website (/w/)</SelectItem>
                    <SelectItem value="/a/">Android (/a/)</SelectItem>
                    <SelectItem value="/t/">TV (/t/)</SelectItem>
                    <SelectItem value="/b/">Backend (/b/)</SelectItem>
                    <SelectItem value="/v/">Vernacular (/v/)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Version</Label>
                <Select value={rightRequest.version} onValueChange={(value) => 
                  setRightRequest(prev => ({ ...prev, version: value }))
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

            {/* Path */}
            <div>
              <Label className="text-xs">Path</Label>
              <Input
                value={rightRequest.path}
                onChange={(e) => setRightRequest(prev => ({ ...prev, path: e.target.value }))}
                placeholder="/home/v1/index"
                className="mt-1"
              />
            </div>

            {/* Preview URL */}
            <div>
              <Label className="text-xs">Preview URL</Label>
              <div className="p-2 bg-muted rounded text-xs font-mono break-all mt-1">
                {generateURL(rightRequest)}
              </div>
            </div>

            {/* Headers */}
            <div>
              <Label className="text-xs">Headers</Label>
              <div className="space-y-2 mt-1">
                {Object.entries(rightRequest.headers).map(([key, value]) => (
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
                      onClick={() => removeHeader('right', key)}
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
                    onClick={() => addHeader('right')}
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
                value={rightRequest.body}
                onChange={(e) => setRightRequest(prev => ({ ...prev, body: e.target.value }))}
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
                      parseCURL('right', e.currentTarget.value);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="curl -X GET https://..."]') as HTMLInputElement;
                    if (input?.value) parseCURL('right', input.value);
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Execute Button */}
            <Button 
              onClick={() => executeRequest('right')}
              disabled={loading.right}
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
                  Execute Right Request
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
