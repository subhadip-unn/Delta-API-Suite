import React from "react";
import { motion } from 'framer-motion';
import { ConfigProvider } from '../contexts/ConfigContext';
import ConfigTabs from '../components/config/ConfigTabs';
import { Button } from '../components/ui/button';
import { RotateCcw, Play } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

function ConfigContent() {
  const { resetConfig, loadSampleConfig } = useConfig();

  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
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
          <Button size="sm">
            <Play className="mr-2 h-4 w-4" />
            Run Comparison
          </Button>
        </div>
      </motion.div>
      
      <ConfigTabs />
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
