import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { motion } from 'framer-motion';
import EndpointsTab from './EndpointsTab';
import JobsTab from './JobsTab';
import HeadersTab from './HeadersTab';
import IdsTab from './IdsTab';

export default function ConfigTabs() {
  return (
    <Tabs defaultValue="endpoints" className="w-full h-full flex flex-col">
      <TabsList className="grid grid-cols-4 mb-4 sticky top-0 z-10 bg-background">
        <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="headers">Headers</TabsTrigger>
        <TabsTrigger value="ids">IDs</TabsTrigger>
      </TabsList>
      
      <div className="flex-grow overflow-hidden">
        <TabsContent 
          value="endpoints" 
          className="h-full overflow-y-auto pb-4"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <EndpointsTab />
          </motion.div>
        </TabsContent>
        
        <TabsContent 
          value="jobs" 
          className="h-full overflow-y-auto pb-4"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <JobsTab />
          </motion.div>
        </TabsContent>
        
        <TabsContent 
          value="headers" 
          className="h-full overflow-y-auto pb-4"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <HeadersTab />
          </motion.div>
        </TabsContent>
        
        <TabsContent 
          value="ids" 
          className="h-full overflow-y-auto pb-4"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <IdsTab />
          </motion.div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
