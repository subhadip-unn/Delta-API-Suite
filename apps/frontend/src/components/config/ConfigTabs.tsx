import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { motion } from 'framer-motion';
import EndpointsTab from './EndpointsTab';
import JobsTab from './JobsTab';
import HeadersTab from './HeadersTab';
import IdsTab from './IdsTab';

export default function ConfigTabs() {
  return (
    <Tabs defaultValue="endpoints" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="headers">Headers</TabsTrigger>
        <TabsTrigger value="ids">IDs</TabsTrigger>
      </TabsList>
      
      <TabsContent value="endpoints" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EndpointsTab />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="jobs" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <JobsTab />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="headers" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HeadersTab />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="ids" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <IdsTab />
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
