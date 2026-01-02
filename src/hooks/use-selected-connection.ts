import { useLiveTradeStore } from './use-live-trade-store';
import { useBrokerConnections, getMetadataField } from './use-broker-connections';
import { useMemo } from 'react';

/**
 * Hook to get the currently selected broker connection for strategy execution
 */
export function useSelectedConnection() {
  const { selectedConnectionId } = useLiveTradeStore();
  const { connections } = useBrokerConnections();

  const selectedConnection = useMemo(() => {
    if (!selectedConnectionId) return null;
    return connections.find(conn => conn.id === selectedConnectionId) || null;
  }, [selectedConnectionId, connections]);

  const isConnectionActive = useMemo(() => {
    if (!selectedConnection) return false;
    
    // Check if connection is not expired using token_expires_at from broker_metadata
    const tokenExpiresAt = getMetadataField<string>(selectedConnection.broker_metadata, 'token_expires_at');
    if (tokenExpiresAt) {
      const isExpired = new Date() > new Date(tokenExpiresAt);
      if (isExpired) return false;
    }

    return selectedConnection.status === 'connected';
  }, [selectedConnection]);

  const connectionTokens = useMemo(() => {
    if (!selectedConnection || !isConnectionActive) return null;
    
    const metadata = selectedConnection.broker_metadata;
    return {
      accessToken: getMetadataField<string>(metadata, 'access_token'),
      refreshToken: getMetadataField<string>(metadata, 'refresh_token'),
      requestToken: getMetadataField<string>(metadata, 'request_token'),
      brokerType: selectedConnection.broker_type,
      connectionId: selectedConnection.id,
      expiresAt: getMetadataField<string>(metadata, 'token_expires_at')
    };
  }, [selectedConnection, isConnectionActive]);

  return {
    selectedConnection,
    isConnectionActive,
    connectionTokens,
    hasSelectedConnection: !!selectedConnection,
    selectedConnectionId,
  };
}
