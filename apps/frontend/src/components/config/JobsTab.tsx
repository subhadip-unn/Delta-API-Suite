import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useConfig } from '../../contexts/ConfigContext';
import { Job, EndpointPair } from '../../types/config';
import { PlusCircle, X, Edit, Save, Trash, Plus, AlertCircle } from 'lucide-react';

const PLATFORMS = ['a', 'i', 'm', 'w'];

export default function JobsTab() {
  const { config, setJobs } = useConfig();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newJob, setNewJob] = useState<Job>({
    name: '',
    platform: 'a',
    baseA: '',
    baseB: '',
    endpointPairs: [{ endpointA: '', endpointB: '' }]
  });

  const handleAddJob = () => {
    if (isJobValid(newJob)) {
      const updatedJobs = [...config.jobs, { ...newJob }];
      setJobs(updatedJobs);
      setNewJob({
        name: '',
        platform: 'a',
        baseA: '',
        baseB: '',
        endpointPairs: [{ endpointA: '', endpointB: '' }]
      });
    }
  };

  const handleEditJob = (index: number) => {
    setEditingIndex(index);
    setNewJob({ ...config.jobs[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && isJobValid(newJob)) {
      const updatedJobs = [...config.jobs];
      updatedJobs[editingIndex] = { ...newJob };
      setJobs(updatedJobs);
      setEditingIndex(null);
      setNewJob({
        name: '',
        platform: 'a',
        baseA: '',
        baseB: '',
        endpointPairs: [{ endpointA: '', endpointB: '' }]
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewJob({
      name: '',
      platform: 'a',
      baseA: '',
      baseB: '',
      endpointPairs: [{ endpointA: '', endpointB: '' }]
    });
  };

  const handleDeleteJob = (index: number) => {
    const updatedJobs = config.jobs.filter((_, i) => i !== index);
    setJobs(updatedJobs);
  };

  const isJobValid = (job: Job): boolean => {
    return Boolean(
      job.name &&
      job.baseA &&
      job.baseB &&
      job.endpointPairs.length > 0 &&
      job.endpointPairs.every(pair => pair.endpointA && pair.endpointB)
    );
  };

  const handleAddPair = () => {
    setNewJob({
      ...newJob,
      endpointPairs: [...newJob.endpointPairs, { endpointA: '', endpointB: '' }]
    });
  };

  const handleRemovePair = (index: number) => {
    setNewJob({
      ...newJob,
      endpointPairs: newJob.endpointPairs.filter((_, i) => i !== index)
    });
  };

  const updatePair = (index: number, field: keyof EndpointPair, value: string) => {
    const updatedPairs = [...newJob.endpointPairs];
    updatedPairs[index] = { ...updatedPairs[index], [field]: value };
    setNewJob({ ...newJob, endpointPairs: updatedPairs });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparison Jobs</CardTitle>
          <CardDescription>
            Create and manage API comparison jobs. Each job pairs endpoints and specifies base URLs for comparison.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Job list */}
            {config.jobs.length > 0 ? (
              <div className="space-y-4">
                {config.jobs.map((job, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={editingIndex === index ? "border-primary" : ""}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{job.name}</h3>
                            <p className="text-sm text-muted-foreground">Platform: {job.platform}</p>
                            <p className="text-sm text-muted-foreground">Base A: {job.baseA}</p>
                            <p className="text-sm text-muted-foreground">Base B: {job.baseB}</p>
                            <div className="mt-2">
                              <p className="text-sm font-medium">Endpoint Pairs:</p>
                              <ul className="text-sm pl-5 list-disc">
                                {job.endpointPairs.map((pair, i) => (
                                  <li key={i} className="text-muted-foreground">
                                    {pair.endpointA} ⟶ {pair.endpointB}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditJob(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteJob(index)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No comparison jobs configured yet. Add your first job below.
              </div>
            )}

            {/* Add/Edit job form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingIndex !== null ? 'Edit Comparison Job' : 'Add New Comparison Job'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Name</label>
                    <Input 
                      placeholder="e.g., Prod v1 vs Stg v2"
                      value={newJob.name}
                      onChange={e => setNewJob({ ...newJob, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(platform => (
                        <Button
                          key={platform}
                          type="button"
                          size="sm"
                          variant={newJob.platform === platform ? "default" : "outline"}
                          onClick={() => setNewJob({ ...newJob, platform })}
                        >
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Base URL A</label>
                      <Input 
                        placeholder="e.g., https://apiserver.cricbuzz.com"
                        value={newJob.baseA}
                        onChange={e => setNewJob({ ...newJob, baseA: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Base URL for first environment (e.g., production)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Base URL B</label>
                      <Input 
                        placeholder="e.g., http://api.cricbuzz.stg"
                        value={newJob.baseB}
                        onChange={e => setNewJob({ ...newJob, baseB: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Base URL for second environment (e.g., staging)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Endpoint Pairs</h4>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddPair}>
                        <Plus className="mr-2 h-4 w-4" /> Add Pair
                      </Button>
                    </div>
                    
                    {newJob.endpointPairs.map((pair, index) => (
                      <Card key={index} className="relative">
                        <CardContent className="p-4">
                          <div className="absolute right-2 top-2">
                            {newJob.endpointPairs.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemovePair(index)}
                                className="h-6 w-6"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Endpoint A</label>
                              <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={pair.endpointA}
                                onChange={e => updatePair(index, 'endpointA', e.target.value)}
                              >
                                <option value="">Select endpoint</option>
                                {config.endpoints.map((endpoint, i) => (
                                  <option key={i} value={endpoint.key}>
                                    {endpoint.key}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Endpoint B</label>
                              <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={pair.endpointB}
                                onChange={e => updatePair(index, 'endpointB', e.target.value)}
                              >
                                <option value="">Select endpoint</option>
                                {config.endpoints.map((endpoint, i) => (
                                  <option key={i} value={endpoint.key}>
                                    {endpoint.key}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {!config.endpoints.length && (
                      <div className="flex items-center p-4 text-amber-600 border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 rounded-md">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Please add endpoints first before creating comparison jobs.</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {editingIndex !== null ? (
                  <>
                    <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                    <Button 
                      onClick={handleSaveEdit}
                      disabled={!isJobValid(newJob)}
                    >
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleAddJob} 
                    className="ml-auto"
                    disabled={!isJobValid(newJob)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Job
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
