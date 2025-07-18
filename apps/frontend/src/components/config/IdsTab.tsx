import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { useConfig } from '../../contexts/ConfigContext';
import { useToast } from '../../hooks/use-toast';
import { IdValue } from '../../types/config';
import { PlusCircle, Edit, Save, Trash, Download } from 'lucide-react';

interface ParamItem {
  key: string;
  name: string;
  value: string;
  enabled: boolean;
}

export default function ParamsTab() {
  const { config, setIds } = useConfig();
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newParam, setNewParam] = useState<ParamItem>({
    key: '',
    name: '',
    value: '',
    enabled: true
  });

  // Convert object-based ids to array format for display
  const paramsArray: ParamItem[] = [];
  Object.entries(config.ids || {}).forEach(([category, idValues]) => {
    if (Array.isArray(idValues)) {
      idValues.forEach((idValue) => {
        paramsArray.push({
          key: `${category}:${idValue.name}`,
          name: idValue.name,
          value: idValue.value,
          enabled: idValue.enabled || true
        });
      });
    }
  });

  const handleAddParam = () => {
    if (newParam.key && newParam.name && newParam.value) {
      const updatedParams = [...paramsArray, { ...newParam }];
      convertAndSetIds(updatedParams);
      setNewParam({
        key: '',
        name: '',
        value: '',
        enabled: true
      });
    }
  };

  const handleEditParam = (index: number) => {
    setEditingIndex(index);
    setNewParam({ ...paramsArray[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && newParam.key && newParam.name && newParam.value) {
      const updatedParams = [...paramsArray];
      updatedParams[editingIndex] = { ...newParam };
      convertAndSetIds(updatedParams);
      setEditingIndex(null);
      setNewParam({
        key: '',
        name: '',
        value: '',
        enabled: true
      });
    }
  };

  const handleDeleteParam = (index: number) => {
    const updatedParams = paramsArray.filter((_, i) => i !== index);
    convertAndSetIds(updatedParams);
  };

  const convertAndSetIds = (params: ParamItem[]) => {
    const idsObject: { [category: string]: IdValue[] } = {};
    params.forEach((param) => {
      if (param.enabled) {
        const [category, ...nameParts] = param.key.split(':');
        const name = nameParts.join(':');
        if (!idsObject[category]) {
          idsObject[category] = [];
        }
        idsObject[category].push({
          name: name,
          value: param.value,
          enabled: param.enabled
        });
      }
    });
    setIds(idsObject);
  };

  const exportParams = () => {
    const dataStr = JSON.stringify(paramsArray, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'params.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({
      title: "Params Exported",
      description: "Params have been exported to params.json"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Params Configuration</CardTitle>
          <CardDescription>
            Define parameters for API comparison tests. Parameters are organized by category (use format: category:param-name).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={exportParams} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Params
            </Button>
          </div>

          <div className="space-y-3">
            {paramsArray.map((param, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3 p-3 border rounded-lg"
              >
                <Switch
                  checked={param.enabled}
                  onCheckedChange={(checked) => {
                    const updatedParams = [...paramsArray];
                    updatedParams[index].enabled = checked;
                    convertAndSetIds(updatedParams);
                  }}
                />
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium">Key</label>
                    {editingIndex === index ? (
                      <Input
                        value={newParam.key}
                        onChange={(e) => setNewParam({ ...newParam, key: e.target.value })}
                        placeholder="category:param-name"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{param.key}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    {editingIndex === index ? (
                      <Input
                        value={newParam.name}
                        onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
                        placeholder="Parameter name"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{param.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Value</label>
                    {editingIndex === index ? (
                      <Input
                        value={newParam.value}
                        onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
                        placeholder="Parameter value"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground truncate">{param.value}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {editingIndex === index ? (
                    <Button onClick={handleSaveEdit} size="sm">
                      <Save className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => handleEditParam(index)} variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  <Button onClick={() => handleDeleteParam(index)} variant="destructive" size="sm">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center space-x-3 w-full">
            <Switch
              checked={newParam.enabled}
              onCheckedChange={(checked) => setNewParam({ ...newParam, enabled: checked })}
            />
            <div className="flex-1 grid grid-cols-3 gap-3">
              <Input
                placeholder="category:param-name (e.g., matches:match1)"
                value={newParam.key}
                onChange={(e) => setNewParam({ ...newParam, key: e.target.value })}
              />
              <Input
                placeholder="Parameter name"
                value={newParam.name}
                onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
              />
              <Input
                placeholder="Parameter value"
                value={newParam.value}
                onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
              />
            </div>
            <Button onClick={handleAddParam}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Param
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
