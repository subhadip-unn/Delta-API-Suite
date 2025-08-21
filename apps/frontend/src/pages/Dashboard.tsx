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
  Upload
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Management Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {qaName}! Manage your API configurations and comparison history.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="mr-2 h-4 w-4" />
              Saved APIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAPIs}</div>
            <p className="text-xs text-muted-foreground">
              API configurations stored locally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Active Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTags}</div>
            <p className="text-xs text-muted-foreground">
              Organized categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentComparisons}</div>
            <p className="text-xs text-muted-foreground">
              Comparisons this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search APIs by name, URL, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </span>
            </Button>
          </label>
          <Link to="/deltapro">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Comparison
            </Button>
          </Link>
        </div>
      </div>

              {/* Recent Auto-saved Configurations */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Auto-saved Configurations</h2>
          {(() => {
            const autoSavedAPIs = savedAPIs.filter(api => api.tags.includes('auto-saved'));
            return autoSavedAPIs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {autoSavedAPIs.slice(0, 6).map((api) => (
                  <Card key={api.id} className="hover:shadow-md transition-shadow border-blue-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            {api.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {api.method} • {api.url}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
                          Auto-saved
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="text-muted-foreground">URL:</span>
                          <p className="truncate font-mono">{api.url}</p>
                        </div>
                        {api.description && (
                          <p className="text-xs text-muted-foreground">
                            {api.description}
                          </p>
                        )}
                        <div className="flex gap-1">
                          {api.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                        <span>Saved {new Date(api.createdAt).toLocaleTimeString()}</span>
                        <Link to={`/deltapro?load=${api.id}`}>
                          <Button variant="ghost" size="sm">
                            Use in DeltaPro+
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <div className="text-center py-6">
                  <Database className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-base text-muted-foreground mb-2">
                DeltaPro+ automatically saves your API configurations every 2 seconds
              </p>
              <p className="text-sm text-muted-foreground">
                These are stored locally and can be loaded anytime
              </p>
                </div>
              </Card>
            );
          })()}
        </div>

        {/* Saved APIs List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Saved API Configurations</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading saved APIs...</p>
            </div>
          ) : filteredAPIs.length === 0 ? (
            <Card className="text-center py-12">
              <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3">No APIs saved yet</h3>
              <p className="text-muted-foreground mb-6 text-base">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAPIs.map((api) => (
                <Card key={api.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
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
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="text-muted-foreground">URL:</span>
                        <p className="truncate font-mono">{api.url}</p>
                      </div>
                      {api.description && (
                        <p className="text-xs text-muted-foreground">
                          {api.description}
                        </p>
                      )}
                      {api.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {api.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                      <span>Updated {new Date(api.updatedAt).toLocaleDateString()}</span>
                      <Link to={`/deltapro?load=${api.id}`}>
                        <Button variant="ghost" size="sm">
                          Use in DeltaPro+
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

      {/* Quick Actions */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/deltapro">
            <Button>New API Comparison</Button>
          </Link>
          <Link to="/upload">
            <Button variant="outline">Upload Report</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
