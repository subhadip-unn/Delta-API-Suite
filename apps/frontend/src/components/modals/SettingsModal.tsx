import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  Palette, 
  Globe, 
  Shield, 

  Save,
  RotateCcw
} from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SettingsData {
  // Profile Settings
  displayName: string;
  email: string;
  role: string;
  
  // Appearance Settings
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  compactMode: boolean;
  showAnimations: boolean;
  
  // API Settings
  defaultTimeout: number;
  maxConcurrentRequests: number;
  retryAttempts: number;
  enableCaching: boolean;
  
  // Export Settings
  defaultExportFormat: 'json' | 'pdf' | 'html';
  includeTimestamps: boolean;
  compressExports: boolean;
  
  // Notification Settings
  enableNotifications: boolean;
  notifyOnCompletion: boolean;
  notifyOnErrors: boolean;
  soundEnabled: boolean;
  
  // Privacy Settings
  autoLogout: boolean;
  logoutTimeout: number;
  clearDataOnLogout: boolean;
  enableAnalytics: boolean;
}

const defaultSettings: SettingsData = {
  displayName: '',
  email: '',
  role: 'QA Engineer',
  theme: 'system',
  accentColor: 'blue',
  compactMode: false,
  showAnimations: true,
  defaultTimeout: 30,
  maxConcurrentRequests: 5,
  retryAttempts: 3,
  enableCaching: true,
  defaultExportFormat: 'json',
  includeTimestamps: true,
  compressExports: false,
  enableNotifications: true,
  notifyOnCompletion: true,
  notifyOnErrors: true,
  soundEnabled: false,
  autoLogout: false,
  logoutTimeout: 30,
  clearDataOnLogout: true,
  enableAnalytics: false,
};

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('cbz-user-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('cbz-user-settings', JSON.stringify(settings));
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile Information
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={settings.displayName}
              onChange={(e) => updateSetting('displayName', e.target.value)}
              placeholder="Enter your display name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateSetting('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={settings.role} onValueChange={(value) => updateSetting('role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                <SelectItem value="Developer">Developer</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Appearance & Theme
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select value={settings.theme} onValueChange={(value: any) => updateSetting('theme', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="accentColor">Accent Color</Label>
            <Select value={settings.accentColor} onValueChange={(value) => updateSetting('accentColor', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compactMode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
            </div>
            <Switch
              id="compactMode"
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSetting('compactMode', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showAnimations">Show Animations</Label>
              <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
            </div>
            <Switch
              id="showAnimations"
              checked={settings.showAnimations}
              onCheckedChange={(checked) => updateSetting('showAnimations', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAPITab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          API Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="defaultTimeout">Default Timeout (seconds)</Label>
            <Input
              id="defaultTimeout"
              type="number"
              value={settings.defaultTimeout}
              onChange={(e) => updateSetting('defaultTimeout', parseInt(e.target.value) || 30)}
              min="5"
              max="300"
            />
          </div>
          <div>
            <Label htmlFor="maxConcurrentRequests">Max Concurrent Requests</Label>
            <Input
              id="maxConcurrentRequests"
              type="number"
              value={settings.maxConcurrentRequests}
              onChange={(e) => updateSetting('maxConcurrentRequests', parseInt(e.target.value) || 5)}
              min="1"
              max="20"
            />
          </div>
          <div>
            <Label htmlFor="retryAttempts">Retry Attempts</Label>
            <Input
              id="retryAttempts"
              type="number"
              value={settings.retryAttempts}
              onChange={(e) => updateSetting('retryAttempts', parseInt(e.target.value) || 3)}
              min="0"
              max="10"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableCaching">Enable Response Caching</Label>
              <p className="text-sm text-muted-foreground">Cache API responses for better performance</p>
            </div>
            <Switch
              id="enableCaching"
              checked={settings.enableCaching}
              onCheckedChange={(checked) => updateSetting('enableCaching', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Privacy & Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoLogout">Auto Logout</Label>
              <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
            </div>
            <Switch
              id="autoLogout"
              checked={settings.autoLogout}
              onCheckedChange={(checked) => updateSetting('autoLogout', checked)}
            />
          </div>
          {settings.autoLogout && (
            <div>
              <Label htmlFor="logoutTimeout">Logout Timeout (minutes)</Label>
              <Input
                id="logoutTimeout"
                type="number"
                value={settings.logoutTimeout}
                onChange={(e) => updateSetting('logoutTimeout', parseInt(e.target.value) || 30)}
                min="5"
                max="480"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="clearDataOnLogout">Clear Data on Logout</Label>
              <p className="text-sm text-muted-foreground">Remove all stored data when logging out</p>
            </div>
            <Switch
              id="clearDataOnLogout"
              checked={settings.clearDataOnLogout}
              onCheckedChange={(checked) => updateSetting('clearDataOnLogout', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableAnalytics">Enable Analytics</Label>
              <p className="text-sm text-muted-foreground">Help improve the platform with usage data</p>
            </div>
            <Switch
              id="enableAnalytics"
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <div className="flex h-full">
          {/* Header */}
          <div className="w-full">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
                {hasChanges && (
                  <Badge variant="secondary" className="ml-2">
                    Unsaved Changes
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="p-6">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="api">API</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[50vh]">
                  <TabsContent value="profile" className="mt-6">
                    {renderProfileTab()}
                  </TabsContent>
                  <TabsContent value="appearance" className="mt-6">
                    {renderAppearanceTab()}
                  </TabsContent>
                  <TabsContent value="api" className="mt-6">
                    {renderAPITab()}
                  </TabsContent>
                  <TabsContent value="privacy" className="mt-6">
                    {renderPrivacyTab()}
                  </TabsContent>
                </ScrollArea>

                {/* Action Buttons */}
                <Separator />
                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={resetSettings}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveSettings} disabled={!hasChanges}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
