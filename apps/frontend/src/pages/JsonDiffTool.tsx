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
import { indexedDBService } from '@/services/indexedDB';
// Types for the working comparison logic
interface APIConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
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
  Info,
  Database
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

// Types now imported from unified diff engine

const STORAGE_KEY = 'deltapro-endpoint-configs';
const COMPARISON_STORAGE_KEY = 'deltapro-comparison-data';

  // Load saved configurations from localStorage
  const loadLocalStorageConfigs = (): { left: Partial<ApiEndpoint>, right: Partial<ApiEndpoint> } => {
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

  // Load complete comparison data including responses and results
  const loadCompleteComparisonData = () => {
    try {
      const saved = localStorage.getItem(COMPARISON_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load comparison data:', error);
    }
    return null;
  };

  // Save complete comparison data
  const saveCompleteComparisonData = (data: any) => {
    try {
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save comparison data:', error);
    }
  };



export default function JsonDiffTool() {
  const { toast } = useToast();
  
  // Load saved configurations on component mount
  const savedConfigs = loadLocalStorageConfigs();
  
  const [leftEndpoint, setLeftEndpoint] = useState<ApiEndpoint>({
    id: 'left',
    name: 'Live API (Current)',
    baseUrl: savedConfigs.left.baseUrl || '',
    endpoint: savedConfigs.left.endpoint || '',
    headers: savedConfigs.left.headers || {},
    loading: false
  });
  
  const [rightEndpoint, setRightEndpoint] = useState<ApiEndpoint>({
    id: 'right',
    name: 'New API (Updated)',
    baseUrl: savedConfigs.right.baseUrl || '',
    endpoint: savedConfigs.right.endpoint || '',
    headers: savedConfigs.right.headers || {},
    loading: false
  });

  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(() => {
    // Check if user has seen the guide before in this session
    const hasSeenGuide = sessionStorage.getItem('deltapro-guide-hidden');
    return hasSeenGuide !== 'true';
  });
  const [isComparing, setIsComparing] = useState(false);
  const [orderSensitive, setOrderSensitive] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showPlatformHeaders, setShowPlatformHeaders] = useState(false);
  const [indexedDBConfigs, setIndexedDBConfigs] = useState<APIConfig[]>([]);

  // Load complete comparison data on component mount
  useEffect(() => {
    const savedData = loadCompleteComparisonData();
    if (savedData) {
      if (savedData.left && savedData.left.response) {
        setLeftEndpoint(prev => ({ ...prev, ...savedData.left }));
      }
      if (savedData.right && savedData.right.response) {
        setRightEndpoint(prev => ({ ...prev, ...savedData.right }));
      }
      if (savedData.comparisonResult) {
        setComparisonResult(savedData.comparisonResult);
      }
      if (savedData.orderSensitive !== undefined) {
        setOrderSensitive(savedData.orderSensitive);
      }
    }
  }, []);

  // Auto-save complete comparison data when it changes (localStorage only - not DeltaDB)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Save complete comparison data to localStorage only
        const completeData = {
          left: {
            baseUrl: leftEndpoint.baseUrl,
            endpoint: leftEndpoint.endpoint,
            headers: leftEndpoint.headers,
            name: leftEndpoint.name,
            response: leftEndpoint.response,
            status: leftEndpoint.status,
            responseTime: leftEndpoint.responseTime
          },
          right: {
            baseUrl: rightEndpoint.baseUrl,
            endpoint: rightEndpoint.endpoint,
            headers: rightEndpoint.headers,
            name: rightEndpoint.name,
            response: rightEndpoint.response,
            status: rightEndpoint.status,
            responseTime: rightEndpoint.responseTime
          },
          comparisonResult,
          orderSensitive
        };
        
        saveCompleteComparisonData(completeData);
        console.log('💾 [PERSISTENCE] Complete comparison data saved to localStorage');
      } catch (error) {
        console.error('❌ [PERSISTENCE] Error saving comparison data:', error);
      }
    }, 1000); // Save every 1 second
    
    return () => clearTimeout(timeoutId);
  }, [leftEndpoint, rightEndpoint, comparisonResult, orderSensitive]);

  // Auto-save configurations when they change (every 2 seconds)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        console.log('🔄 [AUTO-SAVE] Starting auto-save...', {
          left: { baseUrl: leftEndpoint.baseUrl, endpoint: leftEndpoint.endpoint, hasData: !!(leftEndpoint.baseUrl && leftEndpoint.endpoint) },
          right: { baseUrl: rightEndpoint.baseUrl, endpoint: rightEndpoint.endpoint, hasData: !!(rightEndpoint.baseUrl && rightEndpoint.endpoint) }
        });

        let savedCount = 0;

        // Auto-save both endpoints to IndexedDB
        if (leftEndpoint.baseUrl && leftEndpoint.endpoint) {
          const leftConfig: Omit<APIConfig, 'id' | 'createdAt' | 'updatedAt'> = {
            name: leftEndpoint.name || 'Live API',
            url: `${leftEndpoint.baseUrl}/${leftEndpoint.endpoint}`,
            method: 'GET',
            headers: leftEndpoint.headers,
            description: `Auto-saved: ${leftEndpoint.name || 'Live API'} configuration`,
            tags: ['auto-saved', 'live-api', 'production']
          };
          await indexedDBService.addAPIConfig(leftConfig);
          console.log('✅ [AUTO-SAVE] Left endpoint saved successfully');
          savedCount++;
        }

        if (rightEndpoint.baseUrl && rightEndpoint.endpoint) {
          const rightConfig: Omit<APIConfig, 'id' | 'createdAt' | 'updatedAt'> = {
            name: rightEndpoint.name || 'New API',
            url: `${rightEndpoint.baseUrl}/${rightEndpoint.endpoint}`,
            method: 'GET',
            headers: rightEndpoint.headers,
            description: `Auto-saved: ${rightEndpoint.name || 'New API'} configuration`,
            tags: ['auto-saved', 'new-api', 'staging']
          };
          await indexedDBService.addAPIConfig(rightConfig);
          console.log('✅ [AUTO-SAVE] Right endpoint saved successfully');
          savedCount++;
        }

        if (savedCount > 0) {
          console.log(`🎉 [AUTO-SAVE] Successfully saved ${savedCount} configurations`);
          // Refresh the list of saved configs
          await loadSavedConfigs();
        } else {
          console.log('ℹ️ [AUTO-SAVE] No configurations to save (missing baseUrl or endpoint)');
        }
      } catch (error) {
        console.error('❌ [AUTO-SAVE] Error during auto-save:', error);
      }
    }, 2000); // Auto-save every 2 seconds
    
    return () => clearTimeout(timeoutId);
  }, [leftEndpoint.name, leftEndpoint.baseUrl, leftEndpoint.endpoint, leftEndpoint.headers, 
      rightEndpoint.name, rightEndpoint.baseUrl, rightEndpoint.endpoint, rightEndpoint.headers]);

  // Handle guide visibility with session persistence
  const handleHideGuide = useCallback(() => {
    setShowInstructions(false);
    sessionStorage.setItem('deltapro-guide-hidden', 'true');
  }, []);

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
      
      // Debug logging for URL construction and headers
      console.log('🔍 [DEBUG] Fetching API:', {
        baseUrl: endpoint.baseUrl,
        endpoint: endpoint.endpoint,
        fullUrl: fullUrl,
        headers: endpoint.headers,
        platform: endpoint.endpoint.split('/')[1] || 'unknown'
      });
      
      // Use backend proxy to avoid CORS issues
              const response = await fetch('/api/proxy', {
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
      
      // Debug logging for response
      console.log('✅ [DEBUG] API Response:', {
        success: proxyResult.success,
        status: response.status,
        responseTime: responseTime,
        dataSize: JSON.stringify(proxyResult.data).length,
        error: proxyResult.error
      });
      
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

  // Platform-specific default headers that users can load instantly
  const platformHeaders = {
    ios: {
      'accept': 'application/json',
      'cb-loc': 'IN',
      'cb-tz': '+0530',
      'cb-appver': '15.8',
      'user-agent': 'CricbuzzMobile/15.8 (com.sports.iCric; build:198; iOS 17.7.1) Alamofire/4.9.1'
    },
    android: {
      'accept': 'application/json',
      'cb-loc': 'IN',
      'cb-appver': '6.23.05',
      'cb-src': 'playstore',
      'user-agent': 'okhttp/4.12.0'
    },
    mobile: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'cb-loc': 'IN',
      'cb-tz': '+0530',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    },
    web: {
      'accept': 'application/json, text/plain, */*',
      'cb-loc': 'IN',
      'cb-tz': '+0530',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    }
  };

  // Load platform-specific headers
  const loadPlatformHeaders = useCallback((platform: keyof typeof platformHeaders, endpointId: 'left' | 'right') => {
    const headers = platformHeaders[platform];
    const updateEndpoint = endpointId === 'left' ? setLeftEndpoint : setRightEndpoint;
    
    updateEndpoint(prev => ({
      ...prev,
      headers: { ...prev.headers, ...headers }
    }));

    toast({
      title: "✅ Headers Loaded",
      description: `${platform.toUpperCase()} headers loaded for ${endpointId === 'left' ? 'Live API' : 'New API'}`,
    });
  }, [toast]);

  const loadSavedConfigs = useCallback(async () => {
    try {
      const configs = await indexedDBService.getAPIConfigs();
      setIndexedDBConfigs(configs);
    } catch (error) {
      console.error('Failed to load saved configs:', error);
    }
  }, []);

  const handleLoadConfig = useCallback(async (config: APIConfig) => {
    try {
      const urlParts = config.url.split('/');
      const baseUrl = urlParts.slice(0, -1).join('/');
      const endpoint = urlParts[urlParts.length - 1];

      if (config.name.includes('Live API')) {
        setLeftEndpoint(prev => ({
          ...prev,
          baseUrl,
          endpoint,
          headers: config.headers
        }));
      } else if (config.name.includes('New API')) {
        setRightEndpoint(prev => ({
          ...prev,
          baseUrl,
          endpoint,
          headers: config.headers
        }));
      }

      setShowLoadModal(false);
      toast({
        title: "✅ Configuration Loaded",
        description: `Loaded ${config.name}`,
      });
    } catch (error) {
      toast({
        title: "❌ Load Failed",
        description: "Failed to load configuration",
        variant: "destructive"
      });
    }
  }, []);

  // Load saved configs on component mount
  useEffect(() => {
    loadSavedConfigs();
  }, [loadSavedConfigs]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showPlatformHeaders) {
          setShowPlatformHeaders(false);
        }
        if (showLoadModal) {
          setShowLoadModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showPlatformHeaders, showLoadModal]);

  // Load configuration from URL parameter (e.g., /deltapro?load=config-id)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const configId = urlParams.get('load');
    
    if (configId) {
      loadConfigById(configId);
    }
  }, []);

  const loadConfigById = async (configId: string) => {
    try {
      const configs = await indexedDBService.getAPIConfigs();
      const config = configs.find(c => c.id === configId);
      if (config) {
        const urlParts = config.url.split('/');
        const baseUrl = urlParts.slice(0, -1).join('/');
        const endpoint = urlParts[urlParts.length - 1];

        if (config.name.includes('Live API') || config.tags.includes('live-api')) {
          setLeftEndpoint(prev => ({
            ...prev,
            baseUrl,
            endpoint,
            headers: config.headers
          }));
        } else if (config.name.includes('New API') || config.tags.includes('new-api')) {
          setRightEndpoint(prev => ({
            ...prev,
            baseUrl,
            endpoint,
            headers: rightEndpoint.headers
          }));
        }

        toast({
          title: "✅ Configuration Loaded",
          description: `Loaded ${config.name} from Dashboard`,
        });
      }
    } catch (error) {
      console.error('Failed to load config by ID:', error);
    }
  };

  // Manual save function as fallback
  const handleManualSave = async () => {
    try {
      let savedCount = 0;

      if (leftEndpoint.baseUrl && leftEndpoint.endpoint) {
        const leftConfig: Omit<APIConfig, 'id' | 'createdAt' | 'updatedAt'> = {
          name: leftEndpoint.name || 'Live API',
          url: `${leftEndpoint.baseUrl}/${leftEndpoint.endpoint}`,
          method: 'GET',
          headers: leftEndpoint.headers,
          description: `Manual save: ${leftEndpoint.name || 'Live API'} configuration`,
          tags: ['manual-save', 'live-api', 'production']
        };
        await indexedDBService.addAPIConfig(leftConfig);
        console.log('✅ [MANUAL-SAVE] Left endpoint saved successfully');
        savedCount++;
      }

      if (rightEndpoint.baseUrl && rightEndpoint.endpoint) {
        const rightConfig: Omit<APIConfig, 'id' | 'createdAt' | 'updatedAt'> = {
          name: rightEndpoint.name || 'New API',
          url: `${rightEndpoint.baseUrl}/${rightEndpoint.endpoint}`,
          method: 'GET',
          headers: rightEndpoint.headers,
          description: `Manual save: ${rightEndpoint.name || 'New API'} configuration`,
          tags: ['manual-save', 'new-api', 'staging']
        };
        await indexedDBService.addAPIConfig(rightConfig);
        console.log('✅ [MANUAL-SAVE] Right endpoint saved successfully');
        savedCount++;
      }

      if (savedCount > 0) {
        toast({
          title: "✅ Manual Save Successful",
          description: `Saved ${savedCount} configuration(s)`,
        });
        await loadSavedConfigs();
      } else {
        toast({
          title: "⚠️ No Configurations to Save",
          description: "Please enter both base URL and endpoint for at least one API",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ [MANUAL-SAVE] Error:', error);
      toast({
        title: "❌ Manual Save Failed",
        description: "Failed to save configurations",
        variant: "destructive"
      });
    }
  };

  // Deep equality check for objects (order-insensitive)
  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      // For arrays, we need order-insensitive comparison
      const arr2Copy = [...obj2];
      for (const item1 of obj1) {
        const index = arr2Copy.findIndex(item2 => deepEqual(item1, item2));
        if (index === -1) return false;
        arr2Copy.splice(index, 1);
      }
      return arr2Copy.length === 0;
    }
    
    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      return keys1.every(key => keys2.includes(key) && deepEqual(obj1[key], obj2[key]));
    }
    
    return false;
  };

  // Generate a unique identifier for an object to enable intelligent matching
  const generateObjectId = (obj: any, path: string = ''): string => {
    if (obj === null || obj === undefined) return 'null';
    if (typeof obj !== 'object') return String(obj);
    
    if (Array.isArray(obj)) {
      return `array_${obj.length}_${obj.map((item, i) => generateObjectId(item, `${path}[${i}]`)).join('_')}`;
    }
    
    // For objects, create ID based on key-value pairs (sorted for consistency)
    const keys = Object.keys(obj).sort();
    const idParts = keys.map(key => {
      const value = obj[key];
      // Use common identifier fields for better matching
      if (key.toLowerCase().includes('id') || key === 'name' || key === 'key' || key === 'uuid') {
        return `${key}:${value}`;
      }
      return `${key}:${typeof value === 'object' ? 'obj' : String(value).substring(0, 10)}`;
    });
    return idParts.join('|');
  };

  // Find best match for an object in an array based on content similarity
  const findBestMatch = (target: any, candidates: any[], usedIndices: Set<number>): { match: any; index: number; similarity: number } | null => {
    let bestMatch = null;
    let bestSimilarity = 0;
    let bestIndex = -1;
    
    for (let i = 0; i < candidates.length; i++) {
      if (usedIndices.has(i)) continue;
      
      const candidate = candidates[i];
      
      // First check for exact match
      if (deepEqual(target, candidate)) {
        return { match: candidate, index: i, similarity: 1.0 };
      }
      
      // Then check for high similarity
      const similarity = calculateSimilarity(target, candidate);
      if (similarity > bestSimilarity && similarity > 0.7) { // 70% threshold for intelligent matching
        bestMatch = candidate;
        bestSimilarity = similarity;
        bestIndex = i;
      }
    }
    
    return bestMatch ? { match: bestMatch, index: bestIndex, similarity: bestSimilarity } : null;
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
  const compareJsonData = useCallback((obj1: any, obj2: any, isOrderSensitive: boolean = false): ComparisonResult => {
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
        if (isOrderSensitive) {
          // Order-sensitive array comparison (strict positional matching)
          const maxLength = Math.max(a.length, b.length);
          for (let i = 0; i < maxLength; i++) {
            if (i >= a.length) {
              const severity = getSeverity(`${path}[${i}]`, 'extra');
              differences.push({
                path: `${path}[${i}]`,
                type: 'extra',
                severity,
                oldValue: undefined,
                newValue: b[i],
                description: `Extra array item at position ${i} (order-sensitive)`
              });
            } else if (i >= b.length) {
              const severity = getSeverity(`${path}[${i}]`, 'missing');
              differences.push({
                path: `${path}[${i}]`,
                type: 'missing',
                severity,
                oldValue: a[i],
                newValue: undefined,
                description: `Missing array item at position ${i} (order-sensitive)`
              });
            } else {
              compare(a[i], b[i], `${path}[${i}]`);
            }
          }
        } else {
          // TRULY INTELLIGENT ORDER-INSENSITIVE ARRAY COMPARISON
          // This is the core algorithm that makes our product world-class
          
          const usedIndicesInB = new Set<number>();
          const unmatchedFromA: Array<{item: any, originalIndex: number}> = [];
          
          // Phase 1: Find exact matches and high-similarity matches
          for (let i = 0; i < a.length; i++) {
            const itemA = a[i];
            const bestMatch = findBestMatch(itemA, b, usedIndicesInB);
            
            if (bestMatch && bestMatch.similarity >= 0.95) {
              // Exact or near-exact match found
              usedIndicesInB.add(bestMatch.index);
              
              if (bestMatch.similarity < 1.0) {
                // Items are similar but not identical - compare them for detailed differences
                compare(itemA, bestMatch.match, `${path}[${i}]`);
              }
              // If similarity is 1.0, items are identical - no differences to report
            } else if (bestMatch && bestMatch.similarity >= 0.7) {
              // Partial match - these are likely the same logical item with some changes
              usedIndicesInB.add(bestMatch.index);
              compare(itemA, bestMatch.match, `${path}[${i}]`);
            } else {
              // No good match found - this item might be missing from B
              unmatchedFromA.push({ item: itemA, originalIndex: i });
            }
          }
          
          // Phase 2: Identify truly missing items (from A but not in B)
          for (const unmatched of unmatchedFromA) {
            const severity = getSeverity(`${path}[${unmatched.originalIndex}]`, 'missing');
            differences.push({
              path: `${path}[${unmatched.originalIndex}]`,
              type: 'missing',
              severity,
              oldValue: unmatched.item,
              newValue: undefined,
              description: `Item from Live API not found in New API (no similar match found)`
            });
          }
          
          // Phase 3: Identify truly extra items (in B but not matched with A)
          for (let j = 0; j < b.length; j++) {
            if (!usedIndicesInB.has(j)) {
              const severity = getSeverity(`${path}[${j}]`, 'extra');
              differences.push({
                path: `${path}[${j}]`,
                type: 'extra',
                severity,
                oldValue: undefined,
                newValue: b[j],
                description: `New item in New API not found in Live API`
              });
            }
          }
        }
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
    
    const result = compareJsonData(leftEndpoint.response, rightEndpoint.response, orderSensitive);
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
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-6 pt-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
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
              <Database className="w-3 h-3 mr-1" />
              Auto-Save
            </Badge>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-3">
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
              onClick={() => {
                if (showInstructions) {
                  handleHideGuide();
                } else {
                  setShowInstructions(true);
                  sessionStorage.removeItem('deltapro-guide-hidden');
                }
              }}
            >
              {showInstructions ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showInstructions ? 'Hide Guide' : 'Show Guide'}
            </Button>
            
            <Button
              variant={orderSensitive ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderSensitive(!orderSensitive)}
              className={orderSensitive ? "bg-orange-600 hover:bg-orange-700 text-white" : "border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {orderSensitive ? 'Order Sensitive' : 'Order Insensitive'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLoadModal(true)}
              className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
            >
              <Eye className="w-4 h-4 mr-2" />
              Load Config
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlatformHeaders(true)}
              className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950"
            >
              <Zap className="w-4 h-4 mr-2" />
              Platform Headers
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
            >
              <Plus className="w-4 h-4 mr-2" />
              Manual Save
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
              className="mb-4"
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
                      onClick={handleHideGuide}
                    >
                      <EyeOff className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-blue-600 dark:text-blue-400">
                  <div className="space-y-4">
                    {/* Professional Workflow Guide */}
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                        🎯 Professional API Change Tracking Workflow
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-green-700 dark:text-green-300">Live API (Current)</span>
                          </div>
                          <p className="text-blue-700 dark:text-blue-300 ml-5">Configure your production/current API endpoint that's currently live and serving users.</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="font-medium text-orange-700 dark:text-orange-300">New API (Updated)</span>
                          </div>
                          <p className="text-blue-700 dark:text-blue-300 ml-5">Configure your updated/new API version that you want to test against the current version.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Step-by-step Guide */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">1</span>
                          Configure Both APIs
                        </h4>
                        <p>Set base URLs, endpoints, and custom headers. Use the same endpoint path for both to compare versions.</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">2</span>
                          Fetch & Review
                        </h4>
                        <p>Fetch both endpoints and review responses. Ensure both are successful before comparing.</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">3</span>
                          Advanced Analysis
                        </h4>
                        <p>Use our world-class semantic diff analysis to identify breaking changes and improvements.</p>
                      </div>
                    </div>
                    
                    {/* Order Sensitivity Guide */}
                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                        ⚡ Order Sensitivity Control
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="font-medium text-green-700 dark:text-green-300">Order Insensitive (Default)</span>
                          <p className="text-orange-700 dark:text-orange-300">Focuses on semantic differences. Array items are matched intelligently regardless of order.</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-medium text-orange-700 dark:text-orange-300">Order Sensitive</span>
                          <p className="text-orange-700 dark:text-orange-300">Strict position-based comparison. Shows order changes as differences.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left Endpoint */}
          <EndpointPanel
            endpoint={leftEndpoint}
            onUpdate={setLeftEndpoint}
            onFetch={() => fetchEndpoint(leftEndpoint)}
            onClear={() => clearEndpoint('left')}
            onAddHeader={addHeader}
            onRemoveHeader={removeHeader}
            side="left"
            onShowPlatformHeaders={() => setShowPlatformHeaders(true)}
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
            onShowPlatformHeaders={() => setShowPlatformHeaders(true)}
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

        {/* Load Config Modal */}
        {showLoadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLoadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Load Saved Configuration</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoadModal(false)}
                >
                  ✕
                </Button>
              </div>
              
              {indexedDBConfigs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No saved configurations found.</p>
                  <p className="text-sm text-muted-foreground">Save a configuration first to load it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {indexedDBConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleLoadConfig(config)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{config.name}</h4>
                          <p className="text-sm text-muted-foreground">{config.url}</p>
                          <div className="flex gap-2 mt-2">
                            {config.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Load
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Platform Headers Modal */}
        {showPlatformHeaders && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPlatformHeaders(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Platform Headers</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlatformHeaders(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Choose platform-specific headers to load instantly. These will be merged with your existing headers.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(platformHeaders).map(([platform, headers]) => (
                    <div key={platform} className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50 hover:border-gray-500/70 transition-all duration-200">
                      <h4 className="font-semibold capitalize text-lg mb-4 text-center text-gray-100">{platform}</h4>
                      
                                              <div className="space-y-3 mb-6">
                          {Object.entries(headers).map(([key, value]) => (
                            <div key={key} className="flex items-start space-x-2">
                              <span className="font-mono text-xs bg-gray-700/80 px-2 py-1 rounded text-gray-200 min-w-[80px] text-center border border-gray-600/50">
                                {key}
                              </span>
                              <span className="text-xs text-gray-300 break-all">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            loadPlatformHeaders(platform as keyof typeof platformHeaders, 'left');
                            setShowPlatformHeaders(false);
                          }}
                          className="flex-1"
                        >
                          Load to Live API
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            loadPlatformHeaders(platform as keyof typeof platformHeaders, 'right');
                            setShowPlatformHeaders(false);
                          }}
                          className="flex-1"
                        >
                          Load to New API
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
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
  onShowPlatformHeaders: () => void;
}

function EndpointPanel({ 
  endpoint, 
  onUpdate, 
  onFetch, 
  onClear, 
  onAddHeader, 
  onRemoveHeader, 
  side,
  onShowPlatformHeaders
}: EndpointPanelProps) {
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [showBaseUrlDropdown, setShowBaseUrlDropdown] = useState(false);
  const [showEndpointDropdown, setShowEndpointDropdown] = useState(false);

  // Handle ESC key to close dropdowns
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowBaseUrlDropdown(false);
        setShowEndpointDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

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
              <div className="flex space-x-2 mt-1">
                <Input
                  id={`base-url-${side}`}
                  value={endpoint.baseUrl}
                  onChange={(e) => onUpdate({ ...endpoint, baseUrl: e.target.value })}
                  placeholder="https://api.example.com"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBaseUrlDropdown(!showBaseUrlDropdown)}
                  className="px-3"
                  title="Load Saved Base URLs"
                >
                  <Database className="w-4 h-4" />
                </Button>
              </div>
              {/* Base URL Dropdown */}
              {showBaseUrlDropdown && (
                <div className="absolute z-50 mt-2 p-3 border rounded-lg bg-background/95 backdrop-blur-sm shadow-lg max-h-40 overflow-y-auto min-w-[300px]">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Saved Base URLs:</div>
                  <div className="space-y-2">
                    <div
                      className="p-2 hover:bg-muted/50 rounded cursor-pointer text-sm transition-colors"
                      onClick={() => {
                        onUpdate({ ...endpoint, baseUrl: 'https://apiserver.cricbuzz.com' });
                        setShowBaseUrlDropdown(false);
                      }}
                    >
                      https://apiserver.cricbuzz.com
                    </div>
                    <div
                      className="p-2 hover:bg-muted/50 rounded cursor-pointer text-sm transition-colors"
                      onClick={() => {
                        onUpdate({ ...endpoint, baseUrl: 'http://api.cricbuzz.stg' });
                        setShowBaseUrlDropdown(false);
                      }}
                    >
                      http://api.cricbuzz.stg
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor={`endpoint-${side}`}>Endpoint</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id={`endpoint-${side}`}
                  value={endpoint.endpoint}
                  onChange={(e) => onUpdate({ ...endpoint, endpoint: e.target.value })}
                  placeholder="/v1/users"
                  className="mt-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEndpointDropdown(!showEndpointDropdown)}
                  className="px-3"
                  title="Load Saved Endpoints"
                >
                  <Database className="w-4 h-4" />
                </Button>
              </div>
              {/* Endpoint Dropdown */}
              {showEndpointDropdown && (
                <div className="absolute z-50 mt-2 p-3 border rounded-lg bg-background/95 backdrop-blur-sm shadow-lg max-h-40 overflow-y-auto min-w-[350px]">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Saved Endpoints:</div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Venues:</div>
                    <div
                      className="p-2 hover:bg-muted/50 rounded cursor-pointer text-sm transition-colors"
                      onClick={() => {
                        onUpdate({ ...endpoint, endpoint: '/venues/v1/32' });
                        setShowEndpointDropdown(false);
                      }}
                    >
                      /venues/v1/32
                    </div>
                    <div
                      className="p-2 hover:bg-muted/50 rounded cursor-pointer text-sm transition-colors"
                      onClick={() => {
                        onUpdate({ ...endpoint, endpoint: '/venues/v2/31' });
                        setShowEndpointDropdown(false);
                      }}
                    >
                      /venues/v2/31
                    </div>
                    
                    <div className="text-xs font-medium text-muted-foreground mb-2 mt-3">Videos:</div>
                    <div
                      className="p-2 hover:bg-muted/50 rounded cursor-pointer text-sm transition-colors"
                      onClick={() => {
                        onUpdate({ ...endpoint, endpoint: '/a/videos/v1/plain-detail/46984' });
                        setShowEndpointDropdown(false);
                      }}
                    >
                      /a/videos/v1/plain-detail/46984
                    </div>
                    
                    <div className="text-xs font-medium text-muted-foreground mb-2 mt-3">Matches:</div>
                    <div
                      className="p-2 hover:bg-muted/50 rounded cursor-pointer text-sm transition-colors"
                      onClick={() => {
                        onUpdate({ ...endpoint, endpoint: '/m/matches/v1/scorecard/12345' });
                        setShowEndpointDropdown(false);
                      }}
                    >
                      /m/matches/v1/scorecard/12345
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Headers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Headers</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onShowPlatformHeaders}
                className="px-3"
                title="Load Platform Headers"
              >
                <Zap className="w-4 h-4 mr-2" />
                Platform Headers
              </Button>
            </div>
            
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
