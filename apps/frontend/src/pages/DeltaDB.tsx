import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Database,
  Download,
  Upload,
  Edit,
  Trash2,
  Copy,
  Globe,
  Route,
  Filter,
  Clock,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { indexedDBService } from '@/services/indexedDB';

// Data Types
interface BaseURL {
  id: string;
  name: string;
  url: string;
  environment: 'production' | 'staging' | 'development' | 'testing';
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

interface Endpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  category: string;
  tags: string[];
  description?: string;
  parameters?: string[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

interface HeaderTemplate {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'mobile' | 'web' | 'custom';
  headers: Record<string, string>;
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

const DeltaDB = () => {
  const { qaName } = useAuth();
  const [activeCluster, setActiveCluster] = useState<'baseUrls' | 'endpoints' | 'headers'>('baseUrls');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'usageCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Data Collections
  const [baseUrls, setBaseUrls] = useState<BaseURL[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [headerTemplates, setHeaderTemplates] = useState<HeaderTemplate[]>([]);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  
  // Form States
  const [newItem, setNewItem] = useState<any>({});

  // Initialize IndexedDB and load data
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await indexedDBService.initDB();
      
      // Check if we have data, if not load sample data
      const existingBaseUrls = await indexedDBService.getBaseUrls();
      const existingEndpoints = await indexedDBService.getEndpoints();
      const existingHeaders = await indexedDBService.getHeaders();
      
      if (existingBaseUrls.length === 0 && existingEndpoints.length === 0 && existingHeaders.length === 0) {
        await loadSampleData();
      } else {
        setBaseUrls(existingBaseUrls);
        setEndpoints(existingEndpoints);
        setHeaderTemplates(existingHeaders);
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Fallback to sample data
      loadSampleData();
    }
  };

  const loadSampleData = async () => {
    // Sample Base URLs (only loaded if no data exists)
    const sampleBaseUrls: BaseURL[] = [
      {
        id: crypto.randomUUID(),
        name: 'Cricbuzz Production',
        url: 'https://apiserver.cricbuzz.com',
        environment: 'production' as const,
        tags: ['cricbuzz', 'production', 'live'],
        description: 'Main production API server for live cricket data',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: crypto.randomUUID(),
        name: 'Cricbuzz Staging',
        url: 'http://api.cricbuzz.stg',
        environment: 'staging' as const,
        tags: ['cricbuzz', 'staging', 'testing'],
        description: 'Staging environment for testing new features',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: crypto.randomUUID(),
        name: 'Cricbuzz Development',
        url: 'http://localhost:3000',
        environment: 'development' as const,
        tags: ['cricbuzz', 'development', 'local'],
        description: 'Local development server',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      }
    ];

    // Sample Endpoints (only loaded if no data exists)
    const sampleEndpoints: Endpoint[] = [
      {
        id: crypto.randomUUID(),
        name: 'Venues API',
        path: '/venues/v1/{id}',
        method: 'GET' as const,
        category: 'Venues',
        tags: ['venues', 'cricket', 'stadiums'],
        description: 'Get venue information by ID',
        parameters: ['id'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: crypto.randomUUID(),
        name: 'Videos API',
        path: '/a/videos/v1/plain-detail/{id}',
        method: 'GET' as const,
        category: 'Videos',
        tags: ['videos', 'content', 'media'],
        description: 'Get video details by ID',
        parameters: ['id'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: crypto.randomUUID(),
        name: 'Matches API',
        path: '/m/matches/v1/scorecard/{id}',
        method: 'GET' as const,
        category: 'Matches',
        tags: ['matches', 'scorecard', 'live'],
        description: 'Get live match scorecard',
        parameters: ['id'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      }
    ];

    // Sample Header Templates (only loaded if no data exists)
    const sampleHeaders: HeaderTemplate[] = [
      {
        id: crypto.randomUUID(),
        name: 'iOS Headers',
        platform: 'ios' as const,
        headers: {
          'accept': 'application/json',
          'cb-loc': 'IN',
          'cb-tz': '+0530',
          'cb-appver': '15.8',
          'user-agent': 'CricbuzzMobile/15.8 (com.sports.iCric; build:198; iOS 17.7.1) Alamofire/4.9.1'
        },
        tags: ['ios', 'mobile', 'cricbuzz'],
        description: 'Standard iOS headers for Cricbuzz API',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: crypto.randomUUID(),
        name: 'Android Headers',
        platform: 'android' as const,
        headers: {
          'accept': 'application/json',
          'cb-loc': 'IN',
          'cb-tz': '+0530',
          'cb-appver': '6.23.05',
          'cb-src': 'playstore',
          'user-agent': 'okhttp/4.12.0'
        },
        tags: ['android', 'mobile', 'cricbuzz'],
        description: 'Standard Android headers for Cricbuzz API',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: crypto.randomUUID(),
        name: 'Web Headers',
        platform: 'web' as const,
        headers: {
          'accept': 'application/json, text/plain, */*',
          'cb-loc': 'IN',
          'cb-tz': '+0530',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        tags: ['web', 'browser', 'cricbuzz'],
        description: 'Standard web browser headers',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      }
    ];

    try {
      // Save to IndexedDB and update state
      for (const baseUrl of sampleBaseUrls) {
        await indexedDBService.addBaseUrl(baseUrl);
      }
      for (const endpoint of sampleEndpoints) {
        await indexedDBService.addEndpoint(endpoint);
      }
      for (const header of sampleHeaders) {
        await indexedDBService.addHeader(header);
      }

      // Update state with real data from IndexedDB
      setBaseUrls(sampleBaseUrls);
      setEndpoints(sampleEndpoints);
      setHeaderTemplates(sampleHeaders);

      console.log('✅ Sample data loaded and saved to IndexedDB');
    } catch (error) {
      console.error('❌ Failed to save sample data to IndexedDB:', error);
    }
  };

  // CRUD Operations
  const handleAddItem = () => {
    setNewItem({
      name: '',
      description: '',
      tags: [],
      environment: 'development',
      platform: 'custom',
      method: 'GET',
      category: '',
      path: '',
      url: '',
      headers: {}
    });
    setShowAddModal(true);
  };

  const handleSaveItem = async () => {
    if (!newItem.name.trim()) return;
    
    const item = {
      ...newItem,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };

    try {
      if (activeCluster === 'baseUrls') {
        await indexedDBService.addBaseUrl(item);
        setBaseUrls(prev => [...prev, item]);
      } else if (activeCluster === 'endpoints') {
        await indexedDBService.addEndpoint(item);
        setEndpoints(prev => [...prev, item]);
      } else if (activeCluster === 'headers') {
        await indexedDBService.addHeader(item);
        setHeaderTemplates(prev => [...prev, item]);
      }

      setShowAddModal(false);
      setNewItem({});
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem?.name?.trim()) return;
    
    const updatedItem = {
      ...editingItem,
      updatedAt: new Date().toISOString()
    };

    try {
      if (activeCluster === 'baseUrls') {
        await indexedDBService.updateBaseUrl(updatedItem.id, updatedItem);
        setBaseUrls(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      } else if (activeCluster === 'endpoints') {
        await indexedDBService.updateEndpoint(updatedItem.id, updatedItem);
        setEndpoints(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      } else if (activeCluster === 'headers') {
        await indexedDBService.updateHeader(updatedItem.id, updatedItem);
        setHeaderTemplates(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      }

      setShowEditModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await indexedDBService.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deltadb-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      await indexedDBService.importData(data);
      
      // Reload data from database
      const newBaseUrls = await indexedDBService.getBaseUrls();
      const newEndpoints = await indexedDBService.getEndpoints();
      const newHeaders = await indexedDBService.getHeaders();
      
      setBaseUrls(newBaseUrls);
      setEndpoints(newEndpoints);
      setHeaderTemplates(newHeaders);
      
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleClearData = async () => {
    const confirmed = confirm('⚠️ This will delete ALL data from DeltaDB. Are you sure?');
    if (!confirmed) return;

    try {
      // Clear IndexedDB
      await indexedDBService.importData({ baseUrls: [], endpoints: [], headers: [], apiConfigs: [] });
      
      // Clear state
      setBaseUrls([]);
      setEndpoints([]);
      setHeaderTemplates([]);
      
      // Reload fresh sample data
      await loadSampleData();
      
      alert('✅ Database reset successfully! Fresh sample data loaded.');
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('❌ Failed to reset database. Please try again.');
    }
  };

  const handleDeleteItem = (item: any) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    
    if (activeCluster === 'baseUrls') {
      setBaseUrls(prev => prev.filter(item => item.id !== itemToDelete.id));
    } else if (activeCluster === 'endpoints') {
      setEndpoints(prev => prev.filter(item => item.id !== itemToDelete.id));
    } else if (activeCluster === 'headers') {
      setHeaderTemplates(prev => prev.filter(item => item.id !== itemToDelete.id));
    }
    
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleCopyItem = (item: any) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      name: `${item.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };

    if (activeCluster === 'baseUrls') {
      setBaseUrls(prev => [...prev, newItem]);
    } else if (activeCluster === 'endpoints') {
      setEndpoints(prev => [...prev, newItem]);
    } else if (activeCluster === 'headers') {
      setHeaderTemplates(prev => [...prev, newItem]);
    }
  };

  // Search, Filter, and Sort
  const getSortedAndFilteredItems = (items: any[]) => {
    let filtered = items;
    
    // Apply search filter
    if (searchQuery) {
      filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const filteredBaseUrls = getSortedAndFilteredItems(baseUrls);
  const filteredEndpoints = getSortedAndFilteredItems(endpoints);
  const filteredHeaders = getSortedAndFilteredItems(headerTemplates);

  // Get current cluster data
  const getCurrentClusterData = () => {
    switch (activeCluster) {
      case 'baseUrls': return filteredBaseUrls;
      case 'endpoints': return filteredEndpoints;
      case 'headers': return filteredHeaders;
      default: return [];
    }
  };

  const currentData = getCurrentClusterData();

  // Cluster configuration
  const clusters = [
    {
      key: 'baseUrls',
      icon: Globe,
      label: 'Base URLs',
      count: baseUrls.length,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      key: 'endpoints',
      icon: Route,
      label: 'Endpoints',
      count: endpoints.length,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      key: 'headers',
      icon: Filter,
      label: 'Headers',
      count: headerTemplates.length,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <Database className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              DeltaDB
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Welcome back, {qaName}! Professional API Component Management & Organization Hub.
          </p>
        </motion.div>

        {/* Real-time Metrics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total APIs */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total APIs</p>
                <p className="text-3xl font-bold">{baseUrls.length + endpoints.length + headerTemplates.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-200" />
            </div>
          </motion.div>

          {/* Most Used */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Most Used</p>
                <p className="text-3xl font-bold">
                  {Math.max(...baseUrls.map(u => u.usageCount), ...endpoints.map(e => e.usageCount), ...headerTemplates.map(h => h.usageCount))}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-200" />
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Recent Activity</p>
                <p className="text-3xl font-bold">
                  {baseUrls.filter(u => new Date(u.updatedAt) > new Date(Date.now() - 24*60*60*1000)).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-200" />
            </div>
          </motion.div>

          {/* Health Score */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Health Score</p>
                <p className="text-3xl font-bold">
                  {Math.round((baseUrls.filter(u => u.environment === 'production').length / Math.max(baseUrls.length, 1)) * 100)}%
                </p>
              </div>
              <Zap className="w-8 h-8 text-orange-200" />
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-600"
        >
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Base URLs: {baseUrls.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Endpoints: {endpoints.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Headers: {headerTemplates.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Total Usage: {baseUrls.reduce((sum, u) => sum + u.usageCount, 0) + endpoints.reduce((sum, e) => sum + e.usageCount, 0) + headerTemplates.reduce((sum, h) => sum + h.usageCount, 0)}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Quick Actions</h2>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAddItem}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New
              </Button>
              <Button 
                variant="outline" 
                className="px-6 py-3"
                onClick={handleExportData}
              >
                <Download className="mr-2 h-5 w-5" />
                Export
              </Button>
              <Button 
                variant="outline" 
                className="px-6 py-3"
                onClick={() => document.getElementById('importFile')?.click()}
              >
                <Upload className="mr-2 h-5 w-5" />
                Import
              </Button>
              <Button 
                variant="outline" 
                className="px-6 py-3 text-red-600 hover:text-red-700"
                onClick={handleClearData}
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Reset DB
              </Button>
              <input
                id="importFile"
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search across all collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400"
            />
          </div>
        </motion.div>

        {/* Cluster Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {clusters.map((cluster) => (
                <motion.button
                  key={cluster.key}
                  onClick={() => setActiveCluster(cluster.key as any)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeCluster === cluster.key 
                      ? `bg-gradient-to-r ${cluster.color} text-white shadow-lg transform scale-105` 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <cluster.icon className="h-5 w-5" />
                  <span className="font-medium">{cluster.label}</span>
                  <Badge variant="secondary" className={`ml-2 ${
                    activeCluster === cluster.key ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {cluster.count}
                  </Badge>
                </motion.button>
              ))}
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3 py-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-sm focus:outline-none px-2 py-1"
                >
                  <option value="name">Name</option>
                  <option value="createdAt">Created</option>
                  <option value="updatedAt">Updated</option>
                  <option value="usageCount">Usage</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCluster}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              <AnimatePresence>
                {currentData.map((item: any, index: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      y: -5, 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                                         <Card className={`h-full hover:shadow-2xl transition-all duration-300 border-2 ${
                       activeCluster === 'baseUrls' ? 'hover:border-blue-300 dark:hover:border-blue-600' :
                       activeCluster === 'endpoints' ? 'hover:border-purple-300 dark:hover:border-purple-600' :
                       'hover:border-orange-300 dark:hover:border-orange-600'
                     } bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden`}>
                       {/* Usage Indicator Bar */}
                       <div className={`absolute top-0 left-0 right-0 h-1 ${
                         item.usageCount > 100 ? 'bg-green-500' :
                         item.usageCount > 50 ? 'bg-yellow-500' :
                         'bg-gray-400'
                       }`}></div>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
                              {item.name}
                            </CardTitle>
                            {activeCluster === 'baseUrls' && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                {item.url}
                              </p>
                            )}
                            {activeCluster === 'endpoints' && (
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs font-mono">
                                  {item.method}
                                </Badge>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {item.path}
                                </p>
                              </div>
                            )}
                            {activeCluster === 'headers' && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Platform: {item.platform}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            {activeCluster === 'baseUrls' && (
                              <Badge 
                                variant={item.environment === 'production' ? 'default' : 'secondary'}
                                className={`${
                                  item.environment === 'production' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  item.environment === 'staging' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}
                              >
                                {item.environment}
                              </Badge>
                            )}
                            {activeCluster === 'endpoints' && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {item.category}
                              </Badge>
                            )}
                            {activeCluster === 'headers' && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                {item.platform}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {item.usageCount} uses
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-3">
                        <div className="space-y-3">
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.description}
                            </p>
                          )}
                          
                          {activeCluster === 'endpoints' && item.parameters && item.parameters.length > 0 && (
                            <div className="text-xs">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">Parameters:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.parameters.map((param: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                    {param}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {activeCluster === 'headers' && (
                            <div className="text-xs">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">Headers:</span>
                              <div className="mt-1 space-y-1">
                                {Object.entries(item.headers).slice(0, 3).map(([key, value]) => (
                                  <div key={key} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                                    <span className="font-mono text-blue-600 dark:text-blue-400">{key}:</span>
                                    <span className="truncate text-gray-600 dark:text-gray-300">{String(value)}</span>
                                  </div>
                                ))}
                                {Object.keys(item.headers).length > 3 && (
                                  <div className="text-gray-500 text-xs px-2">
                                    +{Object.keys(item.headers).length - 3} more headers
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-3 flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyItem(item)}
                              title="Copy Item"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              title="Edit Item"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 transition-all duration-200"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item)}
                              title="Delete Item"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Add New Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Add New {activeCluster === 'baseUrls' ? 'Base URL' : activeCluster === 'endpoints' ? 'Endpoint' : 'Header Template'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <Input
                    value={newItem.name || ''}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <Input
                    value={newItem.description || ''}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Enter description"
                    className="w-full"
                  />
                </div>

                {/* Cluster-specific fields */}
                {activeCluster === 'baseUrls' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        URL *
                      </label>
                      <Input
                        value={newItem.url || ''}
                        onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                        placeholder="https://api.example.com"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Environment
                      </label>
                      <select
                        value={newItem.environment || 'development'}
                        onChange={(e) => setNewItem({ ...newItem, environment: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      >
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                        <option value="testing">Testing</option>
                      </select>
                    </div>
                  </>
                )}

                {activeCluster === 'endpoints' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Path *
                      </label>
                      <Input
                        value={newItem.path || ''}
                        onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                        placeholder="/api/v1/endpoint"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Method
                      </label>
                      <select
                        value={newItem.method || 'GET'}
                        onChange={(e) => setNewItem({ ...newItem, method: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <Input
                        value={newItem.category || ''}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        placeholder="e.g., Venues, Videos, Matches"
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                {activeCluster === 'headers' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Platform
                      </label>
                      <select
                        value={newItem.platform || 'custom'}
                        onChange={(e) => setNewItem({ ...newItem, platform: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      >
                        <option value="ios">iOS</option>
                        <option value="android">Android</option>
                        <option value="mobile">Mobile Web</option>
                        <option value="web">Web</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={newItem.tags?.join(', ') || ''}
                    onChange={(e) => setNewItem({ ...newItem, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                    placeholder="cricbuzz, production, live"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSaveItem}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Save Item
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Edit {activeCluster === 'baseUrls' ? 'Base URL' : activeCluster === 'endpoints' ? 'Endpoint' : 'Header Template'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <Input
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <Input
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Enter description"
                    className="w-full"
                  />
                </div>

                {/* Cluster-specific fields */}
                {activeCluster === 'baseUrls' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        URL *
                      </label>
                      <Input
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        placeholder="https://api.example.com"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Environment
                      </label>
                      <select
                        value={editingItem.environment || 'development'}
                        onChange={(e) => setEditingItem({ ...editingItem, environment: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      >
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                        <option value="testing">Testing</option>
                      </select>
                    </div>
                  </>
                )}

                {activeCluster === 'endpoints' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Path *
                      </label>
                      <Input
                        value={editingItem.path || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, path: e.target.value })}
                        placeholder="/api/v1/endpoint"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Method
                      </label>
                      <select
                        value={editingItem.method || 'GET'}
                        onChange={(e) => setEditingItem({ ...editingItem, method: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <Input
                        value={editingItem.category || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        placeholder="e.g., Venues, Videos, Matches"
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                {activeCluster === 'headers' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Platform
                      </label>
                      <select
                        value={editingItem.platform || 'custom'}
                        onChange={(e) => setEditingItem({ ...editingItem, platform: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      >
                        <option value="ios">iOS</option>
                        <option value="android">Android</option>
                        <option value="mobile">Mobile Web</option>
                        <option value="web">Web</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={editingItem.tags?.join(', ') || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                    placeholder="cricbuzz, production, live"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleUpdateItem}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Update Item
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && itemToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Delete Item</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{itemToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={confirmDeleteItem}
                  variant="destructive"
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
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
    </div>
  );
};

export default DeltaDB;
