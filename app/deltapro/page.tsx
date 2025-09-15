'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

// Simple icon components to avoid hydration issues
const Zap = ({ className }: { className?: string }) => <span className={className}>⚡</span>;
const Globe = ({ className }: { className?: string }) => <span className={className}>🌐</span>;
const FileText = ({ className }: { className?: string }) => <span className={className}>📄</span>;
const Play = ({ className }: { className?: string }) => <span className={className}>▶️</span>;
const Loader2 = ({ className }: { className?: string }) => <span className={`${className} animate-spin`}>⟳</span>;
const CheckCircle = ({ className }: { className?: string }) => <span className={className}>✅</span>;
const AlertCircle = ({ className }: { className?: string }) => <span className={className}>⚠️</span>;
const ArrowRight = ({ className }: { className?: string }) => <span className={className}>→</span>;
const RefreshCw = ({ className }: { className?: string }) => <span className={className}>🔄</span>;

// Dynamic imports to avoid SSR issues
const JsonDiff = React.lazy(() => import('@/components/JsonDiff'));
const APIJourney = React.lazy(() => import('@/components/modes/APIJourney'));
const AdhocCompare = React.lazy(() => import('@/components/modes/AdhocCompare'));
const PasteResponse = React.lazy(() => import('@/components/modes/PasteResponse'));

// Response interface
interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  durationMs: number;
  size: number;
  body: any;
  url: string;
}

// Main component state
interface DeltaProState {
  sourceResponse: APIResponse | null;
  targetResponse: APIResponse | null;
  loading: {
    source: boolean;
    target: boolean;
  };
  error: {
    source: string | null;
    target: string | null;
  };
  activeMode: 'api-explorer' | 'api-builder' | 'response-comparison';
}

export default function DeltaProPage() {
  const [state, setState] = useState<DeltaProState>({
    sourceResponse: null,
    targetResponse: null,
    loading: { source: false, target: false },
    error: { source: null, target: null },
    activeMode: 'api-explorer'
  });

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('deltapro-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('deltapro-state', JSON.stringify(state));
  }, [state]);

  // Handle API execution
  const handleAPIExecute = async (side: 'source' | 'target', request: any) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [side]: true },
      error: { ...prev.error, [side]: null }
    }));

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        [`${side}Response`]: data,
        loading: { ...prev.loading, [side]: false }
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: { 
          ...prev.error, 
          [side]: error instanceof Error ? error.message : 'Unknown error' 
        },
        loading: { ...prev.loading, [side]: false }
      }));
    }
  };

  // Handle response paste
  const handleResponsePaste = (side: 'source' | 'target', response: APIResponse) => {
    setState(prev => ({
      ...prev,
      [`${side}Response`]: response
    }));
  };

  // Clear responses
  const clearResponses = () => {
    setState(prev => ({
      ...prev,
      sourceResponse: null,
      targetResponse: null,
      error: { source: null, target: null }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  DeltaPro+
                </h1>
              </div>
              <Badge variant="outline" className="text-xs">
                Professional API Testing Suite
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Real-time
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                CORS-free
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Mode Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>API Testing Modes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={state.activeMode} 
              onValueChange={(value) => setState(prev => ({ 
                ...prev, 
                activeMode: value as any 
              }))}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="api-explorer" className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>API Explorer</span>
                </TabsTrigger>
                <TabsTrigger value="api-builder" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>API Builder</span>
                </TabsTrigger>
                <TabsTrigger value="response-comparison" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Response Comparison</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="api-explorer" className="mt-6">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                }>
                  <APIJourney
                    onAPIExecute={handleAPIExecute}
                    sourceResponse={state.sourceResponse}
                    targetResponse={state.targetResponse}
                    loading={state.loading}
                    error={state.error}
                  />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="api-builder" className="mt-6">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                }>
                  <AdhocCompare
                    onAPIExecute={handleAPIExecute}
                    sourceResponse={state.sourceResponse}
                    targetResponse={state.targetResponse}
                    loading={state.loading}
                    error={state.error}
                  />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="response-comparison" className="mt-6">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                }>
                  <PasteResponse
                    onResponsePaste={handleResponsePaste}
                    sourceResponse={state.sourceResponse}
                    targetResponse={state.targetResponse}
                  />
                </React.Suspense>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Response Comparison */}
        {(state.sourceResponse || state.targetResponse) && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ArrowRight className="w-5 h-5" />
                  <span>Response Comparison</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {state.sourceResponse ? 'Source: Ready' : 'Source: Empty'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {state.targetResponse ? 'Target: Ready' : 'Target: Empty'}
                  </Badge>
                  <button
                    onClick={clearResponses}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <React.Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              }>
                <JsonDiff
                  source={state.sourceResponse}
                  target={state.targetResponse}
                />
              </React.Suspense>
            </CardContent>
          </Card>
        )}

        {/* Status Summary */}
        {(state.sourceResponse || state.targetResponse) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.sourceResponse && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Source Response</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Status: {state.sourceResponse.status} {state.sourceResponse.statusText}</div>
                    <div>Duration: {state.sourceResponse.durationMs}ms</div>
                    <div>Size: {state.sourceResponse.size} bytes</div>
                    <div>URL: {state.sourceResponse.url}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {state.targetResponse && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Target Response</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Status: {state.targetResponse.status} {state.targetResponse.statusText}</div>
                    <div>Duration: {state.targetResponse.durationMs}ms</div>
                    <div>Size: {state.targetResponse.size} bytes</div>
                    <div>URL: {state.targetResponse.url}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
