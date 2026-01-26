import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getApiConfig, updateApiConfig, clearApiConfigCache, getActiveApiUrl, validateUrlPairs, UrlPair } from '@/lib/api-config';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useClerkUser } from '@/hooks/useClerkUser';
import { Loader2, Globe, Settings, RefreshCw, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UrlPairRowProps {
  pair: UrlPair;
  index: number;
  isDefault: boolean;
  isOnlyRow: boolean;
  connectionStatus: 'unknown' | 'success' | 'error';
  isTesting: boolean;
  onUpdate: (index: number, field: 'webUrl' | 'apiBaseUrl' | 'label', value: string) => void;
  onDelete: (index: number) => void;
  onTest: (index: number) => void;
  disabled: boolean;
}

const UrlPairRow: React.FC<UrlPairRowProps> = ({
  pair,
  index,
  isDefault,
  isOnlyRow,
  connectionStatus,
  isTesting,
  onUpdate,
  onDelete,
  onTest,
  disabled
}) => {
  const getStatusIcon = () => {
    if (connectionStatus === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (connectionStatus === 'error') return <XCircle className="h-4 w-4 text-destructive" />;
    return null;
  };

  return (
    <div className="p-4 rounded-lg border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
          {isDefault && (
            <Badge variant="secondary" className="text-xs">Default</Badge>
          )}
          {getStatusIcon()}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(index)}
          disabled={disabled || isOnlyRow}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Web URL (leave empty for default)</Label>
          <Input
            placeholder="example.com or leave empty for default"
            value={pair.webUrl}
            onChange={(e) => onUpdate(index, 'webUrl', e.target.value)}
            disabled={disabled}
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">API Base URL</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://api.example.com"
              value={pair.apiBaseUrl}
              onChange={(e) => onUpdate(index, 'apiBaseUrl', e.target.value)}
              disabled={disabled}
              className="h-9 flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTest(index)}
              disabled={isTesting || !pair.apiBaseUrl.trim()}
              className="h-9 px-3"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Label (optional)</Label>
        <Input
          placeholder="e.g., Production, Development, Staging"
          value={pair.label || ''}
          onChange={(e) => onUpdate(index, 'label', e.target.value)}
          disabled={disabled}
          className="h-9"
        />
      </div>
      
      {isDefault && (
        <p className="text-xs text-muted-foreground">
          This is the default API endpoint used when no other web URL matches.
        </p>
      )}
    </div>
  );
};

const ApiConfigManager: React.FC = () => {
  const [urlPairs, setUrlPairs] = useState<UrlPair[]>([]);
  const [timeout, setTimeout] = useState(30000);
  const [retries, setRetries] = useState(3);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'unknown' | 'success' | 'error'>>({});
  const [testingIndices, setTestingIndices] = useState<Set<number>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentActiveUrl, setCurrentActiveUrl] = useState<string>('');
  
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { user } = useClerkUser();

  useEffect(() => {
    if (user?.id) {
      loadCurrentConfig();
    }
  }, [user?.id]);

  useEffect(() => {
    // Validate URL pairs whenever they change
    const result = validateUrlPairs(urlPairs);
    setValidationError(result.valid ? null : result.error || null);
    
    // Update current active URL
    if (urlPairs.length > 0) {
      const config = { urlPairs, timeout, retries };
      setCurrentActiveUrl(getActiveApiUrl(config));
    }
  }, [urlPairs, timeout, retries]);

  const loadCurrentConfig = async () => {
    try {
      setFetching(true);
      const config = await getApiConfig(user?.id);
      setUrlPairs(config.urlPairs || [{ id: crypto.randomUUID(), webUrl: '', apiBaseUrl: '', label: 'Default' }]);
      setTimeout(config.timeout);
      setRetries(config.retries);
      setCurrentActiveUrl(getActiveApiUrl(config));
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
    // Validate all pairs have API base URLs
    const emptyApiUrl = urlPairs.find(p => !p.apiBaseUrl.trim());
    if (emptyApiUrl) {
      toast({
        title: "Error",
        description: "All URL pairs must have an API Base URL",
        variant: "destructive"
      });
      return;
    }

    // Validate URL pairs uniqueness
    const validation = validateUrlPairs(urlPairs);
    if (!validation.valid) {
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    // Validate all API URLs are valid
    for (const pair of urlPairs) {
      try {
        new URL(pair.apiBaseUrl);
      } catch {
        toast({
          title: "Error",
          description: `Invalid API URL: ${pair.apiBaseUrl}`,
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      const success = await updateApiConfig({
        urlPairs,
        timeout,
        retries
      }, user?.id);

      if (success) {
        toast({
          title: "Success",
          description: "API configuration updated successfully",
          variant: "default"
        });
        setConnectionStatuses({});
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

  const testConnection = async (index: number) => {
    const pair = urlPairs[index];
    if (!pair?.apiBaseUrl) return;

    setTestingIndices(prev => new Set(prev).add(index));
    const pairKey = pair.id || String(index);
    setConnectionStatuses(prev => ({ ...prev, [pairKey]: 'unknown' as const }));

    const endpointsToTry = ['/health', '/api/health', '/ping', '/'];
    const url = pair.apiBaseUrl.replace(/\/+$/, '');

    try {
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
            setConnectionStatuses(prev => ({ ...prev, [pairKey]: 'success' as const }));
            toast({
              title: "Connection Successful",
              description: `API server at ${pair.apiBaseUrl} is reachable`,
              variant: "default"
            });
            succeeded = true;
            break;
          }
        } catch {
          // Continue trying other endpoints
        }
      }

      if (!succeeded) {
        // Try no-cors fallback
        try {
          const controller = new AbortController();
          const timeoutId = window.setTimeout(() => controller.abort(), 10000);

          await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors',
            headers: { 'ngrok-skip-browser-warning': 'true' },
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          setConnectionStatuses(prev => ({ ...prev, [pairKey]: 'success' as const }));
          toast({
            title: "Connection Likely Successful",
            description: "Server responded (CORS may block full verification)",
            variant: "default"
          });
          succeeded = true;
        } catch {
          // Even no-cors failed
        }
      }

      if (!succeeded) {
        setConnectionStatuses(prev => ({ ...prev, [pairKey]: 'error' as const }));
        toast({
          title: "Connection Failed",
          description: `Unable to reach API server at ${pair.apiBaseUrl}`,
          variant: "destructive"
        });
      }
    } catch {
      setConnectionStatuses(prev => ({ ...prev, [pairKey]: 'error' as const }));
      toast({
        title: "Connection Failed",
        description: "Unable to reach the API server",
        variant: "destructive"
      });
    } finally {
      setTestingIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const addUrlPair = () => {
    setUrlPairs(prev => [
      ...prev,
      { id: crypto.randomUUID(), webUrl: '', apiBaseUrl: '', label: '' }
    ]);
  };

  const updateUrlPair = (index: number, field: 'webUrl' | 'apiBaseUrl' | 'label', value: string) => {
    setUrlPairs(prev => prev.map((pair, i) => 
      i === index ? { ...pair, [field]: value } : pair
    ));
  };

  const deleteUrlPair = (index: number) => {
    if (urlPairs.length <= 1) return;
    setUrlPairs(prev => prev.filter((_, i) => i !== index));
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
          <Button
            variant="outline"
            size="sm"
            onClick={refreshConfig}
            disabled={fetching}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Configure URL pairs to map websites to their respective API endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Active URL Display */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Current Active API</span>
          </div>
          <code className="text-sm text-muted-foreground break-all">{currentActiveUrl || 'Not configured'}</code>
          <p className="text-xs text-muted-foreground mt-1">
            Based on current hostname: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
          </p>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <span className="text-sm text-destructive">{validationError}</span>
          </div>
        )}

        {/* URL Pairs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">URL Pairs</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addUrlPair}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Pair
            </Button>
          </div>
          
          <div className="space-y-3">
            {urlPairs.map((pair, index) => (
              <UrlPairRow
                key={pair.id || index}
                pair={pair}
                index={index}
                isDefault={!pair.webUrl || pair.webUrl.trim() === ''}
                isOnlyRow={urlPairs.length === 1}
                connectionStatus={connectionStatuses[pair.id || index] || 'unknown'}
                isTesting={testingIndices.has(index)}
                onUpdate={updateUrlPair}
                onDelete={deleteUrlPair}
                onTest={testConnection}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Advanced Settings</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout" className="text-sm">Timeout (ms)</Label>
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
              <Label htmlFor="retries" className="text-sm">Max Retries</Label>
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
        </div>

        <Button
          onClick={handleSaveConfig}
          disabled={loading || !!validationError}
          className="w-full"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Configuration
        </Button>

        {/* Usage Example */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">How it works:</h4>
          <p className="text-sm text-muted-foreground mb-3">
            When your app loads, it matches the current website URL against the configured Web URLs and uses the corresponding API Base URL.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Empty Web URL = Default API (used when no match found)</li>
            <li>Specific Web URL = Maps that domain to its API endpoint</li>
            <li>Supports subdomain matching (e.g., "example.com" matches "app.example.com")</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiConfigManager;
