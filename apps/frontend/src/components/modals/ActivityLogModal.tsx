import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Search, 
 
  Download, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  GitCompare,
  Settings,

  Upload,
  User,

  MoreHorizontal
} from 'lucide-react';

interface ActivityLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'comparison' | 'export' | 'config' | 'login' | 'error' | 'upload';
  action: string;
  details: string;
  status: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  metadata?: Record<string, any>;
}

// Mock data - in real app this would come from API/localStorage
const generateMockData = (): ActivityItem[] => {
  const now = new Date();
  return [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000),
      type: 'comparison',
      action: 'API Comparison Completed',
      details: 'Production vs Staging - 15 endpoints compared',
      status: 'success',
      duration: 2340,
      metadata: { endpoints: 15, differences: 3 }
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000),
      type: 'export',
      action: 'Report Exported',
      details: 'Downloaded comparison report as JSON',
      status: 'success',
      metadata: { format: 'json', size: '2.3MB' }
    },
    {
      id: '3',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000),
      type: 'config',
      action: 'Configuration Updated',
      details: 'Modified API endpoints and headers',
      status: 'info',
      metadata: { changes: 5 }
    },
    {
      id: '4',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000),
      type: 'comparison',
      action: 'DeltaPro+ JSON Diff',
      details: 'Compared user profile endpoints',
      status: 'success',
      duration: 1200,
      metadata: { differences: 8 }
    },
    {
      id: '5',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000),
      type: 'error',
      action: 'API Request Failed',
      details: 'Timeout error on staging environment',
      status: 'error',
      metadata: { endpoint: '/api/users', error: 'TIMEOUT' }
    },
    {
      id: '6',
      timestamp: new Date(now.getTime() - 90 * 60 * 1000),
      type: 'login',
      action: 'User Login',
      details: 'Successful authentication',
      status: 'success',
      metadata: { ip: '192.168.1.100' }
    },
    {
      id: '7',
      timestamp: new Date(now.getTime() - 120 * 60 * 1000),
      type: 'upload',
      action: 'Report Uploaded',
      details: 'Imported test results from external source',
      status: 'warning',
      metadata: { filename: 'test_results.json', warnings: 2 }
    }
  ];
};

export const ActivityLogModal = ({ open, onOpenChange }: ActivityLogModalProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Load activities (mock data for now)
    const mockData = generateMockData();
    setActivities(mockData);
    setFilteredActivities(mockData);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, filterType, filterStatus]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'comparison': return GitCompare;
      case 'export': return Download;
      case 'config': return Settings;
      case 'login': return User;
      case 'error': return XCircle;
      case 'upload': return Upload;
      default: return Info;
    }
  };

  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const clearActivityLog = () => {
    setActivities([]);
    setFilteredActivities([]);
  };

  const exportActivityLog = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Activity Log</span>
                <Badge variant="secondary">{filteredActivities.length} items</Badge>
              </DialogTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={exportActivityLog}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={clearActivityLog}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Filters */}
          <div className="px-6 pb-4 space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="comparison">Comparisons</SelectItem>
                  <SelectItem value="export">Exports</SelectItem>
                  <SelectItem value="config">Config</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                  <SelectItem value="upload">Uploads</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Activity List */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activities found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredActivities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const StatusIcon = getStatusIcon(activity.status);
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full bg-background border-2 ${getStatusColor(activity.status)}`}>
                          <ActivityIcon className="h-4 w-4" />
                        </div>
                        {index < filteredActivities.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{activity.action}</h4>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{activity.details}</p>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <StatusIcon className={`h-3 w-3 ${getStatusColor(activity.status)}`} />
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.status}
                            </Badge>
                          </div>
                          
                          {activity.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {formatDuration(activity.duration)}
                            </Badge>
                          )}
                          
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <MoreHorizontal className="h-3 w-3" />
                              <span>{Object.keys(activity.metadata).length} details</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
