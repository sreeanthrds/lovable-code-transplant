import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useClerkUser } from '@/hooks/useClerkUser';
import { Loader2, Link as LinkIcon } from 'lucide-react';


interface ConnectBrokerButtonProps {
  connectionId: string;
  connectionName: string;
  onSuccess?: () => void;
}

export const ConnectBrokerButton: React.FC<ConnectBrokerButtonProps> = ({
  connectionId,
  connectionName,
  onSuccess,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { userId } = useClerkUser();

  const handleConnect = async () => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to connect your broker',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);

    try {
      console.log('Initiating OAuth with:', { connectionId, userId });

      // Call FastAPI backend to initiate OAuth flow
      const response = await fetch('https://api.tradelayout.com/broker/auth/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId,
          userId,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      if (data.redirect_url) {
        console.log('Redirecting to:', data.redirect_url);
        // Redirect to Angel One OAuth page
        window.location.href = data.redirect_url;
      } else {
        throw new Error('No redirect_url in response');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to broker',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="w-full"
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting to Angel One...
        </>
      ) : (
        <>
          <LinkIcon className="mr-2 h-4 w-4" />
          Connect {connectionName}
        </>
      )}
    </Button>
  );
};
