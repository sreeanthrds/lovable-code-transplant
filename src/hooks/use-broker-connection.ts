import { useState, useCallback, useEffect } from 'react';
import { tradingApiService, BrokerStatusResponse } from '@/lib/api/trading-api-service';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useToast } from '@/hooks/use-toast';

// ============================================
// HOOK INTERFACE
// ============================================
export interface UseBrokerConnectionReturn {
  // State
  isConnected: boolean;
  isDisconnecting: boolean;
  isLoadingStatus: boolean;
  connectionId: string | null;
  brokerStatus: BrokerStatusResponse | null;
  error: string | null;
  
  // Actions
  disconnect: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

// ============================================
// CUSTOM HOOK
// ============================================
export const useBrokerConnection = () => {
  const { user } = useClerkUser();
  const { toast } = useToast();
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [brokerStatus, setBrokerStatus] = useState<BrokerStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // DISCONNECT FROM BROKER
  // ============================================
  const disconnect = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to disconnect',
        variant: 'destructive',
      });
      return false;
    }

    setIsDisconnecting(true);
    setError(null);

    try {
      console.log('🔌 Disconnecting from broker...');
      
      const response = await tradingApiService.disconnectBroker({
        user_id: user.id,
        broker: 'angelone',
      });

      if (response.success) {
        setIsConnected(false);
        setConnectionId(null);
        setBrokerStatus(null);
        
        toast({
          title: 'Disconnected',
          description: response.message,
        });
        
        return true;
      } else {
        throw new Error(response.message || 'Disconnection failed');
      }
    } catch (err: any) {
      console.error('❌ Broker disconnection error:', err);
      const errorMessage = err.message || 'Failed to disconnect from broker';
      setError(errorMessage);
      
      toast({
        title: 'Disconnection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsDisconnecting(false);
    }
  }, [user, toast]);

  // ============================================
  // REFRESH BROKER STATUS
  // ============================================
  const refreshStatus = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setIsLoadingStatus(true);
    setError(null);

    try {
      console.log('🔄 Refreshing broker status...');
      
      const status = await tradingApiService.getBrokerStatus(user.id, 'angelone');
      
      setBrokerStatus(status);
      setIsConnected(status.status === 'connected');
      
      console.log('✅ Broker status:', status);
    } catch (err: any) {
      console.error('❌ Failed to get broker status:', err);
      // Don't show toast for status refresh errors (silent fail)
      setIsConnected(false);
      setBrokerStatus(null);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [user]);

  // ============================================
  // AUTO-LOAD STATUS ON MOUNT
  // ============================================
  useEffect(() => {
    if (user?.id) {
      refreshStatus();
    }
  }, [user?.id, refreshStatus]);

  return {
    // State
    isConnected,
    isDisconnecting,
    isLoadingStatus,
    connectionId,
    brokerStatus,
    error,
    
    // Actions
    disconnect,
    refreshStatus,
  };
};
