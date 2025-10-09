'use client';

import { CricbuzzLogo, DeltaLogo } from '@/components/delta-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlobalTour } from '@/components/ui/global-tour';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModeTips } from '@/components/ui/mode-tips';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TourProvider, useTour } from '@/contexts/tour-context';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle,
  Code,
  FileText,
  Globe,
  Lightbulb,
  RefreshCw,
  Settings
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Dynamic imports to avoid SSR issues
import dynamic from 'next/dynamic';

const JsonDiff = dynamic(() => import('@/components/JsonDiff'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const APIJourney = dynamic(() => import('@/components/modes/APIJourney'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const AdhocCompare = dynamic(() => import('@/components/modes/AdhocCompare'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const PasteResponse = dynamic(() => import('@/components/modes/PasteResponse'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

// Import shared types
import type { ApiResponse } from '@/types';

// Main component state
interface DeltaProState {
  sourceResponse: ApiResponse | null;
  targetResponse: ApiResponse | null;
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

function DeltaProContent() {
  const { setShowGlobalTour } = useTour();
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
      } catch (_error) {
        // Failed to load saved state - using defaults
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('deltapro-state', JSON.stringify(state));
  }, [state]);

  // Handle API execution
  const handleAPIExecute = async (side: 'source' | 'target', request: Record<string, unknown>) => {
    // Execute API request
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [side]: true },
      error: { ...prev.error, [side]: null }
    }));

    const startTime = Date.now();

    try {
      // SOLUTION: Environment-aware CORS proxy bypass
      const PROXY_URL = process.env.NODE_ENV === 'production'
        ? (process.env.NEXT_PUBLIC_API_PROXY_URL || 'https://your-proxy.yourdomain.com')
        : 'http://localhost:3002';

      const proxyResponse = await fetch(`${PROXY_URL}/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: request.url,
          method: request.method || 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            ...(request.headers as Record<string, string>)
          },
          body: request.body
        })
      });

      if (!proxyResponse.ok) {
        throw new Error(`Proxy error: ${proxyResponse.status}`);
      }

      const data = await proxyResponse.json();
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      const response = {
        status: data.status,
        statusText: data.statusText,
        headers: new Headers(data.headers),
        text: () => Promise.resolve(typeof data.body === 'string' ? data.body : JSON.stringify(data.body)),
        json: () => Promise.resolve(data.body),
        url: data.url,
        ok: data.status >= 200 && data.status < 300
      };

      // Response received successfully

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Data is already available from proxy response
      const finalData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        durationMs,
        size: typeof data.body === 'string' ? data.body.length : JSON.stringify(data.body).length,
        body: data.body,
        url: response.url
      };
      // Response data processed successfully

      setState(prev => ({
        ...prev,
        [`${side}Response`]: finalData,
        loading: { ...prev.loading, [side]: false }
      }));

    } catch (_error) {
      // Handle API execution error
      setState(prev => ({
        ...prev,
        error: { 
          ...prev.error, 
          [side]: _error instanceof Error ? _error.message : 'Unknown error' 
        },
        loading: { ...prev.loading, [side]: false }
      }));
    }
  };

  // Handle response paste
  const handleResponsePaste = (side: 'source' | 'target', response: ApiResponse) => {
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
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <motion.header 
        className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CricbuzzLogo size="xl" />
              <div className="h-6 w-px bg-border" />
              <DeltaLogo size="xl" animated />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold gradient-text">
                  DeltaPro+
                </h1>
                <p className="text-xs text-muted-foreground">Professional API Testing Suite</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ModeTips mode={state.activeMode} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGlobalTour(true)}
                className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Show Me How
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div 
        className="container mx-auto px-6 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="mb-6 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-cricbuzz-500" />
                <span>API Testing Modes</span>
                <Badge variant="outline" className="ml-auto">
                  <Code className="w-3 h-3 mr-1" />
                  Professional
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={state.activeMode} 
                onValueChange={(value) => setState(prev => ({ 
                  ...prev, 
                  activeMode: value as 'api-explorer' | 'api-builder' | 'response-comparison'
                }))}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger 
                    value="api-explorer" 
                    className="flex items-center space-x-2 data-[state=active]:bg-cricbuzz-500 data-[state=active]:text-white"
                  >
                    <Code className="w-4 h-4" />
                    <span>API Explorer</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="api-builder" 
                    className="flex items-center space-x-2 data-[state=active]:bg-delta-500 data-[state=active]:text-white"
                  >
                    <Globe className="w-4 h-4" />
                    <span>API Builder</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="response-comparison" 
                    className="flex items-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Response Comparison</span>
                  </TabsTrigger>
                  
                </TabsList>

                <TabsContent value="api-explorer" className="mt-6">
                  <React.Suspense fallback={
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" text="Loading API Explorer..." />
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
                      <LoadingSpinner size="lg" text="Loading API Builder..." />
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
                      <LoadingSpinner size="lg" text="Loading Response Comparison..." />
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
        </motion.div>

        {/* Response Comparison */}
        <AnimatePresence>
          {(state.sourceResponse || state.targetResponse) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="mb-6 card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-cricbuzz-500" />
                      <span>Response Comparison</span>
                      <Badge variant="outline" className="ml-2">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Live Analysis
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={state.sourceResponse ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {state.sourceResponse ? 'Source: Ready' : 'Source: Empty'}
                      </Badge>
                      <Badge 
                        variant={state.targetResponse ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {state.targetResponse ? 'Target: Ready' : 'Target: Empty'}
                      </Badge>
                      <button
                        onClick={clearResponses}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RefreshCw className="w-3 h-3 mr-1 inline" />
                        Clear All
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <React.Suspense fallback={
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" text="Analyzing responses..." />
                    </div>
                  }>
                    <JsonDiff
                      source={state.sourceResponse}
                      target={state.targetResponse}
                    />
                  </React.Suspense>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Summary */}
        <AnimatePresence>
          {(state.sourceResponse || state.targetResponse) && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {state.sourceResponse && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card className="card-hover border-cricbuzz-200 dark:border-cricbuzz-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <div className="w-3 h-3 bg-cricbuzz-500 rounded-full animate-pulse"></div>
                        <span>Source Response</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-mono">{state.sourceResponse.status} {state.sourceResponse.statusText}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-mono text-cricbuzz-500">{state.sourceResponse.durationMs}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-mono">{state.sourceResponse.size} bytes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">URL:</span>
                          <span className="font-mono text-xs truncate max-w-32">{state.sourceResponse.url}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {state.targetResponse && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="card-hover border-delta-200 dark:border-delta-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <div className="w-2 h-2 bg-delta-500 rounded-full animate-pulse"></div>
                        <span>Target Response</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-mono">{state.targetResponse.status} {state.targetResponse.statusText}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-mono text-delta-500">{state.targetResponse.durationMs}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-mono">{state.targetResponse.size} bytes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">URL:</span>
                          <span className="font-mono text-xs truncate max-w-32">{state.targetResponse.url}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Global Tour */}
      <GlobalTour />
    </div>
  );
}

export default function DeltaProPage() {
  return (
    <TourProvider>
      <DeltaProContent />
    </TourProvider>
  );
}
