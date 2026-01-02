import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plug, AlertCircle } from 'lucide-react';
import { tradingApiService, BrokerConnectionData, BrokerConnectRequest } from '@/lib/api/trading-api-service';
import { useToast } from '@/hooks/use-toast';
import { useClerkUser } from '@/hooks/useClerkUser';

interface ConnectBrokerFormProps {
  onSuccess?: () => void;
}

export const ConnectBrokerForm: React.FC<ConnectBrokerFormProps> = ({ onSuccess }) => {
  const { user } = useClerkUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<BrokerConnectionData[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [totpCode, setTotpCode] = useState('');

  // Load saved connections
  useEffect(() => {
    if (user?.id) {
      loadConnections();
    }
  }, [user?.id]);

  const loadConnections = async () => {
    if (!user?.id) return;

    setIsLoadingConnections(true);
    try {
      const data = await tradingApiService.listBrokerConnections(user.id);
      setConnections(data);
      if (data.length > 0 && !selectedConnectionId) {
        setSelectedConnectionId(data[0].id || '');
      }
    } catch (err: any) {
      console.error('Failed to load connections:', err);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to connect',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedConnectionId) {
      toast({
        title: 'No Connection Selected',
        description: 'Please select a broker connection',
        variant: 'destructive',
      });
      return;
    }

    if (!totpCode || totpCode.length !== 6) {
      toast({
        title: 'Invalid TOTP Code',
        description: 'Please enter the 6-digit TOTP code from your authenticator app',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: BrokerConnectRequest = {
        user_id: user.id,
        broker_connection_id: selectedConnectionId,
        totp_code: totpCode,
      };

      const response = await tradingApiService.connectBroker(request);

      if (response.success && response.status === 'connected') {
        toast({
          title: 'Connected Successfully',
          description: `Connected to ${response.broker}`,
        });

        setTotpCode('');
        onSuccess?.();
      } else {
        throw new Error(response.message || 'Connection failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect to broker';
      setError(errorMessage);
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingConnections) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Saved Connections</CardTitle>
          <CardDescription>
            Please register a broker connection first before connecting
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5" />
          Connect to Broker
        </CardTitle>
        <CardDescription>
          Select your saved connection and enter the TOTP code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connection">Broker Connection</Label>
            <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a connection" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id || ''}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${conn.status === 'connected' ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                      <span className={conn.status !== 'connected' ? 'opacity-50' : ''}>
                        {conn.connection_name} - {conn.client_code}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totp_code">TOTP Code</Label>
            <Input
              id="totp_code"
              type="text"
              placeholder="Enter 6-digit code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoading}
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code from your authenticator app (changes every 30 seconds)
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Plug className="mr-2 h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
