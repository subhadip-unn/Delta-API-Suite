'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Loader2, 
  CheckCircle,
  AlertCircle, 
  Globe, 
  Settings,
  Zap,
  Code,
  ArrowRight,
  RefreshCw,
  Search,
  Clock,
  ChevronDown,
  Edit2,
  Check,
  X,
  Copy
} from 'lucide-react';
import { 
  apiCatalog, 
  PLATFORMS, 
  ENVIRONMENTS, 
  getAPIsByCategory, 
  generateFullURL,
  validateParameter,
  type APIEndpoint 
} from '@/lib/apiRegistry';
import { compareJsonData, ComparisonResult } from '@/lib/comparison-engine';

interface APIJourneyProps {
  onAPIExecute: (side: 'source' | 'target', request: any) => void;
  sourceResponse: any;
  targetResponse: any;
  loading: { source: boolean; target: boolean };
  error: { source: string | null; target: string | null };
}

export default function APIJourney({ onAPIExecute, sourceResponse, targetResponse, loading, error }: APIJourneyProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [browseOpen, setBrowseOpen] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<APIEndpoint[]>([]);

  // Load recently used APIs from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('delta-api-recently-used');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentlyUsed(parsed);
      } catch (error) {
        console.warn('Failed to parse recently used APIs from localStorage:', error);
      }
    }
  }, []);

  // Save recently used APIs to localStorage whenever it changes
  useEffect(() => {
    if (recentlyUsed.length > 0) {
      localStorage.setItem('delta-api-recently-used', JSON.stringify(recentlyUsed));
    }
  }, [recentlyUsed]);
  const [previewAPI, setPreviewAPI] = useState<APIEndpoint | null>(null);
  const [focusedItem, setFocusedItem] = useState<{type: 'category' | 'api', id: string} | null>(null);
  const [hoveredAPI, setHoveredAPI] = useState<APIEndpoint | null>(null);

  // Simple hover behavior with delay to prevent flickering
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // URL editing states
  const [editingURL, setEditingURL] = useState<string | null>(null);
  const [editedURL, setEditedURL] = useState<string>('');
  const [customURLs, setCustomURLs] = useState<Record<string, string>>({});

  const handleAPIHover = (api: APIEndpoint) => {
    // Clear any existing timeout immediately
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    // Set preview immediately for instant response
    setHoveredAPI(api);
    setPreviewAPI(api);
  };

  const handleAPILear = () => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    // Add a delay to prevent flickering when moving between elements
    const timeout = setTimeout(() => {
      setHoveredAPI(null);
      setPreviewAPI(null);
    }, 150); // Reduced delay for better responsiveness
    setHoverTimeout(timeout);
  };

  const handlePanelEnter = () => {
    // Clear timeout when entering panel to prevent it from disappearing
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handlePanelLeave = () => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    // Add delay when leaving panel to prevent flickering
    const timeout = setTimeout(() => {
      setHoveredAPI(null);
      setPreviewAPI(null);
    }, 100); // Reduced delay for better responsiveness
    setHoverTimeout(timeout);
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
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getDisplayURL = (originalURL: string, key: string) => {
    return customURLs[key] || originalURL;
  };

  // Reusable URL Editor Component
  const URLEditor = ({ url, key, label }: { url: string; key: string; label: string }) => {
    const displayURL = getDisplayURL(url, key);
    const isEditing = editingURL === key;

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
                onClick={() => handleSaveURL(key)}
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
                onClick={() => handleEditURL(displayURL, key)}
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);
  const [sourceAPI, setSourceAPI] = useState<APIEndpoint | null>(null);
  const [targetAPI, setTargetAPI] = useState<APIEndpoint | null>(null);
  const [autofillTarget, setAutofillTarget] = useState(true);
  const [sourceParams, setSourceParams] = useState<Record<string, string>>({});
  const [targetParams, setTargetParams] = useState<Record<string, string>>({});
  const [sourceConfig, setSourceConfig] = useState({
    platform: 'm',
    environment: 'prod',
    version: 'v1'
  });
  const [targetConfig, setTargetConfig] = useState({
    platform: 'm',
    environment: 'staging',
    version: 'v1'
  });
  const [diffAnalysis, setDiffAnalysis] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Get filtered APIs
  const filteredAPIs = searchQuery 
    ? apiCatalog.filter(api => 
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.pathTemplate.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getAPIsByCategory(selectedCategory);


  // Get categories
  const categories = [...new Set(apiCatalog.map(api => api.category))];

  // Handle API selection
  const handleAPISelection = (side: 'source' | 'target', api: APIEndpoint) => {
    if (side === 'source') {
      setSourceAPI(api);
      setSourceParams({});
      // Auto-fill target with the same API for quicker comparison
      if (autofillTarget) {
        setTargetAPI(api);
        setTargetParams({});
        // Keep platform same, suggest a different env/version for comparison
        setTargetConfig(prev => ({
          platform: sourceConfig.platform,
          environment: sourceConfig.environment === 'prod' ? 'staging' : sourceConfig.environment,
          version: sourceConfig.version === 'v1' ? 'v2' : sourceConfig.version
        }));
      }
      // Add to recently used
      setRecentlyUsed(prev => {
        const filtered = prev.filter(item => item.id !== api.id);
        return [api, ...filtered].slice(0, 5);
      });
    } else {
      setTargetAPI(api);
      setTargetParams({});
    }
  };


  // Generate example URL for preview
  const generateExampleURL = (api: APIEndpoint) => {
    const platform = sourceConfig.platform;
    const version = sourceConfig.version;
    const environment = sourceConfig.environment;
    const baseUrl = ENVIRONMENTS.find(env => env.id === environment)?.baseUrl || 'http://apiprv.cricbuzz.com';
    
    let path = api.pathTemplate
      .replace('{platform}', platform)
      .replace('{version}', version)
      .replace('{id}', '12345')
      .replace('{pageType}', 'live')
      .replace('{iid}', '67890')
      .replace('{playerId}', '12345')
      .replace('{type}', 'batting')
      .replace('{matchId}', '12345')
      .replace('{videoId}', '12345')
      .replace('{buzzType}', 'video')
      .replace('{buzzId}', '12345');
    
    return `${baseUrl}${path}`;
  };

  // Simple keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!browseOpen) return;
    
    const { key } = e;
    
    if (key === 'Escape') {
      if (previewAPI) {
        setPreviewAPI(null);
        setHoveredAPI(null);
      } else {
        setBrowseOpen(false);
      }
      return;
    }
    
    if (key === 'Enter' && focusedItem) {
      e.preventDefault();
      if (focusedItem.type === 'category') {
        setSelectedCategory(focusedItem.id);
        setPreviewAPI(null);
        setHoveredAPI(null);
      } else if (focusedItem.type === 'api') {
        const api = getAPIsByCategory(selectedCategory).find(a => a.id === focusedItem.id);
        if (api) {
          handleAPISelection('source', api);
          setBrowseOpen(false);
        }
      }
    }
  };


  // Handle parameter change
  const handleParameterChange = (side: 'source' | 'target', key: string, value: string) => {
    if (side === 'source') {
      setSourceParams(prev => ({ ...prev, [key]: value }));
    } else {
      setTargetParams(prev => ({ ...prev, [key]: value }));
    }
  };

  // Execute API
  const executeAPI = async (side: 'source' | 'target') => {
    const api = side === 'source' ? sourceAPI : targetAPI;
    const params = side === 'source' ? sourceParams : targetParams;
    const config = side === 'source' ? sourceConfig : targetConfig;
    
    if (!api) return;

    // Get the URL being used (custom or generated)
    const generatedURL = generatePreviewURL(api, params, config);
    const customURL = customURLs[`${side}-${api.id}`];
    const finalURL = customURL || generatedURL;
    
    console.log(`🚀 Executing ${side.toUpperCase()} API:`, {
      apiName: api.name,
      originalURL: generatedURL,
      customURL: customURL,
      finalURL: finalURL,
      usingCustom: !!customURL
    });

    // Validate parameters
    const errors: Record<string, string> = {};
    let hasErrors = false;

    api.parameters.forEach(param => {
      const value = params[param.key] || '';
      const validation = validateParameter(param.key, value);
      if (!validation.valid) {
        errors[param.key] = validation.error || '';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      console.error('Validation errors:', errors);
      return;
    }

    // Use the final URL (custom or generated)
    const fullURL = finalURL;

    // Prepare request body for POST/PUT requests
    let requestBody = undefined;
    if ((api.method === 'POST' || api.method === 'PUT') && params['_body']) {
      try {
        requestBody = JSON.parse(params['_body']);
      } catch (e) {
        console.error('Invalid JSON in request body:', e);
        return;
      }
    }

    // Execute request
    onAPIExecute(side, {
      method: api.method,
      url: fullURL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Delta-API-Suite/1.0'
      },
      body: requestBody
    });
  };

  // Compare responses
  const compareResponses = async () => {
    if (!sourceResponse || !targetResponse) return;
    
    setIsComparing(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = compareJsonData(sourceResponse, targetResponse, false);
    setDiffAnalysis(result);
    setIsComparing(false);
  };

  // Generate preview URL
  const generatePreviewURL = (api: APIEndpoint | null, params: Record<string, string>, config: any) => {
    if (!api) return '';
    
    const environment = ENVIRONMENTS.find(env => env.id === config.environment);
    return generateFullURL(
      environment?.baseUrl || '',
      api.pathTemplate,
      config.platform,
      config.version,
      params
    );
  };

  return (
    <div className="space-y-6">
      {/* Integrated Search + Browse Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Single search input with integrated Browse button */}
            <div className="relative">
              <Input
                placeholder="Search APIs by name, description, or path..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pr-32 pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔎</span>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                <div className="h-6 w-px bg-border mr-2"></div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs hover:bg-muted/60 rounded-md"
                  onClick={() => setBrowseOpen(true)}
                >
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Browse
                </Button>
              </div>
            </div>

            {/* Lightweight inline results list (clickable) */}
            {searchQuery && (
              <div className="max-h-64 overflow-y-auto rounded-md border bg-card/50 backdrop-blur-sm">
                {filteredAPIs.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No results</div>
                ) : (
                  <ul className="divide-y">
                    {filteredAPIs.slice(0, 12).map((api) => (
                      <li key={api.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(api.category);
                            handleAPISelection('source', api);
                          }}
                          className="w-full text-left p-3 hover:bg-muted/60 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{api.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{api.description}</div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate">{api.pathTemplate}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">
                                {api.category}
                              </Badge>
                              <Badge 
                                variant={api.method === 'GET' ? 'default' : api.method === 'POST' ? 'destructive' : 'secondary'}
                                className="text-[10px]"
                              >
                                {api.method}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Autofill toggle */}
            <div className="flex items-center space-x-2">
              <Switch id="autofill-target" checked={autofillTarget} onCheckedChange={setAutofillTarget} />
              <Label htmlFor="autofill-target" className="text-sm">
                Auto-fill Target with selected Source API
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Browse Library Dialog */}
      <Dialog open={browseOpen} onOpenChange={(open) => {
        setBrowseOpen(open);
        if (!open) {
          setFocusedItem(null);
          setPreviewAPI(null);
        }
      }}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col [&>button]:hidden" onKeyDown={handleKeyDown}>
          <DialogHeader className="pb-3 flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-cricbuzz-500 rounded-full"></div>
                <span className="text-lg font-semibold">API Library Explorer</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted/60 rounded text-[10px] font-mono">Hover</kbd>
                  <span>Preview</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted/60 rounded text-[10px] font-mono">Click</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted/60 rounded text-[10px] font-mono">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
            {/* Categories - Left Column */}
            <div className="col-span-3 border rounded-lg overflow-hidden flex flex-col">
              {/* Recent APIs Section */}
              {recentlyUsed.length > 0 && (
                <div className="border-b flex-shrink-0">
                  <div className="p-3 bg-muted/20">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent
                    </h3>
                  </div>
                  <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
                    {recentlyUsed.slice(0, 3).map((api) => (
                      <button
                        key={api.id}
                        type="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedCategory(api.category);
                          handleAPISelection('source', api);
                          setBrowseOpen(false);
                        }}
                        onMouseEnter={() => {
                          setPreviewAPI(api);
                          setFocusedItem({ type: 'api', id: api.id });
                        }}
                        className="w-full text-left p-2 rounded text-xs hover:bg-muted/60 transition-colors"
                      >
                        <div className="font-medium truncate">{api.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{api.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Categories Section */}
              <div className="p-3 border-b bg-muted/30 flex-shrink-0">
                <h3 className="font-medium text-sm">Categories</h3>
              </div>
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-1 pb-4">
                    {categories.map((cat) => (
                      <div key={cat} className="mx-1">
                        <button
                          type="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setPreviewAPI(null);
                            setFocusedItem({ type: 'category', id: cat });
                          }}
                          onMouseEnter={() => {
                            setPreviewAPI(null);
                            setFocusedItem({ type: 'category', id: cat });
                          }}
                          className={`w-full text-left p-2 rounded text-sm hover:bg-muted/60 transition-colors ${
                            selectedCategory === cat ? 'bg-muted' : ''
                          } ${
                            focusedItem?.type === 'category' && focusedItem?.id === cat ? 'ring-2 ring-cricbuzz-500 bg-cricbuzz-50 dark:bg-cricbuzz-950/20' : ''
                          }`}
                          data-category-id={cat}
                        >
                        <div className="flex items-center justify-between">
                          <span className="capitalize truncate">{cat}</span>
                          <Badge variant="outline" className="text-[10px] ml-2">
                            {getAPIsByCategory(cat).length}
                          </Badge>
                        </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* APIs - Expanded Middle Column */}
            <div className="col-span-9 border rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b bg-muted/30 flex-shrink-0">
                <h3 className="font-medium text-sm">
                  {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} APIs` : 'Select Category'}
                </h3>
              </div>
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  {selectedCategory ? (
                    <div className="p-2 space-y-2 pb-4">
                      {getAPIsByCategory(selectedCategory).map((api) => (
                        <div key={api.id} className="mx-1">
                          <button
                            type="button"
                            tabIndex={0}
                            onClick={() => {
                              handleAPISelection('source', api);
                              setBrowseOpen(false);
                            }}
                            onMouseEnter={(e) => {
                              e.preventDefault();
                              handleAPIHover(api);
                            }}
                            onMouseLeave={handleAPILear}
                            onMouseOver={() => {
                              // Backup hover handler in case onMouseEnter fails
                              if (!previewAPI || previewAPI.id !== api.id) {
                                handleAPIHover(api);
                              }
                            }}
                            onFocus={() => {
                              setPreviewAPI(api);
                              setFocusedItem({ type: 'api', id: api.id });
                            }}
                            className={`w-full text-left p-3 rounded-lg text-sm hover:bg-muted/60 transition-all duration-200 ${
                              focusedItem?.type === 'api' && focusedItem?.id === api.id ? 'ring-2 ring-cricbuzz-500 bg-cricbuzz-50 dark:bg-cricbuzz-950/20 shadow-sm' : ''
                            }`}
                            data-api-id={api.id}
                          >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-medium text-base">{api.name}</div>
                                <Badge 
                                  variant={api.method === 'GET' ? 'default' : api.method === 'POST' ? 'destructive' : 'secondary'}
                                  className="text-[10px] px-2 py-0.5"
                                >
                                  {api.method}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">{api.description}</div>
                              <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded border break-all overflow-x-auto">
                                <code className="whitespace-pre-wrap">{api.pathTemplate}</code>
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                              <Badge variant="outline" className="text-[10px]">
                                {api.category}
                              </Badge>
                              <div className="text-[10px] text-muted-foreground">
                                {api.parameters?.length || 0} params
                              </div>
                            </div>
                          </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-sm">Select a category to view APIs</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Simple Floating Preview Panel */}
          {previewAPI && (
            <div 
              className="absolute w-80 max-h-[70vh] bg-background border rounded-lg shadow-2xl z-[40] overflow-hidden"
              style={{
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginLeft: '20px'
              }}
              onMouseEnter={handlePanelEnter}
              onMouseLeave={handlePanelLeave}
            >
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="font-medium text-sm">API Preview</h3>
                <button
                  onClick={() => {
                    setPreviewAPI(null);
                    setHoveredAPI(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Close"
                >
                  ✕
                </button>
              </div>
              <ScrollArea className="h-full max-h-[60vh]">
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-lg mb-2">{previewAPI.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{previewAPI.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Method</label>
                      <div className="mt-2">
                        <Badge 
                          variant={previewAPI.method === 'GET' ? 'default' : previewAPI.method === 'POST' ? 'destructive' : 'secondary'}
                          className="text-sm px-3 py-1"
                        >
                          {previewAPI.method}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {previewAPI.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Path Template</label>
                    <div className="mt-2 p-3 bg-muted rounded-lg text-sm font-mono break-all border overflow-x-auto">
                      <code className="whitespace-pre-wrap">{previewAPI.pathTemplate}</code>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Example URL</label>
                    <div className="mt-2 p-3 bg-muted rounded-lg text-sm font-mono break-all border overflow-x-auto">
                      <code className="whitespace-pre-wrap">{generateExampleURL(previewAPI)}</code>
                    </div>
                  </div>

                  {previewAPI.parameters && previewAPI.parameters.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Parameters</label>
                      <div className="mt-2 space-y-2">
                        {previewAPI.parameters.slice(0, 5).map((param) => (
                          <div key={param.key} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                            <span className="font-medium">{param.key}</span>
                            <span className="text-muted-foreground">{param.type}</span>
                          </div>
                        ))}
                        {previewAPI.parameters.length > 5 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{previewAPI.parameters.length - 5} more parameters
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button 
                      onClick={() => {
                        handleAPISelection('source', previewAPI);
                        setBrowseOpen(false);
                      }}
                      className="w-full bg-cricbuzz-500 hover:bg-cricbuzz-600 text-white"
                    >
                      Select This API
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* API Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Source API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Selection */}
            <div>
              <Label>Select API</Label>
              <Select value={sourceAPI?.id} onValueChange={(value) => {
                const api = filteredAPIs.find(a => a.id === value);
                if (api) handleAPISelection('source', api);
              }}>
              <SelectTrigger className="mt-1 h-11 text-sm">
                  <SelectValue placeholder="Choose an API..." />
                </SelectTrigger>
              <SelectContent className="text-[13px] leading-5">
                  {filteredAPIs.map(api => (
                    <SelectItem key={api.id} value={api.id}>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{api.name}</span>
                      <span className="text-xs text-muted-foreground/90">{api.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuration */}
            {sourceAPI && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Platform</Label>
                    <Select value={sourceConfig.platform} onValueChange={(value) => 
                      setSourceConfig(prev => ({ ...prev, platform: value }))
                    }>
                      <SelectTrigger className="mt-1 h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(platform => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Environment</Label>
                    <Select value={sourceConfig.environment} onValueChange={(value) => 
                      setSourceConfig(prev => ({ ...prev, environment: value }))
                    }>
                      <SelectTrigger className="mt-1 h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENVIRONMENTS.map(env => (
                          <SelectItem key={env.id} value={env.id}>
                            {env.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Version</Label>
                    <Select value={sourceConfig.version} onValueChange={(value) => 
                      setSourceConfig(prev => ({ ...prev, version: value }))
                    }>
                      <SelectTrigger className="mt-1 h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">v1</SelectItem>
                        <SelectItem value="v2">v2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Parameters */}
                {sourceAPI.parameters.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Parameters</Label>
                    {sourceAPI.parameters.map(param => (
                      <div key={param.key} className="space-y-1">
                        <Label htmlFor={`source-${param.key}`} className="text-xs flex items-center space-x-1">
                          <span>{param.description}</span>
                          {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </Label>
                        <Input
                          id={`source-${param.key}`}
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={sourceParams[param.key] || ''}
                          onChange={(e) => handleParameterChange('source', param.key, e.target.value)}
                          placeholder={param.placeholder}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Request Body for POST/PUT requests */}
                {(sourceAPI.method === 'POST' || sourceAPI.method === 'PUT') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Request Body</Label>
                    <textarea
                      className="w-full p-2 border rounded text-sm font-mono"
                      rows={4}
                      placeholder="Enter JSON request body..."
                      value={sourceParams['_body'] || ''}
                      onChange={(e) => handleParameterChange('source', '_body', e.target.value)}
                    />
                  </div>
                )}

                {/* Method and Preview URL */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs">Method:</Label>
                    <Badge variant={sourceAPI.method === 'GET' ? 'default' : sourceAPI.method === 'POST' ? 'destructive' : 'secondary'}>
                      {sourceAPI.method}
                    </Badge>
                  </div>
                  <URLEditor 
                    url={generatePreviewURL(sourceAPI, sourceParams, sourceConfig)}
                    key={`source-${sourceAPI.id}`}
                    label="Preview URL"
                  />
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={() => executeAPI('source')}
                  disabled={loading.source || !sourceAPI}
                  className="w-full bg-cricbuzz-500 hover:bg-cricbuzz-600 text-white transition-transform duration-200 will-change-transform hover:scale-[1.01]"
                >
                  {loading.source ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Execute Source API
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Target API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Target API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Selection */}
            <div>
              <Label>Select API</Label>
              <Select value={targetAPI?.id} onValueChange={(value) => {
                const api = filteredAPIs.find(a => a.id === value);
                if (api) handleAPISelection('target', api);
              }}>
                <SelectTrigger className="mt-1 h-11 text-sm">
                  <SelectValue placeholder="Choose an API..." />
                </SelectTrigger>
                <SelectContent className="text-[13px] leading-5">
                  {filteredAPIs.map(api => (
                    <SelectItem key={api.id} value={api.id}>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{api.name}</span>
                        <span className="text-xs text-muted-foreground/90">{api.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuration */}
            {targetAPI && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Platform</Label>
                    <Select value={targetConfig.platform} onValueChange={(value) => 
                      setTargetConfig(prev => ({ ...prev, platform: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(platform => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Environment</Label>
                    <Select value={targetConfig.environment} onValueChange={(value) => 
                      setTargetConfig(prev => ({ ...prev, environment: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENVIRONMENTS.map(env => (
                          <SelectItem key={env.id} value={env.id}>
                            {env.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Version</Label>
                    <Select value={targetConfig.version} onValueChange={(value) => 
                      setTargetConfig(prev => ({ ...prev, version: value }))
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

                {/* Parameters */}
                {targetAPI.parameters.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Parameters</Label>
                    {targetAPI.parameters.map(param => (
                      <div key={param.key} className="space-y-1">
                        <Label htmlFor={`target-${param.key}`} className="text-xs flex items-center space-x-1">
                          <span>{param.description}</span>
                          {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </Label>
                        <Input
                          id={`target-${param.key}`}
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={targetParams[param.key] || ''}
                          onChange={(e) => handleParameterChange('target', param.key, e.target.value)}
                          placeholder={param.placeholder}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Request Body for POST/PUT requests */}
                {(targetAPI.method === 'POST' || targetAPI.method === 'PUT') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Request Body</Label>
                    <textarea
                      className="w-full p-2 border rounded text-sm font-mono"
                      rows={4}
                      placeholder="Enter JSON request body..."
                      value={targetParams['_body'] || ''}
                      onChange={(e) => handleParameterChange('target', '_body', e.target.value)}
                    />
                  </div>
                )}

                {/* Method and Preview URL */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs">Method:</Label>
                    <Badge variant={targetAPI.method === 'GET' ? 'default' : targetAPI.method === 'POST' ? 'destructive' : 'secondary'}>
                      {targetAPI.method}
                    </Badge>
                  </div>
                  <URLEditor 
                    url={generatePreviewURL(targetAPI, targetParams, targetConfig)}
                    key={`target-${targetAPI.id}`}
                    label="Preview URL"
                  />
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={() => executeAPI('target')}
                  disabled={loading.target || !targetAPI}
                  className="w-full bg-cricbuzz-500 hover:bg-cricbuzz-600 text-white transition-transform duration-200 will-change-transform hover:scale-[1.01]"
                >
                  {loading.target ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Execute Target API
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Section */}
      {sourceResponse && targetResponse && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Response Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={compareResponses}
                    disabled={isComparing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isComparing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Compare Responses
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Source: {sourceResponse?.size || 0} bytes | Target: {targetResponse?.size || 0} bytes
                </div>
              </div>
              
              {diffAnalysis && (
                <div className="space-y-4">
                  {diffAnalysis.identical ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-700 mb-2">
                        🎉 Perfect Match!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Both API responses are completely identical
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-red-600">{diffAnalysis.summary.missingFields}</div>
                          <div className="text-sm text-red-700">Missing</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{diffAnalysis.summary.extraFields}</div>
                          <div className="text-sm text-green-700">Extra</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600">{diffAnalysis.summary.differentFields}</div>
                          <div className="text-sm text-yellow-700">Changed</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">{diffAnalysis.summary.identicalFields}</div>
                          <div className="text-sm text-blue-700">Identical</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {diffAnalysis.differences.slice(0, 10).map((diff, index) => (
                          <div key={index} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge className={
                                  diff.type === 'missing' ? 'bg-red-100 text-red-800' :
                                  diff.type === 'extra' ? 'bg-green-100 text-green-800' :
                                  diff.type === 'changed' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-orange-100 text-orange-800'
                                }>
                                  {diff.type.toUpperCase()}
                                </Badge>
                                <span className="font-mono text-sm text-gray-600">{diff.path}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{diff.description}</p>
                          </div>
                        ))}
                        {diffAnalysis.differences.length > 10 && (
                          <div className="text-center text-sm text-gray-500">
                            ... and {diffAnalysis.differences.length - 10} more differences
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
