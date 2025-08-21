import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  GitCompare, 
  Radio, 
  Zap, 
  Shield, 
  BookOpen, 
  Database,
  Activity,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types for metrics
interface SystemMetrics {
  status: string;
  uptime: {
    formatted: string;
  };
  memory: {
    used: string;
    total: string;
  };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number;
  };
}

// Tool configuration
const tools = [
  {
    id: 'deltapro',
    name: 'DeltaPro+',
    description: 'Advanced JSON comparison with intelligent diff analysis',
    icon: GitCompare,
    status: 'active',
    usage: '1,247 comparisons',
    color: 'from-blue-500 to-cyan-500',
    route: '/deltapro'
  },
  {
    id: 'deltaman',
    name: 'DeltaMan',
    description: 'Professional API testing tool (like Postman)',
    icon: Radio,
    status: 'coming-soon',
    usage: 'Coming Soon',
    color: 'from-purple-500 to-pink-500',
    route: '/deltaman'
  },
  {
    id: 'deltaperf',
    name: 'DeltaPerformance',
    description: 'API performance and load testing',
    icon: Zap,
    status: 'coming-soon',
    usage: 'Coming Soon',
    color: 'from-orange-500 to-red-500',
    route: '/deltaperf'
  },
  {
    id: 'deltasec',
    name: 'DeltaSecurity',
    description: 'Security testing (SQL injection, XSS)',
    icon: Shield,
    status: 'coming-soon',
    usage: 'Coming Soon',
    color: 'from-red-500 to-pink-500',
    route: '/deltasec'
  },
  {
    id: 'deltadoc',
    name: 'DeltaDoc',
    description: 'API documentation generator',
    icon: BookOpen,
    status: 'coming-soon',
    usage: 'Coming Soon',
    color: 'from-green-500 to-teal-500',
    route: '/deltadoc'
  },
  {
    id: 'deltadb',
    name: 'DeltaDB',
    description: 'Central storage and configuration hub',
    icon: Database,
    status: 'active',
    usage: '45 configs stored',
    color: 'from-indigo-500 to-purple-500',
    route: '/dashboard'
  }
];

export default function DeltaMetrics() {
  const { qaName } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch system metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.status === 'active') {
      navigate(tool.route);
    } else {
      // Show coming soon message
      console.log(`${tool.name} is coming soon!`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'coming-soon': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'coming-soon': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DeltaMetrics
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Welcome back, {qaName || 'QA Engineer'}! Professional API Development Suite with real-time monitoring and analytics.
          </p>
        </motion.div>

        {/* System Health Overview */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span>System Health & Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className={`w-3 h-3 rounded-full ${metrics.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{metrics.status === 'healthy' ? 'Healthy' : 'Issues'}</div>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{metrics.uptime.formatted}</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{metrics.metrics.totalRequests.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Requests</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{metrics.metrics.successRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tools Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card 
                className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm`}
                onClick={() => handleToolClick(tool)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${tool.color} rounded-xl`}>
                      <tool.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge className={getStatusColor(tool.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(tool.status)}
                        <span className="capitalize">{tool.status.replace('-', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{tool.name}</CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{tool.usage}</span>
                    {tool.status === 'active' && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        Open Tool
                      </Button>
                    )}
                    {tool.status === 'coming-soon' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled
                        className="cursor-not-allowed"
                      >
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold mb-4">🚀 Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6">
                Choose a tool from above or explore our comprehensive API development suite.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => navigate('/deltapro')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Start Comparing APIs
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Manage Configurations
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
