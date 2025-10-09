'use client';

import React, { useState, useMemo } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  Code, 
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { compareJsonData, ComparisonResult, DiffItem } from '@/lib/comparison-engine';

interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  durationMs: number;
  size: number;
  body: any;
  url: string;
}

interface JsonDiffProps {
  source: APIResponse | null;
  target: APIResponse | null;
}

export default function JsonDiff({ source, target }: JsonDiffProps) {
  const [viewMode, setViewMode] = useState<'body' | 'headers'>('body');
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [orderSensitive, setOrderSensitive] = useState(false);

  // Format response data
  const formatResponse = (response: APIResponse | null, mode: 'body' | 'headers') => {
    if (!response) return '';
    
    if (mode === 'headers') {
      return JSON.stringify(response.headers, null, prettyPrint ? 2 : 0);
    } else {
      // Support raw text bodies for text-diff fallback
      if (typeof response.body === 'string') {
        return response.body;
      }
      return JSON.stringify(response.body, null, prettyPrint ? 2 : 0);
    }
  };

  // Perform comparison
  const performComparison = async () => {
    if (!source || !target) return;
    
    setIsComparing(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const sourceData = viewMode === 'body' ? source.body : source.headers;
    const targetData = viewMode === 'body' ? target.body : target.headers;
    
    // If either side is a string (invalid JSON fallback), skip structural compare
    const result = (typeof sourceData === 'string' || typeof targetData === 'string')
      ? {
          identical: sourceContent === targetContent,
          differences: [],
          summary: {
            totalFields: 0,
            identicalFields: 0,
            differentFields: 0,
            missingFields: 0,
            extraFields: 0
          }
        }
      : compareJsonData(sourceData, targetData, orderSensitive);
    setComparisonResult(result);
    setIsComparing(false);
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'missing': return 'bg-red-100 text-red-800 border-red-200';
      case 'extra': return 'bg-green-100 text-green-800 border-green-200';
      case 'changed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'type-changed': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Render difference item
  const renderDiffItem = (diff: DiffItem, index: number) => {
    return (
      <div key={index} className="border rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={getTypeColor(diff.type)}>
              {diff.type.toUpperCase()}
            </Badge>
            <span className="font-mono text-sm text-gray-600">{diff.path}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700">{diff.description}</p>
        {diff.oldValue !== undefined && (
          <div className="bg-red-50 p-2 rounded text-sm">
            <strong>Old:</strong> <code>{JSON.stringify(diff.oldValue)}</code>
          </div>
        )}
        {diff.newValue !== undefined && (
          <div className="bg-green-50 p-2 rounded text-sm">
            <strong>New:</strong> <code>{JSON.stringify(diff.newValue)}</code>
          </div>
        )}
      </div>
    );
  };

  const sourceContent = formatResponse(source, viewMode);
  const targetContent = formatResponse(target, viewMode);
  const isBodyText = typeof (source?.body) === 'string' || typeof (target?.body) === 'string';
  const isHeadersText = typeof (source?.headers as any) === 'string' || typeof (target?.headers as any) === 'string';

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Download as file
  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get status color
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-yellow-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  if (!source && !target) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No responses to compare</p>
            <p className="text-sm">Execute APIs or paste responses to see the diff</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Response Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {source && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Source Response</span>
                </div>
                <Badge variant="outline" className={getStatusColor(source.status)}>
                  {source.status} {source.statusText}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Duration: {source.durationMs}ms</div>
                <div>Size: {source.size} bytes</div>
                <div className="truncate">URL: {source.url}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {target && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Target Response</span>
                </div>
                <Badge variant="outline" className={getStatusColor(target.status)}>
                  {target.status} {target.statusText}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Duration: {target.durationMs}ms</div>
                <div>Size: {target.size} bytes</div>
                <div className="truncate">URL: {target.url}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diff Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <ArrowRight className="w-5 h-5" />
              <span>Response Comparison</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrettyPrint(!prettyPrint)}
              >
                {prettyPrint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {prettyPrint ? 'Raw' : 'Pretty'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(sourceContent + '\n\n---\n\n' + targetContent)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Both
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="body" className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Response Body</span>
              </TabsTrigger>
              <TabsTrigger value="headers" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Headers</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Analysis</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="body" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <DiffEditor
                  key={`body-${source?.url}-${target?.url}-${viewMode}`}
                  height="60vh"
                  language={isBodyText ? 'plaintext' : 'json'}
                  original={sourceContent}
                  modified={targetContent}
                  options={{
                    readOnly: true,
                    renderSideBySide: true,
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontSize: 14,
                    lineNumbers: 'on',
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'always',
                    renderWhitespace: 'selection',
                    renderLineHighlight: 'all',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    cursorStyle: 'line',
                    cursorBlinking: 'blink',
                    cursorSmoothCaretAnimation: "on" as const,
                    cursorWidth: 2,
                    smoothScrolling: true,
                    mouseWheelZoom: true,
                    contextmenu: true,
                    copyWithSyntaxHighlighting: true,
                    find: {
                      addExtraSpaceOnTop: false,
                      autoFindInSelection: 'never',
                      seedSearchStringFromSelection: 'always',
                    },
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="headers" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <DiffEditor
                  key={`headers-${source?.url}-${target?.url}-${viewMode}`}
                  height="60vh"
                  language={isHeadersText ? 'plaintext' : 'json'}
                  original={sourceContent}
                  modified={targetContent}
                  options={{
                    readOnly: true,
                    renderSideBySide: true,
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontSize: 14,
                    lineNumbers: 'on',
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'always',
                    renderWhitespace: 'selection',
                    renderLineHighlight: 'all',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    cursorStyle: 'line',
                    cursorBlinking: 'blink',
                    cursorSmoothCaretAnimation: "on" as const,
                    cursorWidth: 2,
                    smoothScrolling: true,
                    mouseWheelZoom: true,
                    contextmenu: true,
                    copyWithSyntaxHighlighting: true,
                    find: {
                      addExtraSpaceOnTop: false,
                      autoFindInSelection: 'never',
                      seedSearchStringFromSelection: 'always',
                    },
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={performComparison}
                      disabled={!source || !target || isComparing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isComparing ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Compare {viewMode === 'body' ? 'Bodies' : 'Headers'}
                        </>
                      )}
                    </Button>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={orderSensitive}
                        onChange={(e) => setOrderSensitive(e.target.checked)}
                        className="rounded"
                      />
                      <span>Order Sensitive</span>
                    </label>
                  </div>
                </div>
                
                {comparisonResult ? (
                  <div className="space-y-6">
                    {comparisonResult.identical ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-green-700 mb-2">
                          🎉 Perfect Match!
                        </h3>
                        <p className="text-sm text-gray-600">
                          The {viewMode} are completely identical
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-red-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-600">{comparisonResult.summary.missingFields}</div>
                            <div className="text-sm text-red-700">Missing</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">{comparisonResult.summary.extraFields}</div>
                            <div className="text-sm text-green-700">Extra</div>
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-yellow-600">{comparisonResult.summary.differentFields}</div>
                            <div className="text-sm text-yellow-700">Changed</div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">{comparisonResult.summary.identicalFields}</div>
                            <div className="text-sm text-blue-700">Identical</div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {comparisonResult.differences.map((diff, index) => renderDiffItem(diff, index))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>Click "Compare" to analyze differences</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
