import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Settings,

  Search,
  Download,
  Upload,
  Edit3,
  Trash2,
  Eye,
  HardDrive,
  Activity,
  Users as UsersIcon,
  BarChart3 as BarChart3Icon,
  Save,
  X,
  FileText,
  Layers,
  User,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserSessionService } from '../services/UserSessionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';

// Simple and clean data structure
interface StorageItem {
  key: string;
  value: any;
  size: number;
  lastModified: string;
  namespace: string;
}

const DeltaDB: React.FC = () => {
  const { qaName, userRole } = useAuth();
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemKey, setNewItemKey] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemNamespace, setNewItemNamespace] = useState('user');
  const [error, setError] = useState<string | null>(null);
  const [storageData, setStorageData] = useState<StorageItem[]>([]);
  const { toast } = useToast();

  // Get all localStorage data for current user only
  const getAllStorageData = (): StorageItem[] => {
    const items: StorageItem[] = [];
    
    // Initialize default data if it doesn't exist
    initializeDefaultData();
    
    // Get user-specific keys only
    const userKeys = UserSessionService.getUserStorageKeys();
    
    // Also include essential system keys for current user
    const essentialKeys = ['cbz-qa-name', 'cbz-user-role', 'cbz-user-session'];
    
    const allKeysToProcess = [...userKeys, ...essentialKeys];
    
    for (const key of allKeysToProcess) {
      if (key && localStorage.getItem(key)) {
        try {
          let parsedValue;
          let size = 0;

          // Handle special cases for user data
          if (key === 'cbz-qa-name' || key === 'cbz-user-role') {
            const value = localStorage.getItem(key);
            parsedValue = value;
            size = value ? value.length : 0;
          } else {
            const value = localStorage.getItem(key);
            if (value) {
              try {
                parsedValue = JSON.parse(value);
                size = JSON.stringify(parsedValue).length;
              } catch {
                parsedValue = value;
                size = value.length;
              }
            }
          }
          
          if (parsedValue !== null && parsedValue !== undefined) {
            items.push({
              key,
              value: parsedValue,
              size: size,
              lastModified: new Date().toISOString(),
              namespace: getNamespaceForKey(key)
            });
          }
        } catch (error) {
          console.warn(`Error processing localStorage key ${key}:`, error);
        }
      }
    }
    
    return items;
  };

  // Initialize storage data on component mount
  useEffect(() => {
    setStorageData(getAllStorageData());
  }, []);

  // Initialize default data if it doesn't exist (user-specific)
  const initializeDefaultData = () => {
    try {
      // Initialize theme preference if none exists
      if (!localStorage.getItem('cbz-theme-preference')) {
        localStorage.setItem('cbz-theme-preference', 'dark');
      }
      
      // Initialize default platform headers if none exist for current user
      const platformHeadersKey = UserSessionService.getUserStorageKey('deltadb-platform-headers');
      if (!localStorage.getItem(platformHeadersKey)) {
        const defaultHeaders = [
          {
            id: 'headers-ios',
            name: 'iOS Default Headers',
            platform: 'ios',
            headers: {
              'accept': 'application/json',
              'cb-loc': 'IN',
              'cb-tz': '+0530',
              'cb-appver': '15.8',
              'user-agent': 'CricbuzzMobile/15.8 (com.sports.iCric; build:198; iOS 17.7.1) Alamofire/4.9.1'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'headers-android',
            name: 'Android Default Headers',
            platform: 'android',
            headers: {
              'accept': 'application/json',
              'cb-loc': 'IN',
              'cb-appver': '6.23.05',
              'cb-src': 'playstore',
              'user-agent': 'okhttp/4.12.0'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'headers-mobile',
            name: 'Mobile Web Default Headers',
            platform: 'mobile',
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'cb-loc': 'IN',
              'cb-tz': '+0530',
              'user-agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'headers-web',
            name: 'Web Default Headers',
            platform: 'web',
            headers: {
              'accept': 'application/json, text/plain, */*',
              'cb-loc': 'IN',
              'cb-tz': '+0530',
              'user-agent': 'Mozilla/5.0 (X11; Linux x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem(platformHeadersKey, JSON.stringify(defaultHeaders));
      }

      // Initialize default base URLs if none exist for current user
      const baseURLsKey = UserSessionService.getUserStorageKey('deltadb-base-urls');
      if (!localStorage.getItem(baseURLsKey)) {
        const defaultBaseURLs = [
          {
            id: 'baseurl-prod',
            name: 'Cricbuzz Production',
            url: 'https://apiserver.cricbuzz.com',
            environment: 'production',
            tags: ['cricbuzz', 'production', 'api'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'baseurl-staging',
            name: 'CCricbuzz Staging',
            url: 'http://api.cricbuzz.stg',
            environment: 'staging',
            tags: ['cricbuzz', 'staging', 'api'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem(baseURLsKey, JSON.stringify(defaultBaseURLs));
      }

      // Initialize default endpoints if none exist for current user
      const endpointsKey = UserSessionService.getUserStorageKey('deltadb-endpoints');
      if (!localStorage.getItem(endpointsKey)) {
        const defaultEndpoints = [
          {
            id: 'endpoint-users',
            name: 'Get User Details',
            path: '/v1/users',
            method: 'GET',
            tags: ['users', 'get', 'v1'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'endpoint-videos',
            name: 'Get Video Details',
            path: '/a/videos/v1/plain-detail',
            method: 'GET',
            tags: ['videos', 'get', 'v1'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem(endpointsKey, JSON.stringify(defaultEndpoints));
      }

      // Clean up any old redundant keys
      localStorage.removeItem('deltadb-platform-headers');
      localStorage.removeItem('deltadb-base-urls');
      localStorage.removeItem('deltadb-endpoints');
      localStorage.removeItem('deltapro-saved-base-urls');
      localStorage.removeItem('deltapro-saved-endpoints');
      localStorage.removeItem('deltadb-last-change'); // Remove the confusing tracking key
      
    } catch (error) {
      console.error('Failed to initialize default data:', error);
    }
  };

  // Simple namespace detection
  const getNamespaceForKey = (key: string): string => {
    if (key.startsWith('cbz-') || key === 'darkMode' || key === 'theme' || key === 'cbz-theme-preference') return 'user';
    if (key.startsWith('deltapro-') || key.startsWith('deltadb-') || key.startsWith('user_data_')) return 'deltapro';
    if (key.startsWith('cbzApiDelta')) return 'system';
    return 'other';
  };

  // Get namespace items
  const getNamespaceItems = (namespace: string): StorageItem[] => {
    return storageData.filter(item => item.namespace === namespace);
  };

  // Get namespace info
  const getNamespaceInfo = (namespace: string) => {
    const configs = {
      user: { name: 'User Settings', description: 'Personal preferences and user data', icon: <User className="w-5 h-5" />, color: 'from-blue-500 to-blue-600' },
      deltapro: { name: 'DeltaPro+', description: 'API comparison tool data', icon: <BarChart3Icon className="w-5 h-5" />, color: 'from-green-500 to-green-600' },
      system: { name: 'System', description: 'Application system data', icon: <Settings className="w-5 h-5" />, color: 'from-purple-500 to-purple-600' },
      other: { name: 'Other', description: 'Miscellaneous data', icon: <Database className="w-5 h-5" />, color: 'from-gray-500 to-gray-600' }
    };
    return configs[namespace as keyof typeof configs] || configs.other;
  };

  // Check if item is protected (non-deletable)
  const isProtectedItem = (key: string): boolean => {
    // Check for platform headers (both old and new user-specific keys)
    if (key === 'deltadb-platform-headers' || key.includes('platform-headers')) {
      return true;
    }
    
    // Check for user settings
    if (key === 'cbz-qa-name' || key === 'cbz-user-role' || key === 'cbz-user-session') {
      return true;
    }
    
    // Check for redundant keys
    if (key.startsWith('deltapro-saved-')) {
      return true;
    }
    
    return false;
  };

  // Get item display info
  const getItemDisplayInfo = (item: StorageItem) => {
    const isProtected = isProtectedItem(item.key);
    const isPlatformHeaders = item.key.includes('platform-headers');
    const isUserData = item.key.startsWith('user_data_');
    
    return {
      isProtected,
      isPlatformHeaders,
      isUserData,
      badgeColor: isPlatformHeaders ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 
                  isUserData ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  isProtected ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 
                  'bg-gray-500/20 text-gray-300 border-gray-500/30',
      badgeText: isPlatformHeaders ? 'Default Headers' : 
                 isUserData ? 'User Data' :
                 isProtected ? 'Protected' : 
                 'Standard'
    };
  };

  // Get storage stats
  const getStorageStats = () => {
    const totalSize = storageData.reduce((sum, item) => sum + item.size, 0);
    
    return {
      totalItems: storageData.length,
      totalSize,
      namespaces: {
        user: getNamespaceItems('user').length,
        deltapro: getNamespaceItems('deltapro').length,
        system: getNamespaceItems('system').length,
        other: getNamespaceItems('other').length
      }
    };
  };

  // Handle edit item
  const handleEditItem = (item: StorageItem) => {
    setEditingItem(item);
    if (typeof item.value === 'string' || typeof item.value === 'number' || typeof item.value === 'boolean') {
      setEditValue(String(item.value));
    } else {
      setEditValue(JSON.stringify(item.value, null, 2));
    }
    setShowEditModal(true);
  };

    // Handle save edit
  const handleSaveEdit = () => {
    if (!editingItem) return;

    try {
      let newValue;

      // Handle special cases for user data
      if (editingItem.key === 'cbz-qa-name' || editingItem.key === 'cbz-user-role') {
        // For names and roles, store as plain string without JSON wrapping
        newValue = editValue.trim();

        // Validate name format for cbz-qa-name
        if (editingItem.key === 'cbz-qa-name') {
          const nameRegex = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*[a-zA-Z0-9]+$/;
          if (!nameRegex.test(newValue)) {
            setShowEditModal(false);
            setEditingItem(null);
            setEditValue('');
            // Show custom error instead of alert
            setError(`Invalid name format. Only alphanumeric characters and dots allowed. Dots cannot be at start or end.`);
            return;
          }
        }
      } else {
        // For other data, try to parse as JSON, fallback to string
        try {
          newValue = JSON.parse(editValue);
        } catch {
          newValue = editValue;
        }
      }

      // Store the value directly without double JSON.stringify
      if (editingItem.key === 'cbz-qa-name' || editingItem.key === 'cbz-user-role') {
        localStorage.setItem(editingItem.key, newValue);
      } else {
        // Store in user-specific key
        const userKey = UserSessionService.getUserStorageKey(editingItem.key);
        localStorage.setItem(userKey, JSON.stringify(newValue));
        
        // Remove old global key if it exists
        if (localStorage.getItem(editingItem.key)) {
          localStorage.removeItem(editingItem.key);
        }
      }

      setShowEditModal(false);
      setEditingItem(null);
      setEditValue('');
      setSelectedItem(null);
      setError(null);
      notifyDataChange('edit', editingItem.key);
      // Refresh data to show updated values
      setStorageData(getAllStorageData());
    } catch (error) {
      console.error('Failed to save:', error);
      setError('Failed to save changes. Please try again.');
    }
  };

  // Notify other components about data changes
  const notifyDataChange = (action: 'add' | 'edit' | 'delete', key: string, data?: any) => {
    // Dispatch custom event for other components to listen to
    const event = new CustomEvent('deltadb-data-change', {
      detail: { action, key, data, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    // Use a user-specific change tracking key for cross-tab sync
    try {
      const changeKey = UserSessionService.getUserStorageKey('last-change');
      localStorage.setItem(changeKey, JSON.stringify({
        action, key, data, timestamp: Date.now()
      }));
    } catch (error) {
      // User session might not be available, ignore
    }
  };

  // Handle delete with proper sync
  const handleDelete = (key: string) => {
    try {
      // Check if it's a platform header (non-deletable)
      if (key === 'deltadb-platform-headers') {
        setError('Platform headers cannot be deleted. You can only modify them.');
        return;
      }
      
      // Check if it's a user setting (non-deletable)
      if (key === 'cbz-qa-name' || key === 'cbz-user-role') {
        setError('User settings cannot be deleted.');
        return;
      }

      // Check if it's a redundant key that shouldn't exist
      if (key.startsWith('deltapro-saved-')) {
        setError('This is a redundant data key. Please delete the main item instead.');
        return;
      }

      // Delete the item from both global and user-specific locations
      localStorage.removeItem(key);
      
      // Also try to delete from user-specific key
      try {
        const userKey = UserSessionService.getUserStorageKey(key);
        localStorage.removeItem(userKey);
      } catch (error) {
        // User session might not be available, ignore
      }
      
      // Notify other components
      notifyDataChange('delete', key);
      
      // Refresh the data
      setStorageData(getAllStorageData());
      setSelectedItem(null);
      
      toast({
        title: "✅ Item Deleted",
        description: `Successfully deleted ${key}`,
      });
    } catch (error) {
      setError(`Failed to delete ${key}: ${error}`);
    }
  };

  // Handle add new item
  const handleAddItem = () => {
    if (!newItemKey.trim() || !newItemValue.trim()) {
      alert('Please fill in both key and value');
      return;
    }
    
    try {
      let value;
      try {
        value = JSON.parse(newItemValue);
      } catch {
        value = newItemValue;
      }
      
      localStorage.setItem(newItemKey, JSON.stringify(value));
      
      setNewItemKey('');
              setNewItemValue('');
        setNewItemNamespace('user');
        setShowAddModal(false);
        notifyDataChange('add', newItemKey);
        // Refresh data to show new item
        setStorageData(getAllStorageData());
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item');
    }
  };

  // Export data
  const handleExportData = () => {
    const data: { [key: string]: any } = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value !== null) {
            data[key] = JSON.parse(value);
          }
        } catch {
          const value = localStorage.getItem(key);
          if (value !== null) {
            data[key] = value;
          }
        }
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deltadb-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            Object.entries(data).forEach(([key, value]) => {
              localStorage.setItem(key, JSON.stringify(value));
            });
            alert('Data imported successfully');
            notifyDataChange('add', 'imported-data'); // Indicate data was imported
          } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter items by search
  const getFilteredItems = (namespace: string): StorageItem[] => {
    const items = getNamespaceItems(namespace);
    if (!searchQuery) return items;
    
    return items.filter(item =>
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(item.value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const stats = getStorageStats();

    return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-600 rounded-2xl shadow-2xl">
                <Database className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  DeltaDB
                </h1>
                <p className="text-slate-300 text-lg">
                  Simple & Professional Local Storage Manager
                </p>
                {qaName && (
                  <p className="text-sm text-slate-400 mt-1">
                    Welcome, <span className="text-green-400">{qaName}</span> ({userRole})
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
                                   <Button
                       variant="outline"
                       size="sm"
                       onClick={handleExportData}
                       className="border-border text-muted-foreground hover:bg-muted/50"
                     >
                       <Download className="w-4 h-4 mr-2" />
                       Export
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={handleImportData}
                       className="border-border text-muted-foreground hover:bg-muted/50"
                     >
                       <Upload className="w-4 h-4 mr-2" />
                       Import
                     </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                           <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                   <CardContent className="p-6">
                     <div className="flex items-center space-x-3">
                       <div className="p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl">
                         <HardDrive className="w-6 h-6 text-blue-400" />
                       </div>
                       <div>
                         <p className="text-sm text-muted-foreground">Total Items</p>
                         <p className="text-3xl font-bold text-card-foreground">{stats.totalItems}</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                           <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                   <CardContent className="p-6">
                     <div className="flex items-center space-x-3">
                       <div className="p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl">
                         <Activity className="w-6 h-6 text-green-400" />
                       </div>
                       <div>
                         <p className="text-sm text-muted-foreground">Storage Used</p>
                         <p className="text-3xl font-bold text-card-foreground">{formatBytes(stats.totalSize)}</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                           <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                   <CardContent className="p-6">
                     <div className="flex items-center space-x-3">
                       <div className="p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
                         <UsersIcon className="w-6 h-6 text-purple-400" />
                       </div>
                       <div>
                         <p className="text-sm text-muted-foreground">User Items</p>
                         <p className="text-3xl font-bold text-card-foreground">{stats.namespaces.user}</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                           <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
                   <CardContent className="p-6">
                     <div className="flex items-center space-x-3">
                       <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
                         <BarChart3Icon className="w-6 h-6 text-yellow-400" />
                       </div>
                       <div>
                         <p className="text-sm text-muted-foreground">DeltaPro+ Items</p>
                         <p className="text-3xl font-bold text-card-foreground">{stats.namespaces.deltapro}</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
                             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                               <Input
                     placeholder="Search across all data..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-12 pr-4 py-3 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl"
                   />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Namespaces */}
          <div className="lg:col-span-1">
            <Card className="bg-card/40 border-border/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-green-400" />
                  <span>Data Collections</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Organized by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['user', 'deltapro', 'system', 'other'].map((namespace) => {
                    const info = getNamespaceInfo(namespace);
                    const items = getFilteredItems(namespace);
                    
                    if (items.length === 0) return null;
                    
                    return (
                      <div key={namespace} className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${info.color}`}>
                              {info.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-card-foreground">{info.name}</p>
                              <p className="text-xs text-muted-foreground">{info.description}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">
                            {items.length}
                          </Badge>
                        </div>
                        
                        <div className="ml-6 space-y-1">
                          {items.map((item) => {
                            const displayInfo = getItemDisplayInfo(item);
                            return (
                              <button
                                key={item.key}
                                onClick={() => setSelectedItem(item)}
                                className={`w-full text-left p-2 rounded text-sm transition-all ${
                                  selectedItem?.key === item.key
                                    ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border border-green-500/50'
                                    : 'hover:bg-muted/30 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate font-medium">{item.key}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${displayInfo.badgeColor}`}
                                    >
                                      {displayInfo.badgeText}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                    {formatBytes(item.size)}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle - Item Details */}
          <div className="lg:col-span-1">
            <Card className="bg-card/40 border-border/50 backdrop-blur-xl h-full">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Item Details</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {selectedItem ? `Details for ${selectedItem.key}` : 'Select an item to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedItem ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-card-foreground">{selectedItem.key}</h3>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditItem(selectedItem)}
                          className="border-border text-muted-foreground hover:bg-muted/50"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(selectedItem.key)}
                          disabled={isProtectedItem(selectedItem.key)}
                          className={`${
                            isProtectedItem(selectedItem.key)
                              ? 'border-gray-600/50 text-gray-400 cursor-not-allowed'
                              : 'border-red-600/50 text-red-300 hover:bg-red-900/20'
                          }`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isProtectedItem(selectedItem.key) ? 'Protected' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                    
                                             <Separator className="bg-border/50" />
                    
                    <div className="space-y-4">
                                                 <div className="grid grid-cols-2 gap-4">
                             <div>
                               <p className="text-sm text-muted-foreground">Namespace</p>
                               <p className="text-card-foreground font-medium">{selectedItem.namespace}</p>
                             </div>
                             <div>
                               <p className="text-sm text-muted-foreground">Size</p>
                               <p className="text-card-foreground font-medium">{formatBytes(selectedItem.size)}</p>
                             </div>
                           </div>
                           <div>
                             <p className="text-sm text-muted-foreground">Last Modified</p>
                             <p className="text-card-foreground font-medium">
                               {new Date(selectedItem.lastModified).toLocaleString()}
                             </p>
                           </div>
                    </div>
                  </div>
                ) : (
                                         <div className="text-center py-16 text-muted-foreground">
                         <div className="p-4 bg-muted/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                           <Database className="w-10 h-10 opacity-50" />
                         </div>
                         <p className="text-lg font-medium">Select an item from the collections</p>
                         <p className="text-sm text-muted-foreground">to view its details and content</p>
                       </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Item Content */}
          <div className="lg:col-span-1">
            <Card className="bg-card/40 border-border/50 backdrop-blur-xl h-full">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <span>Item Content</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {selectedItem ? 'Raw data and structure' : 'No item selected'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedItem ? (
                  <div className="space-y-4">
                                             <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                           <pre className="text-sm text-muted-foreground overflow-auto max-h-96 font-mono">
                             {typeof selectedItem.value === 'string' || typeof selectedItem.value === 'number' || typeof selectedItem.value === 'boolean'
                               ? String(selectedItem.value)
                               : JSON.stringify(selectedItem.value, null, 2)
                             }
                           </pre>
                         </div>

                         <div className="flex items-center justify-between text-sm text-muted-foreground">
                           <span>Data Type: {typeof selectedItem.value}</span>
                           <span>Key: {selectedItem.key}</span>
                         </div>
                  </div>
                ) : (
                                         <div className="text-center py-16 text-muted-foreground">
                         <div className="p-4 bg-muted/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                           <Eye className="w-10 h-10 opacity-50" />
                         </div>
                         <p className="text-lg font-medium">Select an item to view</p>
                         <p className="text-sm text-muted-foreground">its content and structure</p>
                       </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowEditModal(false);
                setEditingItem(null);
                setEditValue('');
                setError(null);
              }
            }}
            tabIndex={-1}
          >
                               <motion.div
                     initial={{ scale: 0.9, opacity: 0, y: 50 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.9, opacity: 0, y: 50 }}
                     transition={{ type: "spring", damping: 25, stiffness: 300 }}
                     className="bg-card rounded-2xl p-6 max-w-md w-full border border-border/50 shadow-2xl"
                   >
                     <div className="flex items-center justify-between mb-6">
                       <h3 className="text-xl font-semibold text-card-foreground">Edit Item</h3>
                       <button
                         onClick={() => {
                           setShowEditModal(false);
                           setEditingItem(null);
                           setEditValue('');
                         }}
                         className="text-muted-foreground hover:text-card-foreground transition-colors"
                       >
                         <X className="w-6 h-6" />
                       </button>
                     </div>

              <div className="space-y-4">
                                       <div>
                         <label className="text-sm font-medium text-muted-foreground">Key</label>
                         <Input
                           value={editingItem.key}
                           disabled
                           className="mt-1 bg-muted/50 border-border text-muted-foreground"
                         />
                       </div>
                       <div>
                         <label className="text-sm font-medium text-muted-foreground">Value</label>
                  {editingItem.key === 'cbz-user-role' ? (
                                               <select
                             value={editValue}
                             onChange={(e) => setEditValue(e.target.value)}
                             className="mt-1 w-full bg-background border border-border text-foreground rounded-md px-3 py-2"
                           >
                             <option value="QA Engineer">QA Engineer</option>
                             <option value="Developer">Developer</option>
                             <option value="Product Manager">Product Manager</option>
                           </select>
                         ) : (
                           <textarea
                             value={editValue}
                             onChange={(e) => setEditValue(e.target.value)}
                             placeholder={
                               editingItem.key === 'cbz-qa-name'
                                 ? "Enter name (alphanumeric + dots only, no dots at start/end)"
                                 : "Enter value"
                             }
                             className="mt-1 w-full bg-background border border-border text-foreground rounded-md px-3 py-2"
                             rows={4}
                           />
                         )}
                         {editingItem.key === 'cbz-qa-name' && (
                           <p className="text-xs text-muted-foreground mt-1">
                             Format: Only letters, numbers, and dots. Dots cannot be at start or end.
                           </p>
                         )}
                </div>
              </div>

                                   <div className="flex space-x-3 mt-6">
                       <Button
                         variant="outline"
                         onClick={() => {
                           setShowEditModal(false);
                           setEditingItem(null);
                           setEditValue('');
                         }}
                         className="flex-1 border-border text-muted-foreground hover:bg-muted/50"
                       >
                         Cancel
                       </Button>
                       <Button
                         onClick={handleSaveEdit}
                         className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                       >
                         <Save className="w-4 h-4 mr-2" />
                         Save
                       </Button>
                     </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowAddModal(false);
                setNewItemKey('');
                setNewItemValue('');
                setNewItemNamespace('user');
                setError(null);
              }
            }}
            tabIndex={-1}
          >
                               <motion.div
                     initial={{ scale: 0.9, opacity: 0, y: 50 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.9, opacity: 0, y: 50 }}
                     transition={{ type: "spring", damping: 25, stiffness: 300 }}
                     className="bg-card rounded-2xl p-6 max-w-md w-full border border-border/50 shadow-2xl"
                   >
                     <div className="flex items-center justify-between mb-6">
                       <h3 className="text-xl font-semibold text-card-foreground">Add New Item</h3>
                       <button
                         onClick={() => {
                           setShowAddModal(false);
                           setNewItemKey('');
                           setNewItemValue('');
                           setNewItemNamespace('user');
                         }}
                         className="text-muted-foreground hover:text-card-foreground transition-colors"
                       >
                         <X className="w-6 h-6" />
                       </button>
                     </div>

                              <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Key</label>
                    <Input
                      value={newItemKey}
                      onChange={(e) => setNewItemKey(e.target.value)}
                      placeholder="Enter key (e.g., my-setting)"
                      className="mt-1 bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Value</label>
                    <textarea
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      placeholder="Enter value (string, number, or JSON)"
                      className="mt-1 w-full bg-background border border-border text-foreground rounded-md px-3 py-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Namespace</label>
                    <select
                      value={newItemNamespace}
                      onChange={(e) => setNewItemNamespace(e.target.value)}
                      className="mt-1 w-full bg-background border border-border text-foreground rounded-md px-3 py-2"
                    >
                      <option value="user">User Settings</option>
                      <option value="deltapro">DeltaPro+</option>
                      <option value="system">System</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                              <div className="flex space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewItemKey('');
                      setNewItemValue('');
                      setNewItemNamespace('user');
                    }}
                    className="flex-1 border-border text-muted-foreground hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg border border-red-600 max-w-md"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                 </svg>
               </div>
               <div className="flex-1">
                 <p className="font-medium">Error</p>
                 <p className="text-sm opacity-90">{error}</p>
               </div>
               <button
                 onClick={() => setError(null)}
                 className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
               >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.586 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.586l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 };

export default DeltaDB;
