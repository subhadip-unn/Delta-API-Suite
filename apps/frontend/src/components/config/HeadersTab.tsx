import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { useConfig } from '../../contexts/ConfigContext';
import { Header } from '../../types/config';
import { PlusCircle, Edit, Save, Trash } from 'lucide-react';

export default function HeadersTab() {
  const { config, setHeaders } = useConfig();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newHeader, setNewHeader] = useState<Header>({
    key: '',
    value: '',
    enabled: true
  });

  const handleAddHeader = () => {
    if (newHeader.key && newHeader.value) {
      const updatedHeaders = [...config.headers, { ...newHeader }];
      setHeaders(updatedHeaders);
      setNewHeader({
        key: '',
        value: '',
        enabled: true
      });
    }
  };

  const handleEditHeader = (index: number) => {
    setEditingIndex(index);
    setNewHeader({ ...config.headers[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && newHeader.key && newHeader.value) {
      const updatedHeaders = [...config.headers];
      updatedHeaders[editingIndex] = { ...newHeader };
      setHeaders(updatedHeaders);
      setEditingIndex(null);
      setNewHeader({
        key: '',
        value: '',
        enabled: true
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewHeader({
      key: '',
      value: '',
      enabled: true
    });
  };

  const handleDeleteHeader = (index: number) => {
    const updatedHeaders = config.headers.filter((_, i) => i !== index);
    setHeaders(updatedHeaders);
  };

  const toggleHeaderEnabled = (index: number) => {
    const updatedHeaders = [...config.headers];
    updatedHeaders[index] = { 
      ...updatedHeaders[index], 
      enabled: !updatedHeaders[index].enabled 
    };
    setHeaders(updatedHeaders);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HTTP Headers</CardTitle>
          <CardDescription>
            Configure default HTTP headers sent with API requests.
            Enable/disable headers as needed without removing them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header list */}
            {config.headers.length > 0 ? (
              <div className="space-y-4">
                {config.headers.map((header, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`${editingIndex === index ? "border-primary" : ""} ${!header.enabled ? "opacity-60" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={header.enabled}
                                onCheckedChange={() => toggleHeaderEnabled(index)}
                              />
                              <h3 className="font-medium">{header.key}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{header.value}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditHeader(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteHeader(index)}>
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
                No headers configured yet. Add your first header below.
              </div>
            )}

            {/* Add/Edit header form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingIndex !== null ? 'Edit Header' : 'Add New Header'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Header Name</label>
                    <Input 
                      placeholder="e.g., Content-Type"
                      value={newHeader.key}
                      onChange={e => setNewHeader({ ...newHeader, key: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value</label>
                    <Input 
                      placeholder="e.g., application/json"
                      value={newHeader.value}
                      onChange={e => setNewHeader({ ...newHeader, value: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="header-enabled"
                    checked={newHeader.enabled}
                    onCheckedChange={checked => setNewHeader({ ...newHeader, enabled: checked })}
                  />
                  <label htmlFor="header-enabled" className="text-sm font-medium">
                    Enabled
                  </label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {editingIndex !== null ? (
                  <>
                    <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                    <Button 
                      onClick={handleSaveEdit}
                      disabled={!newHeader.key || !newHeader.value}
                    >
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleAddHeader} 
                    className="ml-auto"
                    disabled={!newHeader.key || !newHeader.value}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Header
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
