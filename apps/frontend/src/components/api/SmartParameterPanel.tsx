import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  RefreshCw
} from 'lucide-react';
import { 
  PLATFORMS, 
  BASE_URLS, 
  API_CATEGORIES, 
  getAPIsFromCategory, 
  generateFullURL,
  validateParameter,
  type ParameterConfig 
} from '@/lib/api-parameter-system';

interface SmartParameterPanelProps {
  onApiSelect: (baseUrl: string, endpoint: string, headers: Record<string, string>) => void;
  onResponseReceived: (response: any, status: number, responseTime: number) => void;
  loading: boolean;
  error?: string;
}

const SmartParameterPanel: React.FC<SmartParameterPanelProps> = ({
  onApiSelect,
  onResponseReceived,
  loading,
  error
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('m');
  const [selectedCategory, setSelectedCategory] = useState<string>('home');
  const [selectedAPI, setSelectedAPI] = useState<string>('');
  const [selectedBaseUrl, setSelectedBaseUrl] = useState<string>(BASE_URLS[0].id);
  const [selectedVersion, setSelectedVersion] = useState<string>('v1');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [parameterErrors, setParameterErrors] = useState<Record<string, string>>({});
  const [generatedURL, setGeneratedURL] = useState<string>('');

  // Get current APIs
  const currentAPIs = getAPIsFromCategory(selectedCategory);
  const currentAPI = currentAPIs.find(api => api.id === selectedAPI);

  // Update generated URL when parameters change
  useEffect(() => {
    if (currentAPI && selectedBaseUrl) {
      const baseUrl = BASE_URLS.find(b => b.id === selectedBaseUrl)?.url || '';
      const fullURL = generateFullURL(
        baseUrl,
        currentAPI.path,
        selectedPlatform,
        selectedVersion,
        parameters
      );
      setGeneratedURL(fullURL);
    }
  }, [selectedPlatform, selectedCategory, selectedAPI, selectedBaseUrl, selectedVersion, parameters, currentAPI]);

  // Handle API selection
  const handleApiSelect = (apiId: string) => {
    setSelectedAPI(apiId);
    const api = currentAPIs.find(a => a.id === apiId);
    if (api) {
      // Reset parameters when API changes
      const newParameters: Record<string, string> = {};
      api.parameters.forEach(param => {
        newParameters[param.key] = '';
      });
      setParameters(newParameters);
      setParameterErrors({});
    }
  };

  // Handle parameter change
  const handleParameterChange = (key: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));

    // Validate parameter
    const validation = validateParameter(key, value);
    setParameterErrors(prev => ({
      ...prev,
      [key]: validation.valid ? '' : validation.error || ''
    }));
  };

  // Execute API
  const executeAPI = async () => {
    if (!currentAPI) return;

    // Validate all parameters
    const errors: Record<string, string> = {};
    let hasErrors = false;

    currentAPI.parameters.forEach(param => {
      const value = parameters[param.key] || '';
      const validation = validateParameter(param.key, value);
      if (!validation.valid) {
        errors[param.key] = validation.error || '';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setParameterErrors(errors);
      return;
    }

    // Parse URL to extract base URL and endpoint
    const baseUrl = BASE_URLS.find(b => b.id === selectedBaseUrl)?.url || '';
    const urlParts = generatedURL.split('/');
    const baseUrlPart = urlParts.slice(0, 3).join('/');
    const endpointPart = '/' + urlParts.slice(3).join('/');

    onApiSelect(baseUrlPart, endpointPart, {});
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Smart API Parameter Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform & Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(platform => (
                  <SelectItem key={platform.id} value={platform.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{platform.name}</span>
                      <span className="text-xs text-muted-foreground">{platform.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              setSelectedAPI('');
              setParameters({});
              setParameterErrors({});
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {API_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>API Endpoint</Label>
            <Select value={selectedAPI} onValueChange={handleApiSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select API" />
              </SelectTrigger>
              <SelectContent>
                {currentAPIs.map(api => (
                  <SelectItem key={api.id} value={api.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{api.name}</span>
                      <span className="text-xs text-muted-foreground">{api.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Base URL</Label>
            <Select value={selectedBaseUrl} onValueChange={setSelectedBaseUrl}>
              <SelectTrigger>
                <SelectValue placeholder="Select Base URL" />
              </SelectTrigger>
              <SelectContent>
                {BASE_URLS.map(baseUrl => (
                  <SelectItem key={baseUrl.id} value={baseUrl.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{baseUrl.name}</span>
                      <span className="text-xs text-muted-foreground">{baseUrl.url}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Version Selection */}
        <div className="flex items-center space-x-4">
          <div>
            <Label>API Version</Label>
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">v1</SelectItem>
                <SelectItem value="v2">v2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span>Platform: {PLATFORMS.find(p => p.id === selectedPlatform)?.name}</span>
            <ArrowRight className="w-4 h-4" />
            <span>Version: {selectedVersion}</span>
          </div>
        </div>

        {/* Parameters */}
        {currentAPI && currentAPI.parameters.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <Label className="text-lg font-semibold">Parameters</Label>
              <Badge variant="outline">{currentAPI.parameters.length} parameters</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentAPI.parameters.map((param) => (
                <div key={param.key} className="space-y-2">
                  <Label htmlFor={param.key} className="flex items-center space-x-2">
                    <span>{param.description}</span>
                    {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </Label>
                  
                  {param.type === 'select' && param.options ? (
                    <Select 
                      value={parameters[param.key] || ''} 
                      onValueChange={(value) => handleParameterChange(param.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={param.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {param.options.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={param.key}
                      type={param.type === 'number' ? 'number' : 'text'}
                      value={parameters[param.key] || ''}
                      onChange={(e) => handleParameterChange(param.key, e.target.value)}
                      placeholder={param.placeholder}
                      className={parameterErrors[param.key] ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {parameterErrors[param.key] && (
                    <div className="flex items-center space-x-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{parameterErrors[param.key]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated URL */}
        {generatedURL && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Generated URL</Label>
            <div className="p-3 bg-muted rounded-md">
              <code className="text-sm break-all">{generatedURL}</code>
            </div>
          </div>
        )}

        {/* Execute Button */}
        <div className="flex justify-center">
          <Button 
            onClick={executeAPI}
            disabled={loading || !currentAPI || Object.values(parameterErrors).some(error => error)}
            className="px-8 py-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Execute API
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartParameterPanel;
