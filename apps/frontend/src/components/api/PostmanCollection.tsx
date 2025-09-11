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
  Globe, 
  FileText,
  Settings,
  Plus,
  Folder,
  FolderOpen,
  Edit
} from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string;
  requests: APIRequest[];
  variables: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

interface APIRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
  tests?: string[];
  preRequestScript?: string;
  description?: string;
  collectionId: string;
}

interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
  isActive: boolean;
}

interface PostmanCollectionProps {
  onRequestExecute: (request: APIRequest) => void;
  loading: boolean;
}

const PostmanCollection: React.FC<PostmanCollectionProps> = ({
  onRequestExecute,
  loading
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<string>('');
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showEnvironment, setShowEnvironment] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [newRequestName, setNewRequestName] = useState('');
  const [newRequestMethod, setNewRequestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [newRequestUrl, setNewRequestUrl] = useState('');
  const [newRequestHeaders, setNewRequestHeaders] = useState<Record<string, string>>({});
  const [newRequestBody, setNewRequestBody] = useState('');
  const [newRequestTests, setNewRequestTests] = useState<string[]>(['']);
  const [newRequestPreScript, setNewRequestPreScript] = useState('');
  const [newRequestDesc, setNewRequestDesc] = useState('');
  const [newVariableKey, setNewVariableKey] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');

  // Load collections from localStorage
  useEffect(() => {
    const savedCollections = localStorage.getItem('postman-collections');
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    }

    const savedEnvironments = localStorage.getItem('postman-environments');
    if (savedEnvironments) {
      setEnvironments(JSON.parse(savedEnvironments));
    }
  }, []);

  // Save collections to localStorage
  const saveCollections = (newCollections: Collection[]) => {
    setCollections(newCollections);
    localStorage.setItem('postman-collections', JSON.stringify(newCollections));
  };

  // Save environments to localStorage
  const saveEnvironments = (newEnvironments: Environment[]) => {
    setEnvironments(newEnvironments);
    localStorage.setItem('postman-environments', JSON.stringify(newEnvironments));
  };

  // Create new collection
  const createCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName,
      description: newCollectionDesc,
      requests: [],
      variables: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedCollections = [...collections, newCollection];
    saveCollections(updatedCollections);
    setNewCollectionName('');
    setNewCollectionDesc('');
    setShowNewCollection(false);
  };

  // Create new request
  const createRequest = () => {
    if (!newRequestName.trim() || !newRequestUrl.trim() || !selectedCollection) return;

    const newRequest: APIRequest = {
      id: Date.now().toString(),
      name: newRequestName,
      method: newRequestMethod,
      url: newRequestUrl,
      headers: newRequestHeaders,
      body: newRequestBody,
      tests: newRequestTests.filter(test => test.trim()),
      preRequestScript: newRequestPreScript,
      description: newRequestDesc,
      collectionId: selectedCollection
    };

    const updatedCollections = collections.map(collection => {
      if (collection.id === selectedCollection) {
        return {
          ...collection,
          requests: [...collection.requests, newRequest],
          updatedAt: new Date()
        };
      }
      return collection;
    });

    saveCollections(updatedCollections);
    setNewRequestName('');
    setNewRequestUrl('');
    setNewRequestHeaders({});
    setNewRequestBody('');
    setNewRequestTests(['']);
    setNewRequestPreScript('');
    setNewRequestDesc('');
    setShowNewRequest(false);
  };

  // Create new environment
  const createEnvironment = () => {
    if (!newVariableKey.trim() || !newVariableValue.trim()) return;

    const newEnvironment: Environment = {
      id: Date.now().toString(),
      name: `Environment ${environments.length + 1}`,
      variables: { [newVariableKey]: newVariableValue },
      isActive: false
    };

    const updatedEnvironments = [...environments, newEnvironment];
    saveEnvironments(updatedEnvironments);
    setNewVariableKey('');
    setNewVariableValue('');
    setShowEnvironment(false);
  };

  // Execute request
  const executeRequest = async (request: APIRequest) => {
    // Replace variables in URL and headers
    let processedUrl = request.url;
    let processedHeaders = { ...request.headers };

    // Replace collection variables
    const collection = collections.find(c => c.id === request.collectionId);
    if (collection) {
      Object.entries(collection.variables).forEach(([key, value]) => {
        processedUrl = processedUrl.replace(`{{${key}}}`, value);
        Object.keys(processedHeaders).forEach(headerKey => {
          processedHeaders[headerKey] = processedHeaders[headerKey].replace(`{{${key}}}`, value);
        });
      });
    }

    // Replace environment variables
    const environment = environments.find(e => e.isActive);
    if (environment) {
      Object.entries(environment.variables).forEach(([key, value]) => {
        processedUrl = processedUrl.replace(`{{${key}}}`, value);
        Object.keys(processedHeaders).forEach(headerKey => {
          processedHeaders[headerKey] = processedHeaders[headerKey].replace(`{{${key}}}`, value);
        });
      });
    }

    // Execute the request
    onRequestExecute({
      ...request,
      url: processedUrl,
      headers: processedHeaders
    });
  };

  // Get current collection
  const currentCollection = collections.find(c => c.id === selectedCollection);
  const currentRequest = currentCollection?.requests.find(r => r.id === selectedRequest);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Postman-like Collections</h2>
          <Badge variant="outline" className="text-sm">
            {collections.length} Collections
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewCollection(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEnvironment(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Environments
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collections Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Folder className="w-5 h-5" />
                <span>Collections</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {collections.map(collection => (
                  <div
                    key={collection.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCollection === collection.id
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedCollection(collection.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="w-4 h-4" />
                        <span className="font-medium">{collection.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {collection.requests.length}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {collection.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Environment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {environments.map(env => (
                  <div
                    key={env.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      env.isActive
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      const updatedEnvs = environments.map(e => ({
                        ...e,
                        isActive: e.id === env.id
                      }));
                      saveEnvironments(updatedEnvs);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{env.name}</span>
                      {env.isActive && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Requests</span>
                </CardTitle>
                {selectedCollection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewRequest(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedCollection ? (
                <div className="space-y-2">
                  {currentCollection?.requests.map(request => (
                    <div
                      key={request.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRequest === request.id
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedRequest(request.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {request.method}
                          </Badge>
                          <span className="font-medium">{request.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            executeRequest(request);
                          }}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.url}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Select a collection to view requests
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5" />
                <span>Request Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentRequest ? (
                <div className="space-y-4">
                  <div>
                    <Label>Method</Label>
                    <Badge variant="outline" className="mt-1">
                      {currentRequest.method}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label>URL</Label>
                    <div className="p-2 bg-muted rounded text-sm font-mono break-all">
                      {currentRequest.url}
                    </div>
                  </div>

                  <div>
                    <Label>Headers</Label>
                    <div className="space-y-1 mt-1">
                      {Object.entries(currentRequest.headers).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2 text-sm">
                          <span className="font-mono bg-muted px-2 py-1 rounded">{key}</span>
                          <span className="text-muted-foreground">:</span>
                          <span className="font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {currentRequest.body && (
                    <div>
                      <Label>Body</Label>
                      <div className="p-2 bg-muted rounded text-sm font-mono mt-1">
                        {currentRequest.body}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => executeRequest(currentRequest)}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Execute
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Select a request to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Collection Modal */}
      {showNewCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Collection Name</Label>
                <Input
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="My API Collection"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="Collection description"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={createCollection} className="flex-1">
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewCollection(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Request Name</Label>
                  <Input
                    value={newRequestName}
                    onChange={(e) => setNewRequestName(e.target.value)}
                    placeholder="Get User Info"
                  />
                </div>
                <div>
                  <Label>Method</Label>
                  <Select value={newRequestMethod} onValueChange={(value: any) => setNewRequestMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>URL</Label>
                <Input
                  value={newRequestUrl}
                  onChange={(e) => setNewRequestUrl(e.target.value)}
                  placeholder="https://api.example.com/users/{{userId}}"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={newRequestDesc}
                  onChange={(e) => setNewRequestDesc(e.target.value)}
                  placeholder="Request description"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={createRequest} className="flex-1">
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewRequest(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Environment Modal */}
      {showEnvironment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Environment Variable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Variable Name</Label>
                <Input
                  value={newVariableKey}
                  onChange={(e) => setNewVariableKey(e.target.value)}
                  placeholder="baseUrl"
                />
              </div>
              <div>
                <Label>Variable Value</Label>
                <Input
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                  placeholder="https://api.example.com"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={createEnvironment} className="flex-1">
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEnvironment(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PostmanCollection;
