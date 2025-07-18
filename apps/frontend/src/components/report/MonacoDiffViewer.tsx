import React, { useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface MonacoDiffViewerProps {
  dataA: any;
  dataB: any;
  endpointA: string;
  endpointB: string;
  platform: string;
  geo: string;
  diffSummary?: {
    totalDiffs: number;
    severityCounts: {
      Error: number;
      Warning: number;
      Info: number;
    };
    hasStructuralChanges: boolean;
    hasCriticalErrors: boolean;
  };
  trigger?: React.ReactNode;
}

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({
  dataA,
  dataB,
  endpointA,
  endpointB,
  platform,
  geo,
  diffSummary,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('diff');
  const [jsonA, setJsonA] = useState('');
  const [jsonB, setJsonB] = useState('');

  useEffect(() => {
    if (dataA && dataB) {
      setJsonA(JSON.stringify(dataA, null, 2));
      setJsonB(JSON.stringify(dataB, null, 2));
    }
  }, [dataA, dataB]);

  const handleCopyToClipboard = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`${label} copied to clipboard`);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Error': return 'bg-red-100 text-red-800 border-red-200';
      case 'Warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Eye className="h-4 w-4" />
      View Diff
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] w-[95vw] h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                API Response Comparison
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Badge variant="outline">{platform}</Badge>
                <Badge variant="outline">{geo}</Badge>
                <span className="text-gray-400">•</span>
                <span>{endpointA}</span>
                {endpointA !== endpointB && (
                  <>
                    <span className="text-gray-400">vs</span>
                    <span>{endpointB}</span>
                  </>
                )}
              </div>
            </div>
            
            {diffSummary && (
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor('Error')}>
                  {diffSummary.severityCounts.Error} Errors
                </Badge>
                <Badge className={getSeverityColor('Warning')}>
                  {diffSummary.severityCounts.Warning} Warnings
                </Badge>
                <Badge className={getSeverityColor('Info')}>
                  {diffSummary.severityCounts.Info} Info
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-6 py-2 border-b">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="diff">Side-by-Side Diff</TabsTrigger>
                <TabsTrigger value="responseA">Response A</TabsTrigger>
                <TabsTrigger value="responseB">Response B</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="diff" className="flex-1 m-0 p-0">
              <div className="h-full relative">
                <DiffEditor
                  height="100%"
                  language="json"
                  original={jsonA}
                  modified={jsonB}
                  theme="vs-light"
                  options={{
                    readOnly: true,
                    renderSideBySide: true,
                    enableSplitViewResizing: true,
                    renderOverviewRuler: true,
                    scrollBeyondLastLine: false,
                    minimap: { enabled: true },
                    wordWrap: 'on',
                    diffWordWrap: 'on',
                    ignoreTrimWhitespace: false,
                    renderWhitespace: 'boundary',
                    fontSize: 12,
                    lineNumbers: 'on',
                    folding: true,
                    contextmenu: true,
                    selectOnLineNumbers: true,
                    automaticLayout: true
                  }}
                />
                
                {/* Action buttons overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(jsonA, 'Response A')}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(jsonA, `response-a-${platform}-${geo}.json`)}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="responseA" className="flex-1 m-0 p-0">
              <div className="h-full relative">
                <DiffEditor
                  height="100%"
                  language="json"
                  original=""
                  modified={jsonA}
                  theme="vs-light"
                  options={{
                    readOnly: true,
                    renderSideBySide: false,
                    scrollBeyondLastLine: false,
                    minimap: { enabled: true },
                    wordWrap: 'on',
                    fontSize: 12,
                    lineNumbers: 'on',
                    folding: true,
                    contextmenu: true,
                    selectOnLineNumbers: true,
                    automaticLayout: true
                  }}
                />
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(jsonA, 'Response A')}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(jsonA, `response-a-${platform}-${geo}.json`)}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="responseB" className="flex-1 m-0 p-0">
              <div className="h-full relative">
                <DiffEditor
                  height="100%"
                  language="json"
                  original=""
                  modified={jsonB}
                  theme="vs-light"
                  options={{
                    readOnly: true,
                    renderSideBySide: false,
                    scrollBeyondLastLine: false,
                    minimap: { enabled: true },
                    wordWrap: 'on',
                    fontSize: 12,
                    lineNumbers: 'on',
                    folding: true,
                    contextmenu: true,
                    selectOnLineNumbers: true,
                    automaticLayout: true
                  }}
                />
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(jsonB, 'Response B')}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(jsonB, `response-b-${platform}-${geo}.json`)}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonacoDiffViewer;
