import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useClerkUser } from '@/hooks/useClerkUser';
import { getApiBaseUrl } from '@/lib/api-config';
import { Loader2 } from 'lucide-react';

interface BrokerConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: any;
  onConnectionSuccess: () => void;
}

const BrokerConnectDialog: React.FC<BrokerConnectDialogProps> = ({
  open,
  onOpenChange,
  connection,
  onConnectionSuccess
}) => {
  const { toast } = useToast();
  const { user } = useClerkUser();
  const [passcode, setPasscode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!passcode) {
      toast({
        title: "Passcode Required",
        description: "Please enter your trading passcode/MPIN",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your broker",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Get the configured API base URL
      const apiBaseUrl = await getApiBaseUrl(user.id);
      console.log('🔗 Using API base URL:', apiBaseUrl);
      
      // Call the external API to authenticate with Angel One
      const response = await fetch(`${apiBaseUrl}/api/broker/angelone/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          broker_connection_id: connection.id,
          user_id: user.id,
          passcode: passcode
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Connection failed');
      }

      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${connection.connection_name}`,
      });

      onConnectionSuccess();
      onOpenChange(false);
      setPasscode('');
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to broker",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to {connection?.connection_name}</DialogTitle>
          <DialogDescription>
            Enter your trading passcode/MPIN to establish a connection with your broker account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="passcode">Trading Passcode/MPIN</Label>
            <Input
              id="passcode"
              type="password"
              placeholder="Enter your passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConnect();
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              This is your {connection?.broker_type === 'angel-one' ? 'Angel One' : 'broker'} trading password
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !passcode}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerConnectDialog;
