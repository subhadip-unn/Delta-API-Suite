import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Zap, 
  Settings, 
  FileText, 
  GitCompare, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ArrowRight,
  Globe,
  Shield
} from 'lucide-react';

interface DocumentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentationModal = ({ open, onOpenChange }: DocumentationModalProps) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: Play },
    { id: 'deltapro', label: 'DeltaPro+', icon: Zap },
    { id: 'api-testing', label: 'API Testing', icon: Globe },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <GitCompare className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Delta API Suite Platform</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Professional API comparison and testing platform for quality assurance teams
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">DeltaPro+ JSON Diff</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Advanced JSON comparison with intelligent diff analysis and visual highlighting
          </p>
        </div>

        <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">API Configuration</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Flexible endpoint configuration with headers, parameters, and multi-environment support
          </p>
        </div>

        <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Detailed Reports</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Comprehensive test reports with export capabilities and historical tracking
          </p>
        </div>

        <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Secure Testing</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            In-memory processing with no data persistence for maximum security
          </p>
        </div>
      </div>
    </div>
  );

  const renderGettingStarted = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Start Guide</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Configure Your APIs</h3>
              <p className="text-sm text-muted-foreground">
                Navigate to Config section and set up your API endpoints, headers, and parameters
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Run Comparisons</h3>
              <p className="text-sm text-muted-foreground">
                Execute API comparisons between different environments (Production vs Staging)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Analyze Results</h3>
              <p className="text-sm text-muted-foreground">
                Review detailed reports and use DeltaPro+ for advanced JSON diff analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Pro Tip</h3>
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Use keyboard shortcuts: <Badge variant="secondary">Ctrl+K</Badge> to open command palette, 
          <Badge variant="secondary">Ctrl+D</Badge> for quick diff comparison
        </p>
      </div>
    </div>
  );

  const renderDeltaPro = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">DeltaPro+ Advanced JSON Diff</h2>
        <p className="text-muted-foreground">
          Professional-grade JSON comparison with intelligent analysis
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Key Features
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground ml-6">
            <li>• Side-by-side JSON comparison with syntax highlighting</li>
            <li>• Order-insensitive comparison for arrays and objects</li>
            <li>• Smart diff classification (Added, Removed, Modified)</li>
            <li>• Export capabilities (JSON, PDF, HTML)</li>
            <li>• Real-time API fetching with CORS proxy</li>
            <li>• Monaco Editor integration for professional editing</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <Play className="h-4 w-4 text-blue-500 mr-2" />
            How to Use
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <strong>Manual Input:</strong> Paste JSON data directly into the editors
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <strong>API Fetching:</strong> Configure endpoints and fetch data automatically
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <strong>Compare & Analyze:</strong> View differences with color-coded highlighting
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTroubleshooting = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Common Issues & Solutions</h2>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">
            CORS Errors when fetching APIs
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Browser blocks direct API calls due to CORS policy
          </p>
          <div className="text-sm">
            <strong>Solution:</strong> Use our built-in proxy feature which handles CORS automatically
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">
            Large JSON files causing performance issues
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Very large JSON responses may slow down the diff viewer
          </p>
          <div className="text-sm">
            <strong>Solution:</strong> Use pagination or filter large datasets before comparison
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
            Authentication issues with APIs
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            API endpoints require authentication headers
          </p>
          <div className="text-sm">
            <strong>Solution:</strong> Configure authentication headers in the API settings section
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'getting-started': return renderGettingStarted();
      case 'deltapro': return renderDeltaPro();
      case 'troubleshooting': return renderTroubleshooting();
      default: return renderOverview();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30 p-4">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Documentation</span>
              </DialogTitle>
            </DialogHeader>
            
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {section.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <ScrollArea className="h-[60vh]">
              {renderContent()}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
