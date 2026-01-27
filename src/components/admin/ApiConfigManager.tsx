import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getApiConfig, updateUserLocalUrl, clearApiConfigCache, getActiveApiUrl } from '@/lib/api-config';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useClerkUser } from '@/hooks/useClerkUser';
import { Loader2, Globe, Settings, RefreshCw, Server, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ApiConfigManager: React.FC = () => {
  const [globalBaseUrl, setGlobalBaseUrl] = useState('');
  const [localUrl, setLocalUrl] = useState('');
  const [useLocalUrl, setUseLocalUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [testingLocalConnection, setTestingLocalConnection] = useState(false);
  const [localConnectionStatus, setLocalConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  
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
      setGlobalBaseUrl(config.baseUrl);
      setLocalUrl(config.localUrl || '');
      setUseLocalUrl(config.useLocalUrl || false);
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

  const handleSaveLocalConfig = async () => {
    // Validate local URL if toggle is enabled
    if (useLocalUrl && localUrl.trim()) {
      try {
        new URL(localUrl);
      } catch {
        toast({
          title: "Error",
          description: "Please enter a valid URL (e.g., http://localhost:3001)",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      const success = await updateUserLocalUrl(
        localUrl.trim(),
        useLocalUrl,
        user?.id || ''
      );

      if (success) {
        toast({
          title: "Success",
          description: "Your local API configuration updated successfully",
          variant: "default"
        });
        setLocalConnectionStatus('unknown');
      } else {
        toast({
          title: "Error",
          description: "Failed to update local API configuration",
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

  const testConnection = async (url: string) => {
    setTestingLocalConnection(true);
    setLocalConnectionStatus('unknown');

    const endpointsToTry = ['/health', '/api/health', '/ping', '/'];

    try {
      let lastError: Error | null = null;
      let succeeded = false;

      for (const endpoint of endpointsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = window.setTimeout(() => controller.abort(), 10000);

          const response = await fetch(`${url}${endpoint}`, {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Accept': 'application/json, text/plain, */*'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (response.ok || response.status < 500) {
            setLocalConnectionStatus('success');
            toast({
              title: "Connection Successful",
              description: "Local development server is reachable",
              variant: "default"
            });
            succeeded = true;
            break;
          }
        } catch (e) {
          lastError = e as Error;
        }
      }

      if (!succeeded) {
        // Try no-cors as fallback
        try {
          const controller = new AbortController();
          const timeoutId = window.setTimeout(() => controller.abort(), 10000);

          await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors',
            headers: {
              'ngrok-skip-browser-warning': 'true'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          setLocalConnectionStatus('success');
          toast({
            title: "Connection Likely Successful",
            description: "Local server responded (CORS may block full verification)",
            variant: "default"
          });
          succeeded = true;
        } catch {
          // Even no-cors failed
        }
      }

      if (!succeeded) {
        setLocalConnectionStatus('error');
        const errorMessage = lastError?.name === 'AbortError' 
          ? 'Connection timed out' 
          : 'Unable to reach the local development server';
        toast({
          title: "Connection Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      setLocalConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: "Unable to reach the local development server",
        variant: "destructive"
      });
    } finally {
      setTestingLocalConnection(false);
    }
  };

  const refreshConfig = async () => {
    clearApiConfigCache(user?.id);
    await loadCurrentConfig();
    toast({
      title: "Refreshed",
      description: "Configuration cache cleared and reloaded",
      variant: "default"
    });
  };

  const handleToggleChange = (checked: boolean) => {
    setUseLocalUrl(checked);
    // If turning off, we should still save (so user goes back to production)
    // If turning on but no URL, remind user to enter one
    if (checked && !localUrl.trim()) {
      toast({
        title: "Enter Local URL",
        description: "Please enter your local development URL below",
        variant: "default"
      });
    }
  };

  // Get active URL for display
  const activeUrl = useLocalUrl && localUrl ? localUrl : globalBaseUrl;
  const isUsingLocal = useLocalUrl && localUrl;

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
            <Badge variant={isUsingLocal ? 'secondary' : 'default'}>
              {isUsingLocal ? 'LOCAL' : 'PROD'}
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
          Configure your local development API URL. Other users will continue using the production URL.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Production URL - Editable */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-green-500" />
            <Label htmlFor="globalUrl">Global Production URL</Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="globalUrl"
              placeholder="https://api.example.com"
              value={globalBaseUrl}
              onChange={(e) => setGlobalBaseUrl(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            The production API URL used by all users when not using a local override.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Local Development Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            {isUsingLocal ? (
              <Code className="h-5 w-5 text-orange-500" />
            ) : (
              <Server className="h-5 w-5 text-green-500" />
            )}
            <div>
              <Label className="text-base font-medium">
                Use Local Development Server
              </Label>
              <p className="text-sm text-muted-foreground">
                {isUsingLocal 
                  ? 'API calls from YOUR session will use your local URL' 
                  : 'API calls are using the global production URL'}
              </p>
            </div>
          </div>
          <Switch
            checked={useLocalUrl}
            onCheckedChange={handleToggleChange}
            disabled={loading}
          />
        </div>

        {/* Local URL Input - Always visible but highlighted when toggle is on */}
        <div className={`space-y-2 p-4 rounded-lg border ${useLocalUrl ? 'border-orange-500/50 bg-orange-500/5' : 'border-border'}`}>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-orange-500" />
            <Label htmlFor="localUrl">Your Local Development URL</Label>
            {localConnectionStatus !== 'unknown' && (
              <Badge variant={localConnectionStatus === 'success' ? 'default' : 'destructive'} className="text-xs">
                {localConnectionStatus === 'success' ? 'Connected' : 'Error'}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              id="localUrl"
              placeholder="http://localhost:3001 or ngrok URL"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection(localUrl)}
              disabled={testingLocalConnection || !localUrl.trim()}
            >
              {testingLocalConnection && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Test
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your local development or ngrok tunnel URL. Only affects YOUR session.
          </p>
        </div>

        {/* Active URL Display */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4" />
            <span className="font-medium">Active API URL for Your Session</span>
          </div>
          <code className="text-sm bg-background px-2 py-1 rounded border break-all">
            {activeUrl}
          </code>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSaveLocalConfig}
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save My Configuration
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Toggle ON to use your local development server</li>
            <li>Your local URL is private to your session only</li>
            <li>Other users will continue using the production URL</li>
            <li>Toggle OFF to switch back to production</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiConfigManager;
