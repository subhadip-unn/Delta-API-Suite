'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiCatalog } from '@/lib/apiRegistry';
import { SWAGGER_CONFIG, createSwaggerRequestInterceptor, createSwaggerResponseInterceptor, generateSwaggerServers } from '@/lib/swagger-config';
import { 
  Settings, 
  Upload, 
  Download, 
  RefreshCw, 
  FileText, 
  Code, 
  Play,
  Eye,
  EyeOff
} from 'lucide-react';
import './swagger-poc-styles.css';

// Dynamic import to avoid SSR issues
const SwaggerUI = React.lazy(() => import('swagger-ui-react'));

export default function SwaggerPOC() {
  const [openAPISpec, setOpenAPISpec] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'docs' | 'upload' | 'response'>('docs');
  const [showSpec, setShowSpec] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate OpenAPI spec from your API catalog
  const generateOpenAPISpec = () => {
    const paths: Record<string, any> = {};
    
    // Process each API in the catalog
    apiCatalog.forEach(api => {
      // Use the pathTemplate without platform prefix - let Swagger handle it
      let path = api.pathTemplate;
      
      // Extract path parameters
      const pathParams = path.match(/\{([^}]+)\}/g) || [];
      const pathParamNames = pathParams.map(param => param.slice(1, -1));
      
      if (!paths[path]) {
        paths[path] = {};
      }
      
      // Add the HTTP method
      paths[path][api.method.toLowerCase()] = {
        summary: api.name,
        description: api.description || `API endpoint for ${api.name}`,
        tags: [api.category],
        parameters: [
          // Path parameters
          ...pathParamNames.map(paramName => ({
            name: paramName,
            in: 'path',
            required: true,
            description: `Path parameter: ${paramName}`,
            schema: {
              type: 'string',
              example: paramName === 'id' ? '123' : paramName === 'version' ? 'v1' : 'example'
            }
          }))
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'API response data'
                }
              }
            }
          },
          '400': {
            description: 'Bad Request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      };
    });
    
    // Get unique categories for tags
    const categories = Array.from(new Set(apiCatalog.map(api => api.category)));
    
    return {
      openapi: '3.0.0',
      info: {
        title: 'Cricbuzz API Suite',
        description: 'Comprehensive API documentation for Cricbuzz services - POC Demo',
        version: '1.0.0',
        contact: {
          name: 'Cricbuzz API Team',
          email: 'api@cricbuzz.com'
        }
      },
      servers: generateSwaggerServers(SWAGGER_CONFIG),
      tags: categories.map(categoryName => ({
        name: categoryName,
        description: `${categoryName} related APIs`
      })),
      paths
    };
  };

  useEffect(() => {
    try {
      const spec = generateOpenAPISpec();
      setOpenAPISpec(spec);
    } catch (error) {
      console.error('Error generating OpenAPI spec:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleProtoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For POC, just show a message
      alert(`Proto file uploaded: ${file.name}\n\nNote: Proto to OpenAPI conversion would be implemented in production.`);
    }
  };

  const handleResponseUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const responseData = JSON.parse(e.target?.result as string);
          // Generate schema from response
          const schema = generateSchemaFromResponse(responseData);
          alert(`Response schema generated!\n\nSchema preview:\n${JSON.stringify(schema, null, 2)}`);
        } catch (error) {
          alert('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const generateSchemaFromResponse = (response: any) => {
    // Simple schema generation from response
    const generatePropertySchema = (value: any): any => {
      if (typeof value === 'string') return { type: 'string' };
      if (typeof value === 'number') return { type: 'number' };
      if (typeof value === 'boolean') return { type: 'boolean' };
      if (Array.isArray(value)) {
        return {
          type: 'array',
          items: value.length > 0 ? generatePropertySchema(value[0]) : { type: 'object' }
        };
      }
      if (typeof value === 'object' && value !== null) {
        const properties: any = {};
        Object.keys(value).forEach(key => {
          properties[key] = generatePropertySchema(value[key]);
        });
        return {
          type: 'object',
          properties
        };
      }
      return { type: 'string' };
    };

    return {
      type: 'object',
      properties: generatePropertySchema(response).properties || {}
    };
  };

  const downloadSpec = () => {
    if (openAPISpec) {
      const dataStr = JSON.stringify(openAPISpec, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cricbuzz-api-spec.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Generating API documentation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-green-500" />
              <span>Swagger API Documentation - POC</span>
              <Badge variant="outline" className="ml-2">
                {Object.keys(openAPISpec?.paths || {}).length} endpoints
              </Badge>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const spec = generateOpenAPISpec();
                  setOpenAPISpec(spec);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSpec}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Spec
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSpec(!showSpec)}
              >
                {showSpec ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showSpec ? 'Hide' : 'Show'} Spec
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for different functionalities */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="docs" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>API Docs</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Proto</span>
          </TabsTrigger>
          <TabsTrigger value="response" className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Response Schema</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="docs" className="mt-4">
          {/* Swagger UI */}
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <div className="h-full swagger-poc-container">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                }>
                  <SwaggerUI 
                    spec={openAPISpec}
                    docExpansion="list"
                    defaultModelsExpandDepth={1}
                    defaultModelExpandDepth={1}
                    tryItOutEnabled={true}
                    supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
                    deepLinking={true}
                    displayOperationId={false}
                    displayRequestDuration={true}
                    filter={true}
                    showExtensions={true}
                    showCommonExtensions={true}
                    requestInterceptor={createSwaggerRequestInterceptor(SWAGGER_CONFIG)}
                    responseInterceptor={createSwaggerResponseInterceptor()}
                  />
                </React.Suspense>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Proto File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proto-file">Select .proto file</Label>
                  <Input
                    id="proto-file"
                    type="file"
                    accept=".proto"
                    ref={fileInputRef}
                    onChange={handleProtoUpload}
                    className="mt-2"
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Proto File Features (POC):</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Upload .proto files to generate OpenAPI specs</li>
                    <li>• Automatic gRPC to REST API conversion</li>
                    <li>• Schema generation from Protocol Buffers</li>
                    <li>• Integration with existing API catalog</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Schema from API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="response-file">Upload API Response JSON</Label>
                  <Input
                    id="response-file"
                    type="file"
                    accept=".json"
                    onChange={handleResponseUpload}
                    className="mt-2"
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Response Schema Generation (POC):</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Upload JSON response files</li>
                    <li>• Automatic schema generation</li>
                    <li>• Type inference from response data</li>
                    <li>• Integration with OpenAPI specification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Spec Preview */}
      {showSpec && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Generated OpenAPI Spec Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-40">
              {JSON.stringify(openAPISpec, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
