import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useConfig } from '../../contexts/ConfigContext';
import { Id } from '../../types/config';
import { PlusCircle, Edit, Save, Trash, X } from 'lucide-react';

export default function IdsTab() {
  const { config, setIds } = useConfig();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newId, setNewId] = useState<Id>({
    category: '',
    values: []
  });
  const [newValue, setNewValue] = useState<string>('');

  const handleAddId = () => {
    if (newId.category && newId.values.length > 0) {
      const updatedIds = [...config.ids, { ...newId }];
      setIds(updatedIds);
      setNewId({
        category: '',
        values: []
      });
    }
  };

  const handleEditId = (index: number) => {
    setEditingIndex(index);
    setNewId({ ...config.ids[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && newId.category && newId.values.length > 0) {
      const updatedIds = [...config.ids];
      updatedIds[editingIndex] = { ...newId };
      setIds(updatedIds);
      setEditingIndex(null);
      setNewId({
        category: '',
        values: []
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewId({
      category: '',
      values: []
    });
  };

  const handleDeleteId = (index: number) => {
    const updatedIds = config.ids.filter((_, i) => i !== index);
    setIds(updatedIds);
  };

  const handleAddValue = () => {
    if (newValue && !newId.values.includes(newValue)) {
      setNewId({
        ...newId,
        values: [...newId.values, newValue]
      });
      setNewValue('');
    }
  };

  const handleDeleteValue = (valueIndex: number) => {
    setNewId({
      ...newId,
      values: newId.values.filter((_, i) => i !== valueIndex)
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && newValue) {
      event.preventDefault();
      handleAddValue();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>IDs</CardTitle>
          <CardDescription>
            Configure IDs for API testing. IDs are organized by category 
            (e.g., matchId, tournamentId) and used when endpoints require IDs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* ID list */}
            {config.ids.length > 0 ? (
              <div className="space-y-4">
                {config.ids.map((id, index) => (
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
                            <h3 className="font-medium">{id.category}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {id.values.map((value, i) => (
                                <span key={i} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                                  {value}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditId(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteId(index)}>
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
                No IDs configured yet. Add your first ID category below.
              </div>
            )}

            {/* Add/Edit ID form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingIndex !== null ? 'Edit ID Category' : 'Add New ID Category'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input 
                    placeholder="e.g., matchId"
                    value={newId.category}
                    onChange={e => setNewId({ ...newId, category: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    ID category name (e.g., matchId, tournamentId)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ID Values</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g., 12345"
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button type="button" onClick={handleAddValue} disabled={!newValue}>
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Press Enter to add multiple values
                  </p>
                </div>

                {/* Display current values */}
                {newId.values.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Values:</label>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                      {newId.values.map((value, index) => (
                        <div 
                          key={index} 
                          className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded"
                        >
                          <span className="text-sm">{value}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 ml-1"
                            onClick={() => handleDeleteValue(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {editingIndex !== null ? (
                  <>
                    <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                    <Button 
                      onClick={handleSaveEdit}
                      disabled={!newId.category || newId.values.length === 0}
                    >
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleAddId} 
                    className="ml-auto"
                    disabled={!newId.category || newId.values.length === 0}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add ID Category
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
