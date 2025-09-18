'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { DeltaLogo, CricbuzzLogo } from '@/components/delta-logo';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import dynamic from 'next/dynamic';
import { 
  Zap, 
  Globe, 
  FileText, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  Code,
  Settings,
  BarChart3
} from 'lucide-react';

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
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  CORS-free
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Analytics
                </Badge>
              </div>
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
                  activeMode: value as any 
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
                        <div className="w-2 h-2 bg-cricbuzz-500 rounded-full animate-pulse"></div>
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
    </div>
  );
}
