import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import UniversalMonacoDiffViewer from '@/components/shared/UniversalMonacoDiffViewer';
import {
  Loader2,
  Play,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  GitCompare,
  Zap,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

interface ApiEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  endpoint: string;
  headers: Record<string, string>;
  response?: any;
  loading: boolean;
  error?: string;
  status?: number;
  responseTime?: number;
}

interface DiffItem {
  path: string;
  type: 'missing' | 'extra' | 'changed' | 'type-changed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  oldValue?: any;
  newValue?: any;
  description: string;
}

interface ComparisonResult {
  identical: boolean;
  differences: DiffItem[];
  summary: {
    totalFields: number;
    identicalFields: number;
    differentFields: number;
    missingFields: number;
    extraFields: number;
    criticalDiffs: number;
    highDiffs: number;
    mediumDiffs: number;
    lowDiffs: number;
  };
}

const STORAGE_KEY = 'deltapro-endpoint-configs';

// Load saved configurations from localStorage
const loadSavedConfigs = (): { left: Partial<ApiEndpoint>, right: Partial<ApiEndpoint> } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        left: parsed.left || {},
        right: parsed.right || {}
      };
    }
  } catch (error) {
    console.warn('Failed to load saved configurations:', error);
  }
  return { left: {}, right: {} };
};

