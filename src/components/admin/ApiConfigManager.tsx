import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getApiConfig, updateApiConfig, clearApiConfigCache } from '@/lib/api-config';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useClerkUser } from '@/hooks/useClerkUser';
import { Loader2, Globe, Settings, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ApiConfigManager: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('');
  const [timeout, setTimeout] = useState(30000);
  const [retries, setRetries] = useState(3);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  
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
        timeout,
        retries
      }, user?.id);

      if (success) {
        toast({
          title: "Success",
          description: "API configuration updated successfully",
          variant: "default"
        });
        setConnectionStatus('unknown'); // Reset connection status
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

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('unknown');

    try {
      // Test the connection by making a simple request
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (response.ok) {
        setConnectionStatus('success');
        toast({
          title: "Connection Successful",
          description: "API server is responding correctly",
          variant: "default"
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: `Server responded with status: ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: "Unable to reach the API server",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
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
            {connectionStatus !== 'unknown' && (
              <Badge variant={connectionStatus === 'success' ? 'default' : 'destructive'}>
                {connectionStatus === 'success' ? 'Connected' : 'Disconnected'}
              </Badge>
            )}
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
        <div className="space-y-2">
          <Label htmlFor="baseUrl">API Base URL</Label>
          <Input
            id="baseUrl"
            placeholder="http://localhost:3001"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            The base URL of your API server (e.g., http://localhost:3001 or https://api.example.com)
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
          
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={testingConnection || !baseUrl.trim()}
          >
            {testingConnection && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Test Connection
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