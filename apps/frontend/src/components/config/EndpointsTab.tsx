import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useConfig } from '../../contexts/ConfigContext';
import { Endpoint } from '../../types/config';
import { PlusCircle, Edit, Save, Trash } from 'lucide-react';

const PLATFORMS = ['a', 'i', 'm', 'w'];

export default function EndpointsTab() {
  const { config, setEndpoints } = useConfig();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newEndpoint, setNewEndpoint] = useState<Endpoint>({
    key: '',
    path: '',
    platforms: [],
    idCategory: null,
  });

  const handleAddEndpoint = () => {
    if (newEndpoint.key && newEndpoint.path) {
      const updatedEndpoints = [...config.endpoints, { ...newEndpoint }];
      setEndpoints(updatedEndpoints);
      setNewEndpoint({
        key: '',
        path: '',
        platforms: [],
        idCategory: null,
      });
    }
  };

  const handleEditEndpoint = (index: number) => {
    setEditingIndex(index);
    setNewEndpoint({ ...config.endpoints[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && newEndpoint.key && newEndpoint.path) {
      const updatedEndpoints = [...config.endpoints];
      updatedEndpoints[editingIndex] = { ...newEndpoint };
      setEndpoints(updatedEndpoints);
      setEditingIndex(null);
      setNewEndpoint({
        key: '',
        path: '',
        platforms: [],
        idCategory: null,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewEndpoint({
      key: '',
      path: '',
      platforms: [],
      idCategory: null,
    });
  };

  const handleDeleteEndpoint = (index: number) => {
    const updatedEndpoints = config.endpoints.filter((_, i) => i !== index);
    setEndpoints(updatedEndpoints);
  };

  const togglePlatform = (platform: string) => {
    const updatedPlatforms = newEndpoint.platforms.includes(platform)
      ? newEndpoint.platforms.filter(p => p !== platform)
      : [...newEndpoint.platforms, platform];
    
    setNewEndpoint({ ...newEndpoint, platforms: updatedPlatforms });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
          <CardDescription>
            Define API endpoints for testing. Each endpoint needs a unique key and path.
            Version differences (v1, v2) should be separate endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Endpoint list */}
            {config.endpoints.length > 0 ? (
              <div className="space-y-4">
                {config.endpoints.map((endpoint, index) => (
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
                            <h3 className="font-medium">{endpoint.key}</h3>
                            <p className="text-sm text-muted-foreground">{endpoint.path}</p>
                            <div className="flex gap-1 mt-2">
                              {endpoint.platforms.map(p => (
                                <span key={p} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditEndpoint(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEndpoint(index)}>
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
                No endpoints configured yet. Add your first endpoint below.
              </div>
            )}

            {/* Add/Edit endpoint form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingIndex !== null ? 'Edit Endpoint' : 'Add New Endpoint'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endpoint Key</label>
                    <Input 
                      placeholder="e.g., home-matches-v1"
                      value={newEndpoint.key}
                      onChange={e => setNewEndpoint({ ...newEndpoint, key: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Unique identifier for this endpoint
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Path</label>
                    <Input 
                      placeholder="e.g., home/v1/matches"
                      value={newEndpoint.path}
                      onChange={e => setNewEndpoint({ ...newEndpoint, path: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Path without base URL (e.g., home/v1/matches)
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(platform => (
                      <Button
                        key={platform}
                        type="button"
                        size="sm"
                        variant={newEndpoint.platforms.includes(platform) ? "default" : "outline"}
                        onClick={() => togglePlatform(platform)}
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID Category (Optional)</label>
                  <Input 
                    placeholder="e.g., matchId (leave empty if none)"
                    value={newEndpoint.idCategory || ''}
                    onChange={e => setNewEndpoint({ ...newEndpoint, idCategory: e.target.value || null })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {editingIndex !== null ? (
                  <>
                    <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                    <Button onClick={handleSaveEdit}>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAddEndpoint} className="ml-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Endpoint
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
