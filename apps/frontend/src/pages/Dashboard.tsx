import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Tag, 
  Archive, 
  Activity,
  Database,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Copy
} from 'lucide-react';
import { indexedDBService, APIConfig } from '../services/indexedDB';

const Dashboard = () => {
  const { qaName } = useAuth();
  const [savedAPIs, setSavedAPIs] = useState<APIConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAPIs: 0,
    recentComparisons: 0,
    totalTags: 0
  });
  const [editingAPI, setEditingAPI] = useState<APIConfig | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [apiToDelete, setApiToDelete] = useState<APIConfig | null>(null);

  // Load saved APIs from IndexedDB
  useEffect(() => {
    loadSavedAPIs();
  }, []);

  const loadSavedAPIs = async () => {
    try {
      setIsLoading(true);
      const apis = await indexedDBService.getAllAPIConfigs();
      
      // Show ALL configs (both auto-saved and manual)
      setSavedAPIs(apis);
      
      // Calculate stats
      const uniqueTags = new Set(apis.flatMap(api => api.tags));
      const autoSavedCount = apis.filter(api => api.tags.includes('auto-saved')).length;
      const manualSavedCount = apis.filter(api => api.tags.includes('manual-save')).length;
      
      setStats({
        totalAPIs: apis.length,
        recentComparisons: autoSavedCount + manualSavedCount,
        totalTags: uniqueTags.size
      });
    } catch (error) {
      console.error('Error loading saved APIs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAPIs = savedAPIs.filter(api =>
    api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExportData = async () => {
    try {
      const data = await indexedDBService.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cbz-api-delta-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await indexedDBService.importData(text);
      await loadSavedAPIs(); // Reload data
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data. Please check the file format.');
    }
  };

  // CRUD Operations
  const handleEditAPI = (api: APIConfig) => {
    setEditingAPI(api);
    setShowEditModal(true);
  };

  const handleUpdateAPI = async (updatedAPI: APIConfig) => {
    try {
      await indexedDBService.updateAPIConfig(updatedAPI.id, updatedAPI);
      await loadSavedAPIs();
      setShowEditModal(false);
      setEditingAPI(null);
    } catch (error) {
      console.error('Error updating API:', error);
      alert('Error updating API configuration');
    }
  };

  const handleDeleteAPI = async (api: APIConfig) => {
    setApiToDelete(api);
    setShowDeleteModal(true);
  };

  const confirmDeleteAPI = async () => {
    if (!apiToDelete) return;
    
    try {
      await indexedDBService.deleteAPIConfig(apiToDelete.id);
      await loadSavedAPIs();
      setShowDeleteModal(false);
      setApiToDelete(null);
    } catch (error) {
      console.error('Error deleting API:', error);
      alert('Error deleting API configuration');
    }
  };

  const handleCopyAPI = async (api: APIConfig) => {
    try {
      const newAPI = {
        ...api,
        id: crypto.randomUUID(),
        name: `${api.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await indexedDBService.saveAPIConfig(newAPI);
      await loadSavedAPIs();
    } catch (error) {
      console.error('Error copying API:', error);
      alert('Error copying API configuration');
    }
  };

  return (
    <div className="space-y-8 pt-6 px-6 max-w-7xl mx-auto">
      <div className="text-center py-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DeltaDB
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome back, {qaName}! Professional API Configuration Management & Comparison Hub.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-0">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="mr-2 h-4 w-4" />
              Saved APIs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{stats.totalAPIs}</div>
            <p className="text-xs text-muted-foreground">
              API configurations stored locally
            </p>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Active Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{stats.totalTags}</div>
            <p className="text-xs text-muted-foreground">
              Organized categories
            </p>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{stats.recentComparisons}</div>
            <p className="text-xs text-muted-foreground">
              Comparisons this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Moved to top for better UX */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-6 border border-gray-600/30">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">Quick Actions</h2>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <Link to="/deltapro">
              <Button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                <Plus className="mr-2 h-5 w-5" />
                New API Comparison
              </Button>
            </Link>
            <Button variant="outline" onClick={handleExportData} className="px-6 py-3">
              <Download className="mr-2 h-5 w-5" />
              Export All Data
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <Button variant="outline" asChild className="px-6 py-3">
                <span>
                  <Upload className="mr-2 h-5 w-5" />
                  Import Data
                </span>
              </Button>
            </label>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search APIs by name, URL, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-600 text-gray-100"
            />
          </div>
        </div>
      </div>

              {/* API Configurations - Consolidated Section */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-600/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-100">API Configurations</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {savedAPIs.length} Total
              </Badge>
              <Badge variant="outline" className="text-xs">
                {savedAPIs.filter(api => api.tags.includes('auto-saved')).length} Auto-saved
              </Badge>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground mt-4 text-base">Loading saved APIs...</p>
            </div>
          ) : filteredAPIs.length === 0 ? (
            <Card className="text-center py-16 px-8">
              <Archive className="h-20 w-20 text-muted-foreground mx-auto mb-8" />
              <h3 className="text-2xl font-semibold mb-4">No APIs saved yet</h3>
              <p className="text-muted-foreground mb-8 text-base">
                Start by using DeltaPro+ - it will auto-save everything!
              </p>
              <Link to="/deltapro">
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Start Using DeltaPro+
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAPIs.map((api) => (
                <Card key={api.id} className="hover:shadow-md transition-shadow p-0">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                          {api.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {api.method} • {api.url}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {api.method}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 px-4">
                    <div className="space-y-3">
                      <div className="text-xs">
                        <span className="text-muted-foreground font-medium">URL:</span>
                        <p className="truncate font-mono bg-gray-800/50 px-2 py-1 rounded mt-1">{api.url}</p>
                      </div>
                      
                      {/* Headers Section */}
                      {Object.keys(api.headers).length > 0 && (
                        <div className="text-xs">
                          <span className="text-muted-foreground font-medium">Headers:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(api.headers).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2 bg-gray-800/50 px-2 py-1 rounded">
                                <span className="font-mono text-blue-300">{key}:</span>
                                <span className="truncate text-gray-300">{value}</span>
                              </div>
                            ))}
                            {Object.keys(api.headers).length > 3 && (
                              <div className="text-gray-500 text-xs px-2">
                                +{Object.keys(api.headers).length - 3} more headers
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {api.description && (
                        <div className="text-xs">
                          <span className="text-muted-foreground font-medium">Description:</span>
                          <p className="text-gray-300 mt-1">{api.description}</p>
                        </div>
                      )}
                      
                      {api.tags.length > 0 && (
                        <div className="text-xs">
                          <span className="text-muted-foreground font-medium">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {api.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 px-4 pb-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(api.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyAPI(api)}
                          title="Copy API Configuration"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAPI(api)}
                          title="Edit API Configuration"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAPI(api)}
                          title="Delete API Configuration"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Link to={`/deltapro?load=${api.id}`}>
                          <Button variant="ghost" size="sm" title="Use in DeltaPro+">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>



      {/* Edit API Modal */}
      {showEditModal && editingAPI && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Edit API Configuration</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <Input
                    value={editingAPI.name}
                    onChange={(e) => setEditingAPI({ ...editingAPI, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                  <Input
                    value={editingAPI.url}
                    onChange={(e) => setEditingAPI({ ...editingAPI, url: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <Input
                    value={editingAPI.description || ''}
                    onChange={(e) => setEditingAPI({ ...editingAPI, description: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                  <Input
                    value={editingAPI.tags.join(', ')}
                    onChange={(e) => setEditingAPI({ ...editingAPI, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })}
                    className="bg-gray-800 border-gray-600 text-gray-100"
                  />
                </div>
              </div>

              {/* Headers Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">Headers</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newHeaders = { ...editingAPI.headers };
                      newHeaders[`header_${Object.keys(newHeaders).length + 1}`] = '';
                      setEditingAPI({ ...editingAPI, headers: newHeaders });
                    }}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Header
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {Object.entries(editingAPI.headers).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newHeaders = { ...editingAPI.headers };
                          const newKey = e.target.value;
                          if (newKey !== key) {
                            delete newHeaders[key];
                            newHeaders[newKey] = value;
                            setEditingAPI({ ...editingAPI, headers: newHeaders });
                          }
                        }}
                        placeholder="Header key"
                        className="bg-gray-800 border-gray-600 text-gray-100 text-xs"
                      />
                      <Input
                        value={value}
                        onChange={(e) => {
                          const newHeaders = { ...editingAPI.headers };
                          newHeaders[key] = e.target.value;
                          setEditingAPI({ ...editingAPI, headers: newHeaders });
                        }}
                        placeholder="Header value"
                        className="bg-gray-800 border-gray-600 text-gray-100 text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newHeaders = { ...editingAPI.headers };
                          delete newHeaders[key];
                          setEditingAPI({ ...editingAPI, headers: newHeaders });
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 px-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => handleUpdateAPI(editingAPI)}
                className="flex-1"
              >
                Update API
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAPI(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && apiToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Delete API Configuration</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{apiToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={confirmDeleteAPI}
                variant="destructive"
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setApiToDelete(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
