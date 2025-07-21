import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

// Enhanced types for universal usage
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

interface UniversalMonacoDiffViewerProps {
  leftData: any;
  rightData: any;
  leftTitle: string;
  rightTitle: string;
  comparisonResult?: ComparisonResult;
  modalMode?: boolean;
  modalTrigger?: React.ReactNode;
  platform?: string;
  geo?: string;
  endpoint?: string;
  className?: string;
  height?: string;
}

// Helper functions
const isDarkMode = () => document.documentElement.classList.contains('dark');

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'missing': return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
    case 'extra': return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'changed': return 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
    case 'type-changed': return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
    default: return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
  }
};

export default function UniversalMonacoDiffViewer({
  leftData,
  rightData,
  leftTitle,
  rightTitle,
  comparisonResult,
  modalMode = false,
  modalTrigger,
  platform,
  geo,
  endpoint,
  className = '',
  height = '500px'
}: UniversalMonacoDiffViewerProps) {
  const [activeTab, setActiveTab] = useState('diff');
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [expandedDiffs, setExpandedDiffs] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return 'Invalid JSON';
    }
  };

  const formattedLeftData = useMemo(() => formatJson(leftData), [leftData]);
  const formattedRightData = useMemo(() => formatJson(rightData), [rightData]);

  // Improved Monaco Editor cleanup to prevent disposal errors
  useEffect(() => {
    return () => {
      // Use setTimeout to ensure disposal happens after React's cleanup
      setTimeout(() => {
        if (editorRef.current) {
          try {
            // Check if editor is still mounted before disposing
            if (editorRef.current.getModel && editorRef.current.getModel()) {
              editorRef.current.dispose();
            }
          } catch (error) {
            // Silently handle disposal errors as they're often harmless
            console.debug('Monaco Editor cleanup (expected during unmount):', error instanceof Error ? error.message : String(error));
          }
        }
      }, 0);
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  const downloadJson = (data: any, filename: string) => {
    const jsonString = formatJson(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${filename} has been downloaded`,
    });
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedDiffs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDiffs(newExpanded);
  };

  const renderDiffItem = (diff: DiffItem, index: number) => {
    const isExpanded = expandedDiffs.has(index);
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(index)}
              className="p-1 h-auto"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            
            <Badge className={getSeverityColor(diff.severity)}>
              {diff.severity.toUpperCase()}
            </Badge>
            
            <Badge variant="outline" className={getTypeColor(diff.type)}>
              {diff.type.replace('-', ' ').toUpperCase()}
            </Badge>
            
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {diff.path}
            </code>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(diff, null, 2), 'Diff item')}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            <p className="text-sm text-muted-foreground">{diff.description}</p>
            
            {diff.type === 'changed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">🔴 Old Value</p>
                  <pre className="text-xs bg-red-50 dark:bg-red-950 p-3 rounded border">
                    {JSON.stringify(diff.oldValue, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">🟢 New Value</p>
                  <pre className="text-xs bg-green-50 dark:bg-green-950 p-3 rounded border">
                    {JSON.stringify(diff.newValue, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Main component content continues in next part...
  const DiffViewerContent = () => (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>🚀 Advanced JSON Comparison</span>
            {comparisonResult && !comparisonResult.identical && (
              <Badge variant="destructive">
                {comparisonResult.differences.length} differences
              </Badge>
            )}
            {comparisonResult && comparisonResult.identical && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Identical
              </Badge>
            )}
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
            
            {(platform || geo) && (
              <div className="flex items-center gap-2 ml-4">
                {platform && <Badge variant="outline">🏗️ {platform}</Badge>}
                {geo && <Badge variant="outline">🌍 {geo}</Badge>}
                {endpoint && <Badge variant="secondary">🔗 {endpoint}</Badge>}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="diff">Monaco Diff</TabsTrigger>
            <TabsTrigger value="analysis">Visual Diff</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diff" className="space-y-4">
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(formattedLeftData, leftTitle)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy {leftTitle}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(formattedRightData, rightTitle)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy {rightTitle}
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <DiffEditor
                height={height}
                language="json"
                original={formattedLeftData}
                modified={formattedRightData}
                theme={isDarkMode() ? 'vs-dark' : 'vs'}
                options={{
                  readOnly: true,
                  renderSideBySide: true,
                  scrollBeyondLastLine: false,
                  minimap: { enabled: true },
                  wordWrap: 'on',
                  fontSize: 12,
                  lineNumbers: 'on',
                  folding: true,
                  contextmenu: true,
                  selectOnLineNumbers: true,
                  automaticLayout: true,
                  renderOverviewRuler: true,
                  diffWordWrap: 'on',
                  ignoreTrimWhitespace: false,
                  renderWhitespace: 'boundary',
                  hideUnchangedRegions: {
                    enabled: showOnlyDifferences,
                    minimumLineCount: 3,
                    contextLineCount: 3
                  },
                  renderIndicators: true
                }}
                onMount={handleEditorDidMount}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>📄 {leftTitle}</span>
              <span>📄 {rightTitle}</span>
            </div>
          </TabsContent>
          
          {comparisonResult && (
            <TabsContent value="analysis" className="space-y-4">
              {comparisonResult.identical ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-green-700 dark:text-green-300 mb-2">
                    🎉 Perfect Match!
                  </h3>
                  <p className="text-muted-foreground">
                    The JSON objects are completely identical
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span>🔍 Differences Analysis ({comparisonResult.differences.length})</span>
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedDiffs(new Set(comparisonResult.differences.map((_, i) => i)))}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Expand All
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {comparisonResult.differences.map((diff, index) => renderDiffItem(diff, index))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="summary" className="space-y-6">
            {comparisonResult ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Fields</p>
                          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                            {comparisonResult.summary?.totalFields || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">Identical</p>
                          <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                            {comparisonResult.summary?.identicalFields || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Different</p>
                          <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                            {comparisonResult.summary?.differentFields || comparisonResult.differences.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Minus className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="text-sm font-medium text-red-700 dark:text-red-300">Missing/Extra</p>
                          <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                            {(comparisonResult.summary?.missingFields || 0) + (comparisonResult.summary?.extraFields || 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-red-300 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950 dark:to-red-800">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">🔥 Critical</p>
                        <p className="text-3xl font-bold text-red-800 dark:text-red-200">
                          {comparisonResult.summary?.criticalDiffs || 0}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">High Impact</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-orange-300 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-800">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-300">⚠️ High</p>
                        <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">
                          {comparisonResult.summary?.highDiffs || 0}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">Significant</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-yellow-300 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-950 dark:to-yellow-800">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">⚡ Medium</p>
                        <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                          {comparisonResult.summary?.mediumDiffs || 0}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">Moderate</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-800">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">ℹ️ Low</p>
                        <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                          {comparisonResult.summary?.lowDiffs || 0}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Minor</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                      <BarChart3 className="h-5 w-5" />
                      <span>🚀 Advanced Comparison Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-purple-600 dark:text-purple-400">Algorithm</p>
                        <p className="text-purple-800 dark:text-purple-200">🧠 Semantic AI</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-purple-600 dark:text-purple-400">Processing</p>
                        <p className="text-purple-800 dark:text-purple-200">⚡ Real-time</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-purple-600 dark:text-purple-400">Security</p>
                        <p className="text-purple-800 dark:text-purple-200">🔒 No Storage</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-purple-600 dark:text-purple-400">Order</p>
                        <p className="text-purple-800 dark:text-purple-200">🔄 Insensitive</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">🚀 Advanced Analysis Ready</h3>
                    <p className="text-sm text-muted-foreground/70">Provide comparison data to unlock world-class diff insights</p>
                  </div>
                </motion.div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="raw" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    📄 {leftTitle}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(formattedLeftData, leftTitle)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadJson(leftData, `${leftTitle.toLowerCase().replace(/\s+/g, '-')}.json`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Editor
                    height="400px"
                    language="json"
                    value={formattedLeftData}
                    theme={isDarkMode() ? 'vs-dark' : 'vs'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      fontSize: 12,
                      lineNumbers: 'on',
                      folding: true
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    📄 {rightTitle}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(formattedRightData, rightTitle)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadJson(rightData, `${rightTitle.toLowerCase().replace(/\s+/g, '-')}.json`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Editor
                    height="400px"
                    language="json"
                    value={formattedRightData}
                    theme={isDarkMode() ? 'vs-dark' : 'vs'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      fontSize: 12,
                      lineNumbers: 'on',
                      folding: true
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

  // Return based on mode
  if (modalMode && modalTrigger) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild onClick={() => setIsModalOpen(true)}>
          {modalTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>🚀 Professional Diff Analysis</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[80vh]">
            <DiffViewerContent />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return <DiffViewerContent />;
}
