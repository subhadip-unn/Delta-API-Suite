import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Minus,
  Plus,
  FileText,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Editor, { DiffEditor } from '@monaco-editor/react';

interface DiffItem {
  path: string;
  type: 'missing' | 'extra' | 'changed' | 'type-changed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  oldValue?: any;
  newValue?: any;
  description: string;
}

interface ComparisonResult {
  identical: boolean;
  differences: DiffItem[];
  summary: {
    totalFields: number;
    identicalFields: number;
    differentFields: number;
    missingFields: number;
    extraFields: number;
    criticalDiffs: number;
    highDiffs: number;
    mediumDiffs: number;
    lowDiffs: number;
  };
}

interface JsonDiffViewerProps {
  leftData: any;
  rightData: any;
  comparisonResult: ComparisonResult;
  leftTitle: string;
  rightTitle: string;
}

// Helper function to detect dark mode
const isDarkMode = () => {
  return document.documentElement.classList.contains('dark');
};

// Helper function to get severity color
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Helper function to get type color
const getTypeColor = (type: string) => {
  switch (type) {
    case 'missing':
      return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
    case 'extra':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'changed':
      return 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
    case 'type-changed':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
    default:
      return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
  }
};

export default function JsonDiffViewer({
  leftData,
  rightData,
  comparisonResult,
  leftTitle,
  rightTitle
}: JsonDiffViewerProps) {
  const [activeTab, setActiveTab] = useState('diff');
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [expandedDiffs, setExpandedDiffs] = useState<Set<number>>(new Set());
  const editorRef = useRef<any>(null);


  // Format JSON for display
  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return 'Invalid JSON';
    }
  };

  // Memoize formatted JSON to prevent unnecessary re-renders
  const formattedLeftData = useMemo(() => formatJson(leftData), [leftData]);
  const formattedRightData = useMemo(() => formatJson(rightData), [rightData]);

  // Cleanup Monaco Editor on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (error) {
          // Ignore disposal errors during cleanup
          console.warn('Monaco Editor cleanup warning:', error);
        }
      }
    };
  }, []);

  // Handle editor mount
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const { toast } = useToast();

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    });
  };

  // Download JSON
  const downloadJson = (data: any, filename: string) => {
    const jsonString = formatJson(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle expanded state
  const toggleExpanded = (index: number) => {
    setExpandedDiffs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Render diff tree item
  const renderDiffItem = (diff: DiffItem, index: number) => {
    const isExpanded = expandedDiffs.has(index);
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`border rounded-lg p-4 ${getTypeColor(diff.type)}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(index)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <code className="text-sm font-mono">{diff.path}</code>
            <Badge variant="outline" className={getSeverityColor(diff.severity)}>
              {diff.severity}
            </Badge>
            <Badge variant="outline" className={getTypeColor(diff.type)}>
              {diff.type}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {diff.description}
        </p>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            {diff.oldValue !== undefined && (
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Old Value:</span>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(diff.oldValue, null, 2)}
                </pre>
              </div>
            )}
            {diff.newValue !== undefined && (
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">New Value:</span>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(diff.newValue, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>JSON Comparison Results</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
            >
              {showOnlyDifferences ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showOnlyDifferences ? 'Show All' : 'Differences Only'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(formatJson({ leftData, rightData, comparisonResult }), 'Comparison')}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadJson({ leftData, rightData, comparisonResult }, 'json-comparison')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="diff">Monaco Diff</TabsTrigger>
            <TabsTrigger value="visual">Visual Diff</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diff" className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <DiffEditor
                height="600px"
                language="json"
                original={formattedLeftData}
                modified={formattedRightData}
                theme={isDarkMode() ? 'vs-dark' : 'vs'}
                onMount={handleEditorDidMount}
                options={{
                  readOnly: true,
                  minimap: { enabled: true },
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  renderSideBySide: true,
                  ignoreTrimWhitespace: false,
                  renderWhitespace: 'boundary',
                  diffWordWrap: 'on',
                  automaticLayout: true
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{leftTitle}</span>
              <span>{rightTitle}</span>
            </div>
          </TabsContent>
          
          <TabsContent value="visual" className="space-y-4">
            {comparisonResult.identical ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  No Differences Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  The JSON objects are identical
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Differences ({comparisonResult.differences.length})</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedDiffs(new Set(comparisonResult.differences.map((_, i) => i)))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Expand All
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {comparisonResult.differences.map((diff, index) => renderDiffItem(diff, index))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total Fields</p>
                      <p className="text-2xl font-bold">{comparisonResult.summary.totalFields}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Identical</p>
                      <p className="text-2xl font-bold">{comparisonResult.summary.identicalFields}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Different</p>
                      <p className="text-2xl font-bold">{comparisonResult.summary.differentFields}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Minus className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Missing/Extra</p>
                      <p className="text-2xl font-bold">
                        {comparisonResult.summary.missingFields + comparisonResult.summary.extraFields}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Critical</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {comparisonResult.summary.criticalDiffs}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">High</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {comparisonResult.summary.highDiffs}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Medium</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {comparisonResult.summary.mediumDiffs}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Low</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {comparisonResult.summary.lowDiffs}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    {leftTitle}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(formatJson(leftData), leftTitle)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Editor
                    height="400px"
                    language="json"
                    value={formatJson(leftData)}
                    theme={isDarkMode() ? 'vs-dark' : 'vs'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      scrollBeyondLastLine: false
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    {rightTitle}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(formatJson(rightData), rightTitle)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Editor
                    height="400px"
                    language="json"
                    value={formatJson(rightData)}
                    theme={isDarkMode() ? 'vs-dark' : 'vs'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      scrollBeyondLastLine: false
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
