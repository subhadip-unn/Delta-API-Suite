import { useState } from "react";
import { motion } from 'framer-motion';
import { ConfigProvider } from '../contexts/ConfigContext';
import ConfigTabs from '../components/config/ConfigTabs';
import { Button } from '../components/ui/button';
import { RotateCcw, Play, Loader2 } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

function RunComparisonButton() {
  // Use context hooks
  const config = useConfig();
  const configState = config as any; // Type casting until proper types are fixed
  const auth = useAuth();
  const user = auth as any; 
  
  // Toast hook for notifications
  const { toast } = useToast();
  
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);

  // Function to validate and run comparison
  const handleRunComparison = async () => {
    console.log("Run button clicked - current config:", configState); // Debug log
    
    // SIMPLIFIED VALIDATION - Only checking for jobs
    if (!configState.jobs || configState.jobs.length === 0) {
      // Show error toast
      toast({
        title: "Job Configuration Missing",
        description: "Please add at least one job before running a comparison.",
        variant: "destructive"
      });
      return;
    }
    
    // Success toast to show validation passed
    toast({
      title: "Validation Passed",
      description: "Starting comparison with " + configState.jobs.length + " jobs."
    });
    setIsRunning(true);
    try {
      const result = await apiService.runComparison(
        configState,
        user?.displayName || 'Anonymous User'
      );
      if (result.success && result.reportId) {
        toast({
          title: "Comparison Complete",
          description: `Report generated successfully in ${result.duration}ms`
        });
        navigate(`/report/${result.reportId}`);
      } else {
        toast({
          title: "Comparison Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Comparison Error",
        description: error.message || 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button size="sm" onClick={handleRunComparison} disabled={isRunning} className="gap-2">
      {isRunning ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Running...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" /> Run Comparison
        </>
      )}
    </Button>
  );
}


function ConfigContent() {
  const { resetConfig, loadSampleConfig } = useConfig();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="py-4 px-6 sticky top-0 z-10 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold mb-2">Config Editor</h1>
            <p className="text-muted-foreground">Configure endpoints, jobs, headers and IDs for API comparison tests.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetConfig}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Config
            </Button>
            <Button variant="outline" size="sm" onClick={loadSampleConfig}>
              Load Sample
            </Button>
            <RunComparisonButton />
          </div>
        </motion.div>
      </div>
      
      <div className="px-6 flex-grow overflow-hidden">
        <ConfigTabs />
      </div>
    </div>
  );
}

export default function Config() {
  return (
    <ConfigProvider>
      <ConfigContent />
    </ConfigProvider>
  );
}
