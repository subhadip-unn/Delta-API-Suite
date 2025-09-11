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
  left: APIResponse | null;
  right: APIResponse | null;
}

export default function JsonDiff({ left, right }: JsonDiffProps) {
  const [viewMode, setViewMode] = useState<'body' | 'headers'>('body');
  const [prettyPrint, setPrettyPrint] = useState(true);

  // Format response data
  const formatResponse = (response: APIResponse | null, mode: 'body' | 'headers') => {
    if (!response) return '';
    
    if (mode === 'headers') {
      return JSON.stringify(response.headers, null, prettyPrint ? 2 : 0);
    } else {
      return JSON.stringify(response.body, null, prettyPrint ? 2 : 0);
    }
  };

  const leftContent = formatResponse(left, viewMode);
  const rightContent = formatResponse(right, viewMode);

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

  if (!left && !right) {
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
        {left && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Left Response</span>
                </div>
                <Badge variant="outline" className={getStatusColor(left.status)}>
                  {left.status} {left.statusText}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Duration: {left.durationMs}ms</div>
                <div>Size: {left.size} bytes</div>
                <div className="truncate">URL: {left.url}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {right && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Right Response</span>
                </div>
                <Badge variant="outline" className={getStatusColor(right.status)}>
                  {right.status} {right.statusText}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Duration: {right.durationMs}ms</div>
                <div>Size: {right.size} bytes</div>
                <div className="truncate">URL: {right.url}</div>
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
                onClick={() => copyToClipboard(leftContent + '\n\n---\n\n' + rightContent)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Both
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="body" className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Response Body</span>
              </TabsTrigger>
              <TabsTrigger value="headers" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Headers</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="body" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <DiffEditor
                  height="60vh"
                  language="json"
                  original={leftContent}
                  modified={rightContent}
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
                  height="60vh"
                  language="json"
                  original={leftContent}
                  modified={rightContent}
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
