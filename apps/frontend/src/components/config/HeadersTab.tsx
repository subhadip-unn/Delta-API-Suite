import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { useConfig } from '../../contexts/ConfigContext';
import { useToast } from '../../hooks/use-toast';
import { Header } from '../../types/config';
import { PlusCircle, Edit, Save, Trash, Download } from 'lucide-react';

export default function HeadersTab() {
  const { config, setHeaders } = useConfig();
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newHeader, setNewHeader] = useState<Header>({
    key: '',
    value: '',
    enabled: true
  });

  // Convert object-based headers to array format for display
  const headersArray: Header[] = [];
  Object.entries(config.headers || {}).forEach(([platform, platformHeaders]) => {
    Object.entries(platformHeaders).forEach(([key, value]) => {
      headersArray.push({
        key: `${platform}:${key}`,
        value: value as string,
        enabled: true
      });
    });
  });

  const handleAddHeader = () => {
    if (newHeader.key && newHeader.value) {
      const updatedHeaders = [...headersArray, { ...newHeader }];
      convertAndSetHeaders(updatedHeaders);
      setNewHeader({
        key: '',
        value: '',
        enabled: true
      });
    }
  };

  const handleEditHeader = (index: number) => {
    setEditingIndex(index);
    setNewHeader({ ...headersArray[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && newHeader.key && newHeader.value) {
      const updatedHeaders = [...headersArray];
      updatedHeaders[editingIndex] = { ...newHeader };
      convertAndSetHeaders(updatedHeaders);
      setEditingIndex(null);
      setNewHeader({
        key: '',
        value: '',
        enabled: true
      });
    }
  };

  const handleDeleteHeader = (index: number) => {
    const updatedHeaders = headersArray.filter((_, i) => i !== index);
    convertAndSetHeaders(updatedHeaders);
  };

  const convertAndSetHeaders = (headers: Header[]) => {
    const headersObject: { [platform: string]: { [key: string]: string } } = {};
    headers.forEach((header) => {
      if (header.enabled) {
        const [platform, ...keyParts] = header.key.split(':');
        const key = keyParts.join(':');
        if (!headersObject[platform]) {
          headersObject[platform] = {};
        }
        headersObject[platform][key] = header.value;
      }
    });
    setHeaders(headersObject);
  };

  const exportHeaders = () => {
    const dataStr = JSON.stringify(headersArray, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'headers.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({
      title: "Headers Exported",
      description: "Headers have been exported to headers.json"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Headers Configuration</CardTitle>
          <CardDescription>
            Define HTTP headers to be sent with API requests. Headers are organized by platform (use format: platform:header-name).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={exportHeaders} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Headers
            </Button>
          </div>

          <div className="space-y-3">
            {headersArray.map((header, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3 p-3 border rounded-lg"
              >
                <Switch
                  checked={header.enabled}
                  onCheckedChange={(checked) => {
                    const updatedHeaders = [...headersArray];
                    updatedHeaders[index].enabled = checked;
                    convertAndSetHeaders(updatedHeaders);
                  }}
                />
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Key</label>
                    {editingIndex === index ? (
                      <Input
                        value={newHeader.key}
                        onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
                        placeholder="platform:header-name"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{header.key}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Value</label>
                    {editingIndex === index ? (
                      <Input
                        value={newHeader.value}
                        onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
                        placeholder="Header value"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground truncate">{header.value}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {editingIndex === index ? (
                    <Button onClick={handleSaveEdit} size="sm">
                      <Save className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => handleEditHeader(index)} variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  <Button onClick={() => handleDeleteHeader(index)} variant="destructive" size="sm">
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
              checked={newHeader.enabled}
              onCheckedChange={(checked) => setNewHeader({ ...newHeader, enabled: checked })}
            />
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Input
                placeholder="platform:header-name (e.g., i:User-Agent)"
                value={newHeader.key}
                onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
              />
              <Input
                placeholder="Header value"
                value={newHeader.value}
                onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
              />
            </div>
            <Button onClick={handleAddHeader}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Header
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