// Save configurations to localStorage
const saveConfigs = (left: ApiEndpoint, right: ApiEndpoint) => {
  try {
    const configToSave = {
      left: {
        name: left.name,
        baseUrl: left.baseUrl,
        endpoint: left.endpoint,
        headers: left.headers
      },
      right: {
        name: right.name,
        baseUrl: right.baseUrl,
        endpoint: right.endpoint,
        headers: right.headers
      },
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
  } catch (error) {
    console.warn('Failed to save configurations:', error);
  }
};

export default function JsonDiffTool() {
  const { toast } = useToast();
  
  // Load saved configurations on component mount
  const savedConfigs = loadSavedConfigs();
  
  const [leftEndpoint, setLeftEndpoint] = useState<ApiEndpoint>({
    id: 'left',
    name: savedConfigs.left.name || 'API Endpoint A',
    baseUrl: savedConfigs.left.baseUrl || '',
    endpoint: savedConfigs.left.endpoint || '',
    headers: savedConfigs.left.headers || {},
    loading: false
  });
  
  const [rightEndpoint, setRightEndpoint] = useState<ApiEndpoint>({
    id: 'right',
    name: savedConfigs.right.name || 'API Endpoint B',
    baseUrl: savedConfigs.right.baseUrl || '',
    endpoint: savedConfigs.right.endpoint || '',
    headers: savedConfigs.right.headers || {},
    loading: false
  });

  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  // Auto-save configurations when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveConfigs(leftEndpoint, rightEndpoint);
    }, 1000); // Debounce saves by 1 second
    
    return () => clearTimeout(timeoutId);
  }, [leftEndpoint.name, leftEndpoint.baseUrl, leftEndpoint.endpoint, leftEndpoint.headers, 
      rightEndpoint.name, rightEndpoint.baseUrl, rightEndpoint.endpoint, rightEndpoint.headers]);

  // Add header to endpoint
  const addHeader = useCallback((endpointId: string, key: string, value: string) => {
    if (!key.trim() || !value.trim()) return;
    
    const updateEndpoint = endpointId === 'left' ? setLeftEndpoint : setRightEndpoint;
    updateEndpoint(prev => ({
      ...prev,
      headers: { ...prev.headers, [key]: value }
    }));
  }, []);

  // Remove header from endpoint
  const removeHeader = useCallback((endpointId: string, key: string) => {
    const updateEndpoint = endpointId === 'left' ? setLeftEndpoint : setRightEndpoint;
    updateEndpoint(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  }, []);

  // Fetch data from endpoint
  const fetchEndpoint = useCallback(async (endpoint: ApiEndpoint) => {
    if (!endpoint.baseUrl.trim() || !endpoint.endpoint.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both base URL and endpoint path.",
        variant: "destructive"
      });
      return;
    }

    const updateEndpoint = endpoint.id === 'left' ? setLeftEndpoint : setRightEndpoint;
    updateEndpoint(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const startTime = Date.now();
      const fullUrl = `${endpoint.baseUrl.replace(/\/$/, '')}/${endpoint.endpoint.replace(/^\//, '')}`;
      
      // Use backend proxy to avoid CORS issues
      const response = await fetch('/api/proxy-fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fullUrl,
          method: 'GET',
          headers: endpoint.headers
        })
      });

      const responseTime = Date.now() - startTime;
      const proxyResult = await response.json();
      
      if (!proxyResult.success) {
        throw new Error(proxyResult.error || 'Proxy request failed');
      }
      
      const data = proxyResult.data;

      updateEndpoint(prev => ({
        ...prev,
        loading: false,
        response: data,
        status: response.status,
        responseTime,
        error: undefined
      }));

      toast({
        title: "✅ Fetch Successful",
        description: `${endpoint.name} fetched in ${responseTime}ms`,
      });

    } catch (error) {
      updateEndpoint(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        response: undefined
      }));

      toast({
        title: "❌ Fetch Failed",
        description: `Failed to fetch ${endpoint.name}`,
        variant: "destructive"
      });
    }
  }, [toast]);

  // Deep equality check for objects and arrays
  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      // For arrays, check if all elements exist in both (order-insensitive)
      const sorted1 = [...obj1].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      const sorted2 = [...obj2].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      return sorted1.every((item, index) => deepEqual(item, sorted2[index]));
    }
    
    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      return keys1.every(key => keys2.includes(key) && deepEqual(obj1[key], obj2[key]));
    }
    
    return false;
  };

  // Calculate similarity score between two objects (0-1 scale)
  const calculateSimilarity = (obj1: any, obj2: any): number => {
    if (obj1 === obj2) return 1;
    if (typeof obj1 !== typeof obj2) return 0;
    
    if (typeof obj1 === 'object' && obj1 !== null && obj2 !== null) {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      const allKeys = new Set([...keys1, ...keys2]);
      
      if (allKeys.size === 0) return 1;
      
      let matchingKeys = 0;
      let totalSimilarity = 0;
      
      for (const key of allKeys) {
        if (key in obj1 && key in obj2) {
          matchingKeys++;
          // Special handling for ID fields - if IDs match, high similarity
          if (key.toLowerCase().includes('id') && obj1[key] === obj2[key]) {
            totalSimilarity += 0.8; // High weight for matching IDs
          } else {
            totalSimilarity += calculateSimilarity(obj1[key], obj2[key]) * 0.5;
          }
        }
      }
      
      // Bonus for having same keys
      const keyOverlap = matchingKeys / allKeys.size;
      return Math.min(1, (totalSimilarity + keyOverlap) / 2);
    }
    
    return obj1 === obj2 ? 1 : 0;
  };

  // Helper function to determine severity based on path and type
  const getSeverity = (path: string, type: string): 'low' | 'medium' | 'high' | 'critical' => {
    // Critical: Core API fields, IDs, status codes
    if (path.includes('id') || path.includes('status') || path.includes('error') || path.includes('code')) {
      return 'critical';
    }
    // High: Important business logic fields
    if (path.includes('data') || path.includes('result') || path.includes('response') || type === 'type-changed') {
      return 'high';
    }
    // Medium: Metadata, timestamps, counts
    if (path.includes('timestamp') || path.includes('count') || path.includes('total') || path.includes('meta')) {
      return 'medium';
    }
    // Low: Everything else
    return 'low';
  };

  // Advanced JSON comparison algorithm
  const compareJsonData = useCallback((obj1: any, obj2: any): ComparisonResult => {
    const differences: DiffItem[] = [];
    
    const compare = (a: any, b: any, path: string = '') => {
      if (typeof a !== typeof b) {
        const severity = getSeverity(path, 'type-changed');
        differences.push({
          path,
          type: 'type-changed',
          severity,
          oldValue: a,
          newValue: b,
          description: `Type changed from ${typeof a} to ${typeof b}`
        });
        return;
      }

      if (Array.isArray(a) && Array.isArray(b)) {
        // Intelligent order-insensitive array comparison
        const smartArrayCompare = (arr1: any[], arr2: any[]) => {
          const matched = new Set<number>();
          const unmatched1: any[] = [];
          const unmatched2: any[] = [];
          
          // First pass: exact matches (including order-insensitive object matching)
          for (let i = 0; i < arr1.length; i++) {
            let found = false;
            for (let j = 0; j < arr2.length; j++) {
              if (matched.has(j)) continue;
              
              if (deepEqual(arr1[i], arr2[j])) {
                matched.add(j);
                found = true;
                break;
              }
            }
            if (!found) {
              unmatched1.push({ item: arr1[i], index: i });
            }
          }
          
          // Collect unmatched items from second array
          for (let j = 0; j < arr2.length; j++) {
            if (!matched.has(j)) {
              unmatched2.push({ item: arr2[j], index: j });
            }
          }
          
          // Second pass: intelligent partial matching for objects
          const stillUnmatched1: any[] = [];
          const stillUnmatched2: any[] = [];
          const partialMatched = new Set<number>();
          
          for (const um1 of unmatched1) {
            let bestMatch = null;
            let bestScore = 0;
            let bestIndex = -1;
            
            for (let k = 0; k < unmatched2.length; k++) {
              if (partialMatched.has(k)) continue;
              
              const um2 = unmatched2[k];
              const score = calculateSimilarity(um1.item, um2.item);
              
              if (score > 0.7 && score > bestScore) { // 70% similarity threshold
                bestMatch = um2;
                bestScore = score;
                bestIndex = k;
              }
            }
            
            if (bestMatch && bestScore > 0.7) {
              partialMatched.add(bestIndex);
              // Compare the similar objects to find specific differences
              compare(um1.item, bestMatch.item, `${path}[${um1.index}]`);
            } else {
              stillUnmatched1.push(um1);
            }
          }
          
          // Collect still unmatched from second array
          for (let k = 0; k < unmatched2.length; k++) {
            if (!partialMatched.has(k)) {
              stillUnmatched2.push(unmatched2[k]);
            }
          }
          
          // Report truly missing/extra items
          for (const um1 of stillUnmatched1) {
            const severity = getSeverity(path, 'missing');
            differences.push({
              path: `${path}[${um1.index}]`,
              type: 'missing',
              severity,
              oldValue: um1.item,
              newValue: undefined,
              description: `Array item not found in right object (no similar match)`
            });
          }
          
          for (const um2 of stillUnmatched2) {
            const severity = getSeverity(path, 'extra');
            differences.push({
              path: `${path}[${um2.index}]`,
              type: 'extra',
              severity,
              oldValue: undefined,
              newValue: um2.item,
              description: `Extra array item in right object (no similar match)`
            });
          }
        };
        
        smartArrayCompare(a, b);
        return;
      }

      if (typeof a === 'object' && a !== null && b !== null) {
        const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
        
        for (const key of allKeys) {
          const newPath = path ? `${path}.${key}` : key;
          
          if (!(key in a)) {
            const severity = getSeverity(newPath, 'extra');
            differences.push({
              path: newPath,
              type: 'extra',
              severity,
              oldValue: undefined,
              newValue: b[key],
              description: `Property '${key}' exists only in right object`
            });
          } else if (!(key in b)) {
            const severity = getSeverity(newPath, 'missing');
            differences.push({
              path: newPath,
              type: 'missing',
              severity,
              oldValue: a[key],
              newValue: undefined,
              description: `Property '${key}' exists only in left object`
            });
          } else {
            compare(a[key], b[key], newPath);
          }
        }
        return;
      }

      if (a !== b) {
        const severity = getSeverity(path, 'changed');
        differences.push({
          path,
          type: 'changed',
          severity,
          oldValue: a,
          newValue: b,
          description: `Value changed from '${a}' to '${b}'`
        });
      }
    };

    compare(obj1, obj2);

    // Calculate summary statistics
    const totalFields = countFields(obj1) + countFields(obj2);
    const differentFields = differences.filter(d => d.type === 'changed' || d.type === 'type-changed').length;
    const missingFields = differences.filter(d => d.type === 'missing').length;
    const extraFields = differences.filter(d => d.type === 'extra').length;
    const identicalFields = Math.max(0, totalFields - differences.length);
    
    // Calculate severity counts
    const criticalDiffs = differences.filter(d => d.severity === 'critical').length;
    const highDiffs = differences.filter(d => d.severity === 'high').length;
    const mediumDiffs = differences.filter(d => d.severity === 'medium').length;
    const lowDiffs = differences.filter(d => d.severity === 'low').length;

    return {
      identical: differences.length === 0,
      differences,
      summary: {
        totalFields,
        identicalFields,
        differentFields,
        missingFields,
        extraFields,
        criticalDiffs,
        highDiffs,
        mediumDiffs,
        lowDiffs
      }
    };
  }, []);

  // Helper function to count fields in an object
  const countFields = (obj: any): number => {
    if (obj === null || obj === undefined) return 0;
    if (typeof obj !== 'object') return 1;
    if (Array.isArray(obj)) return obj.reduce((sum, item) => sum + countFields(item), 0);
    return Object.keys(obj).reduce((sum, key) => sum + countFields(obj[key]), 0);
  };

  // Perform comparison
  const performComparison = useCallback(async () => {
    if (!leftEndpoint.response || !rightEndpoint.response) {
      toast({
        title: "Missing Data",
        description: "Please fetch both endpoints before comparing.",
        variant: "destructive"
      });
      return;
    }

    setIsComparing(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = compareJsonData(leftEndpoint.response, rightEndpoint.response);
    setComparisonResult(result);
    setIsComparing(false);

    toast({
      title: result.identical ? "🎉 Identical!" : "🔍 Differences Found",
      description: result.identical 
        ? "Both API responses are identical!" 
        : `Found ${result.differences.length} differences (${result.summary.criticalDiffs} critical, ${result.summary.highDiffs} high, ${result.summary.mediumDiffs} medium, ${result.summary.lowDiffs} low)`,
    });
  }, [leftEndpoint.response, rightEndpoint.response, compareJsonData, toast]);

  // Clear endpoint data
  const clearEndpoint = useCallback((endpointId: string) => {
    const updateEndpoint = endpointId === 'left' ? setLeftEndpoint : setRightEndpoint;
    updateEndpoint(prev => ({
      ...prev,
      response: undefined,
      error: undefined,
      status: undefined,
      responseTime: undefined
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <GitCompare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DeltaPro+
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional API comparison tool with advanced semantic analysis, intelligent order-insensitive matching, and world-class diff visualization.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Eye className="w-3 h-3 mr-1" />
              Secure
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <RefreshCw className="w-3 h-3 mr-1" />
              No Storage
            </Badge>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Clear all configurations
                localStorage.removeItem(STORAGE_KEY);
                setLeftEndpoint({
                  id: 'left',
                  name: 'API Endpoint A',
                  baseUrl: '',
                  endpoint: '',
                  headers: {},
                  loading: false
                });
                setRightEndpoint({
                  id: 'right',
                  name: 'API Endpoint B',
                  baseUrl: '',
                  endpoint: '',
                  headers: {},
                  loading: false
                });
                setComparisonResult(null);
                toast({
                  title: "🧹 Configurations Cleared",
                  description: "All endpoint configurations have been reset",
                });
              }}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Configs
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showInstructions ? 'Hide Guide' : 'Show Guide'}
            </Button>
          </div>
        </motion.div>

        {/* Instructions Panel */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      Quick Start Guide
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInstructions(false)}
                    >
                      <EyeOff className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-blue-600 dark:text-blue-400">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-semibold">1. Configure Endpoints</h4>
                      <p>Set base URLs, endpoints, and custom headers for both APIs you want to compare.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">2. Fetch Data</h4>
                      <p>Click "Fetch" for each endpoint sequentially. Review responses before comparing.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">3. Compare & Analyze</h4>
                      <p>Use our advanced diff viewer to see semantic differences, not just text changes.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Endpoint */}
          <EndpointPanel
            endpoint={leftEndpoint}
            onUpdate={setLeftEndpoint}
            onFetch={() => fetchEndpoint(leftEndpoint)}
            onClear={() => clearEndpoint('left')}
            onAddHeader={addHeader}
            onRemoveHeader={removeHeader}
            side="left"
          />

          {/* Right Endpoint */}
          <EndpointPanel
            endpoint={rightEndpoint}
            onUpdate={setRightEndpoint}
            onFetch={() => fetchEndpoint(rightEndpoint)}
            onClear={() => clearEndpoint('right')}
            onAddHeader={addHeader}
            onRemoveHeader={removeHeader}
            side="right"
          />
        </div>

        {/* Comparison Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button
                  onClick={performComparison}
                  disabled={!leftEndpoint.response || !rightEndpoint.response || isComparing}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  {isComparing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <GitCompare className="w-5 h-5 mr-2" />
                      Compare APIs
                    </>
                  )}
                </Button>
                
                {comparisonResult && (
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      {comparisonResult.identical ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      )}
                      <span className="font-medium">
                        {comparisonResult.identical ? 'Identical' : 'Differences Found'}
                      </span>
                    </div>
                    <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
                      <span>✅ {comparisonResult.summary.identicalFields} identical</span>
                      <span>⚠️ {comparisonResult.summary.differentFields} different</span>
                      <span>❌ {comparisonResult.summary.missingFields} missing</span>
                      <span>➕ {comparisonResult.summary.extraFields} extra</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Diff Viewer */}
        {comparisonResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UniversalMonacoDiffViewer
              leftData={leftEndpoint.response}
              rightData={rightEndpoint.response}
              comparisonResult={comparisonResult}
              leftTitle={leftEndpoint.name}
              rightTitle={rightEndpoint.name}
              modalMode={false}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Endpoint Panel Component
interface EndpointPanelProps {
  endpoint: ApiEndpoint;
  onUpdate: (endpoint: ApiEndpoint) => void;
  onFetch: () => void;
  onClear: () => void;
  onAddHeader: (endpointId: string, key: string, value: string) => void;
  onRemoveHeader: (endpointId: string, key: string) => void;
  side: 'left' | 'right';
}

function EndpointPanel({ 
  endpoint, 
  onUpdate, 
  onFetch, 
  onClear, 
  onAddHeader, 
  onRemoveHeader, 
  side 
}: EndpointPanelProps) {
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  const handleAddHeader = () => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      onAddHeader(endpoint.id, newHeaderKey.trim(), newHeaderValue.trim());
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${side === 'left' ? 'bg-blue-500' : 'bg-purple-500'}`} />
              <Input
                value={endpoint.name}
                onChange={(e) => onUpdate({ ...endpoint, name: e.target.value })}
                className="font-semibold border-none p-0 h-auto bg-transparent"
                placeholder="API Name"
              />
            </div>
            {endpoint.response && (
              <Badge variant={endpoint.status === 200 ? 'default' : 'destructive'}>
                {endpoint.status} • {endpoint.responseTime}ms
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* URL Configuration */}
          <div className="space-y-3">
            <div>
              <Label htmlFor={`base-url-${side}`}>Base URL</Label>
              <Input
                id={`base-url-${side}`}
                value={endpoint.baseUrl}
                onChange={(e) => onUpdate({ ...endpoint, baseUrl: e.target.value })}
                placeholder="https://api.example.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor={`endpoint-${side}`}>Endpoint</Label>
              <Input
                id={`endpoint-${side}`}
                value={endpoint.endpoint}
                onChange={(e) => onUpdate({ ...endpoint, endpoint: e.target.value })}
                placeholder="/v1/users"
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Headers Section */}
          <div className="space-y-3">
            <Label>Headers</Label>
            
            {/* Existing Headers */}
            <div className="space-y-2">
              {Object.entries(endpoint.headers).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 p-2 bg-muted rounded">
                  <span className="font-mono text-sm flex-1">{key}: {value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveHeader(endpoint.id, key)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Header */}
            <div className="flex space-x-2">
              <Input
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                placeholder="Header key"
                className="flex-1"
              />
              <Input
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                placeholder="Header value"
                className="flex-1"
              />
              <Button onClick={handleAddHeader} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={onFetch}
              disabled={endpoint.loading}
              className="flex-1"
            >
              {endpoint.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Fetch
                </>
              )}
            </Button>
            
            {endpoint.response && (
              <Button onClick={onClear} variant="outline">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Status Display */}
          {endpoint.error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{endpoint.error}</p>
            </div>
          )}

          {endpoint.response && (
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Response Ready</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {JSON.stringify(endpoint.response).length} chars
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
