'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle,
    Code,
    Copy,
    Download,
    FileText,
    Globe,
    Lightbulb,
    Play,
    Search,
    Settings,
    Target,
    Zap
} from 'lucide-react';
import { useState } from 'react';

interface ModeTip {
  icon: React.ReactNode;
  title: string;
  description: string;
  category: 'basic' | 'advanced' | 'shortcut';
}

const modeTips: Record<string, ModeTip[]> = {
  'api-explorer': [
    {
      icon: <Search className="w-4 h-4" />,
      title: 'Smart Search',
      description: 'Search by API name, description, or endpoint path. Use filters to narrow down results.',
      category: 'basic'
    },
    {
      icon: <Play className="w-4 h-4" />,
      title: 'One-Click Execution',
      description: 'Click "Execute" to test APIs instantly. Parameters are auto-validated before sending.',
      category: 'basic'
    },
    {
      icon: <Settings className="w-4 h-4" />,
      title: 'Environment Switching',
      description: 'Switch between Production, Staging, and Dev environments with a single click.',
      category: 'basic'
    },
    {
      icon: <Copy className="w-4 h-4" />,
      title: 'Quick Copy',
      description: 'Copy generated URLs, cURL commands, or response data with one click.',
      category: 'shortcut'
    },
    {
      icon: <Zap className="w-4 h-4" />,
      title: 'Auto-fill Target',
      description: 'Enable auto-fill to automatically populate target API with different environment/version.',
      category: 'advanced'
    }
  ],
  'api-builder': [
    {
      icon: <Code className="w-4 h-4" />,
      title: 'cURL Import',
      description: 'Paste any cURL command to automatically parse and populate the request builder.',
      category: 'basic'
    },
    {
      icon: <FileText className="w-4 h-4" />,
      title: 'JSON Body Editor',
      description: 'Use the built-in JSON editor with syntax highlighting and validation.',
      category: 'basic'
    },
    {
      icon: <Globe className="w-4 h-4" />,
      title: 'Custom Headers',
      description: 'Add custom headers, authentication tokens, and content types easily.',
      category: 'basic'
    },
    {
      icon: <Download className="w-4 h-4" />,
      title: 'Export Requests',
      description: 'Export your requests as cURL, Postman collection, or raw HTTP.',
      category: 'shortcut'
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: 'Request Templates',
      description: 'Save frequently used requests as templates for quick access.',
      category: 'advanced'
    }
  ],
  'response-comparison': [
    {
      icon: <FileText className="w-4 h-4" />,
      title: 'JSON Validation',
      description: 'Invalid JSON is automatically highlighted with helpful error messages.',
      category: 'basic'
    },
    {
      icon: <Copy className="w-4 h-4" />,
      title: 'Quick Actions',
      description: 'Copy or download pasted content using the action buttons.',
      category: 'shortcut'
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: 'Smart Comparison',
      description: 'Our engine automatically detects and highlights differences between responses.',
      category: 'basic'
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      title: 'Response Preview',
      description: 'See a preview of your response before activating it for comparison.',
      category: 'basic'
    },
    {
      icon: <AlertCircle className="w-4 h-4" />,
      title: 'Error Handling',
      description: 'Clear error messages help you fix JSON formatting issues quickly.',
      category: 'advanced'
    }
  ]
};

interface ModeTipsProps {
  mode: string;
  className?: string;
}

export function ModeTips({ mode, className = '' }: ModeTipsProps) {
  const [showTips, setShowTips] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'advanced' | 'shortcut'>('all');

  const tips = modeTips[mode] || [];
  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'shortcut': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return <CheckCircle className="w-3 h-3" />;
      case 'advanced': return <Zap className="w-3 h-3" />;
      case 'shortcut': return <Target className="w-3 h-3" />;
      default: return <Lightbulb className="w-3 h-3" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTips(!showTips)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        Quick Tips
      </Button>

      <AnimatePresence>
        {showTips && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-96 z-50"
          >
            <Card className="shadow-lg border-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-primary" />
                    {mode === 'api-explorer' && 'API Explorer Tips'}
                    {mode === 'api-builder' && 'API Builder Tips'}
                    {mode === 'response-comparison' && 'Response Comparison Tips'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTips(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Filter */}
                <div className="flex space-x-1">
                  {['all', 'basic', 'advanced', 'shortcut'].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category as 'all' | 'basic' | 'advanced' | 'shortcut')}
                      className="text-xs h-7"
                    >
                      {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Tips List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-1 rounded bg-primary/10 text-primary mt-0.5 flex-shrink-0">
                        {tip.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-sm">{tip.title}</p>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getCategoryColor(tip.category)}`}
                          >
                            {getCategoryIcon(tip.category)}
                            <span className="ml-1">{tip.category}</span>
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{tip.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredTips.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No tips available for this category
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
