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
  leftResponse: APIResponse | null;
  rightResponse: APIResponse | null;
  loading: {
    left: boolean;
    right: boolean;
  };
  error: {
    left: string | null;
    right: string | null;
  };
  activeMode: 'api-journey' | 'adhoc-compare' | 'paste-response';
}

export default function DeltaProPage() {
  const [state, setState] = useState<DeltaProState>({
    leftResponse: null,
    rightResponse: null,
    loading: { left: false, right: false },
    error: { left: null, right: null },
    activeMode: 'api-journey'
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
  const handleAPIExecute = async (side: 'left' | 'right', request: any) => {
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
  const handleResponsePaste = (side: 'left' | 'right', response: APIResponse) => {
    setState(prev => ({
      ...prev,
      [`${side}Response`]: response
    }));
  };

  // Clear responses
  const clearResponses = () => {
    setState(prev => ({
      ...prev,
      leftResponse: null,
      rightResponse: null,
      error: { left: null, right: null }
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
                <TabsTrigger value="api-journey" className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>API Journey</span>
                </TabsTrigger>
                <TabsTrigger value="adhoc-compare" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Ad-hoc Compare</span>
                </TabsTrigger>
                <TabsTrigger value="paste-response" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Paste Response</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="api-journey" className="mt-6">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                }>
                  <APIJourney
                    onAPIExecute={handleAPIExecute}
                    leftResponse={state.leftResponse}
                    rightResponse={state.rightResponse}
                    loading={state.loading}
                    error={state.error}
                  />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="adhoc-compare" className="mt-6">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                }>
                  <AdhocCompare
                    onAPIExecute={handleAPIExecute}
                    leftResponse={state.leftResponse}
                    rightResponse={state.rightResponse}
                    loading={state.loading}
                    error={state.error}
                  />
                </React.Suspense>
              </TabsContent>

              <TabsContent value="paste-response" className="mt-6">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                }>
                  <PasteResponse
                    onResponsePaste={handleResponsePaste}
                    leftResponse={state.leftResponse}
                    rightResponse={state.rightResponse}
                  />
                </React.Suspense>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Response Comparison */}
        {(state.leftResponse || state.rightResponse) && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ArrowRight className="w-5 h-5" />
                  <span>Response Comparison</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {state.leftResponse ? 'Left: Ready' : 'Left: Empty'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {state.rightResponse ? 'Right: Ready' : 'Right: Empty'}
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
                  left={state.leftResponse}
                  right={state.rightResponse}
                />
              </React.Suspense>
            </CardContent>
          </Card>
        )}

        {/* Status Summary */}
        {(state.leftResponse || state.rightResponse) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.leftResponse && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Left Response</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Status: {state.leftResponse.status} {state.leftResponse.statusText}</div>
                    <div>Duration: {state.leftResponse.durationMs}ms</div>
                    <div>Size: {state.leftResponse.size} bytes</div>
                    <div>URL: {state.leftResponse.url}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {state.rightResponse && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Right Response</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Status: {state.rightResponse.status} {state.rightResponse.statusText}</div>
                    <div>Duration: {state.rightResponse.durationMs}ms</div>
                    <div>Size: {state.rightResponse.size} bytes</div>
                    <div>URL: {state.rightResponse.url}</div>
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
