import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getApiConfig, updateApiConfig, clearApiConfigCache, getActiveApiUrl } from '@/lib/api-config';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useClerkUser } from '@/hooks/useClerkUser';
import { Loader2, Globe, Settings, RefreshCw, Server, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ApiConfigManager: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('');
  const [devUrl, setDevUrl] = useState('');
  const [useDevUrl, setUseDevUrl] = useState(false);
  const [timeout, setTimeout] = useState(30000);
  const [retries, setRetries] = useState(3);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testingDevConnection, setTestingDevConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [devConnectionStatus, setDevConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { user } = useClerkUser();

  useEffect(() => {
    if (user?.id) {
      loadCurrentConfig();
    }
  }, [user?.id]);

  const loadCurrentConfig = async () => {
    try {
      setFetching(true);
      const config = await getApiConfig(user?.id);
      setBaseUrl(config.baseUrl);
      setDevUrl(config.devUrl || '');
      setUseDevUrl(config.useDevUrl || false);
      setTimeout(config.timeout);
      setRetries(config.retries);
    } catch (error) {
      console.error('Error loading API config:', error);
      toast({
        title: "Error",
        description: "Failed to load current API configuration",
        variant: "destructive"
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!baseUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid base URL",
        variant: "destructive"
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(baseUrl);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL (e.g., http://localhost:3001)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const success = await updateApiConfig({
        baseUrl: baseUrl.trim(),
        devUrl: devUrl.trim(),
        useDevUrl,
        timeout,
        retries
      }, user?.id);

      if (success) {
        toast({
          title: "Success",
          description: "API configuration updated successfully",
          variant: "default"
        });
        setConnectionStatus('unknown');
        setDevConnectionStatus('unknown');
      } else {
        toast({
          title: "Error",
          description: "Failed to update API configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating API config:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (url: string, isDev: boolean = false) => {
    if (isDev) {
      setTestingDevConnection(true);
      setDevConnectionStatus('unknown');
    } else {
      setTestingConnection(true);
      setConnectionStatus('unknown');
    }

    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (response.ok) {
        if (isDev) {
          setDevConnectionStatus('success');
        } else {
          setConnectionStatus('success');
        }
        toast({
          title: "Connection Successful",
          description: `${isDev ? 'Development' : 'Production'} API server is responding correctly`,
          variant: "default"
        });
      } else {
        if (isDev) {
          setDevConnectionStatus('error');
        } else {
          setConnectionStatus('error');
        }
        toast({
          title: "Connection Failed",
          description: `Server responded with status: ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      if (isDev) {
        setDevConnectionStatus('error');
      } else {
        setConnectionStatus('error');
      }
      toast({
        title: "Connection Failed",
        description: `Unable to reach the ${isDev ? 'development' : 'production'} API server`,
        variant: "destructive"
      });
    } finally {
      if (isDev) {
        setTestingDevConnection(false);
      } else {
        setTestingConnection(false);
      }
    }
  };

  const refreshConfig = async () => {
    clearApiConfigCache();
    await loadCurrentConfig();
    toast({
      title: "Refreshed",
      description: "Configuration cache cleared and reloaded",
      variant: "default"
    });
  };

  if (adminLoading || fetching) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading configuration...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You need admin privileges to manage API configuration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>API Configuration</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={useDevUrl ? 'secondary' : 'default'}>
              {useDevUrl ? 'DEV' : 'PROD'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshConfig}
              disabled={fetching}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Configure the dynamic API server URL and connection settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environment Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            {useDevUrl ? (
              <Code className="h-5 w-5 text-orange-500" />
            ) : (
              <Server className="h-5 w-5 text-green-500" />
            )}
            <div>
              <Label className="text-base font-medium">
                Active Environment: {useDevUrl ? 'Development' : 'Production'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {useDevUrl ? 'Using development URL for all API calls' : 'Using production URL for all API calls'}
              </p>
            </div>
          </div>
          <Switch
            checked={useDevUrl}
            onCheckedChange={setUseDevUrl}
            disabled={loading || !devUrl.trim()}
          />
        </div>

        {/* Production URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-green-500" />
            <Label htmlFor="baseUrl">Production API URL</Label>
            {connectionStatus !== 'unknown' && (
              <Badge variant={connectionStatus === 'success' ? 'default' : 'destructive'} className="text-xs">
                {connectionStatus === 'success' ? 'Connected' : 'Error'}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              id="baseUrl"
              placeholder="https://api.example.com"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection(baseUrl, false)}
              disabled={testingConnection || !baseUrl.trim()}
            >
              {testingConnection && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Test
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your production API server URL
          </p>
        </div>

        {/* Development URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-orange-500" />
            <Label htmlFor="devUrl">Development API URL</Label>
            {devConnectionStatus !== 'unknown' && (
              <Badge variant={devConnectionStatus === 'success' ? 'default' : 'destructive'} className="text-xs">
                {devConnectionStatus === 'success' ? 'Connected' : 'Error'}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              id="devUrl"
              placeholder="http://localhost:3001 or ngrok URL"
              value={devUrl}
              onChange={(e) => setDevUrl(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection(devUrl, true)}
              disabled={testingDevConnection || !devUrl.trim()}
            >
              {testingDevConnection && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Test
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your local development or ngrok tunnel URL (e.g., http://localhost:3001)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (ms)</Label>
            <Input
              id="timeout"
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(Number(e.target.value))}
              disabled={loading}
              min={1000}
              max={120000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retries">Max Retries</Label>
            <Input
              id="retries"
              type="number"
              value={retries}
              onChange={(e) => setRetries(Number(e.target.value))}
              disabled={loading}
              min={0}
              max={10}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSaveConfig}
            disabled={loading || !baseUrl.trim()}
            className="flex-1"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Configuration
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Usage Example:</h4>
          <code className="text-sm">
            {`import { apiClient } from '@/lib/api-config';

// Use the configured API client
const response = await apiClient.get('/api/data');
const data = await apiClient.post('/api/submit', { key: 'value' });`}
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiConfigManager;