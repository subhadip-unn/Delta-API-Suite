import { useState, useRef } from "react";
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
  // Use context hooks directly from useConfig - no intermediate variables
  const { config } = useConfig();
  const { qaName, userRole, isAuthenticated } = useAuth(); 
  
  // Toast hook for notifications
  const { toast } = useToast();
  
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  
  // Use ref to track if API call is in progress (prevents race conditions)
  const isProcessingRef = useRef(false);

  // Function to validate and run comparison
  const handleRunComparison = async () => {
    // Double protection against duplicate calls using both state and ref
    if (isRunning || isProcessingRef.current) {
      console.log("Already running a comparison - ignoring duplicate call");
      return;
    }
    
    // Set ref immediately to block any other calls
    isProcessingRef.current = true;

    // More detailed debug logging
    console.log("=== DEBUG: Run Comparison Button Clicked ===");
    
    // Simple check for any configuration
    const hasJobs = Array.isArray(config.jobs) && config.jobs.length > 0;
    const hasEndpoints = Array.isArray(config.endpoints) && config.endpoints.length > 0;
    
    // If there's ANY content in the config, we'll try to run the comparison
    const hasContent = config && (hasJobs || hasEndpoints);
       
    if (!hasContent) {
      console.log("VALIDATION FAILED: No valid configuration found");
      toast({
        title: "Configuration Missing",
        description: "Please configure your comparison or load a sample.",
        variant: "destructive"
      });
      return;
    }
    
    // Set running state BEFORE the API call to prevent duplicate calls
    setIsRunning(true);
    try {
      // Make sure we have a user name and save it to localStorage for persistence
      const currentQaName = qaName || localStorage.getItem('userName') || 'QA Engineer';
      localStorage.setItem('userName', currentQaName); // Always store the name for future use
      console.log(`Starting comparison as QA: ${currentQaName}`);
      console.log(`DEBUG: Auth context qaName: ${qaName}, userRole: ${userRole}, isAuthenticated: ${isAuthenticated}`);
      
      // Debug detailed config content
      console.log('DEBUG: Config before API call', { 
        configIsEmpty: !config,
        jobCount: config?.jobs?.length || 0,
        endpointCount: config?.endpoints?.length || 0,
        jobsEmpty: Array.isArray(config?.jobs) && config.jobs.length === 0,
        endpointsEmpty: Array.isArray(config?.endpoints) && config.endpoints.length === 0,
        fullConfig: config // Log the entire config object
      });

      // Single API call with proper user name
      const result = await apiService.runComparison(config, currentQaName);

      // Handle success result
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
      // Reset both state trackers
      setIsRunning(false);
      isProcessingRef.current = false;
      console.log('DEBUG: Comparison run complete, button re-enabled');
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
