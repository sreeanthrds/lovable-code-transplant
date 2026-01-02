import { useState, useEffect, useCallback } from 'react';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient } from './useSupabaseClient';
import { useLiveTradeStore } from './use-live-trade-store';
import { toast } from 'sonner';

// Broker-specific metadata types
export interface ClickHouseMetadata {
  type: 'clickhouse';
  simulation_date: string; // yyyy-MM-dd format
  speed_multiplier: number;
}

export interface AngelOneMetadata {
  type: 'angel-one';
  api_key?: string;
  api_secret?: string;
  client_id?: string;
  client_code?: string;
  totp_secret?: string;
  access_token?: string;
  refresh_token?: string;
  feed_token?: string;
  token_expires_at?: string;
  generated_at?: string;
}

export interface ZerodhaMetadata {
  type: 'zerodha';
  api_key?: string;
  api_secret?: string;
  user_id?: string;
  access_token?: string;
  request_token?: string;
  token_expires_at?: string;
  generated_at?: string;
}

export interface UpstoxMetadata {
  type: 'upstox';
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  token_expires_at?: string;
  generated_at?: string;
}

export interface GenericBrokerMetadata {
  type: string;
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  generated_at?: string;
  [key: string]: unknown;
}

export type BrokerMetadata = ClickHouseMetadata | AngelOneMetadata | ZerodhaMetadata | UpstoxMetadata | GenericBrokerMetadata;

// Helper to get metadata field safely
export const getMetadataField = <T>(metadata: BrokerMetadata | null | undefined, field: string): T | undefined => {
  if (!metadata) return undefined;
  return (metadata as Record<string, unknown>)[field] as T | undefined;
};

export interface BrokerConnection {
  id: string;
  user_id: string;
  broker_type: string;
  connection_name: string;
  // All connection data stored here
  broker_metadata: BrokerMetadata | null;
  // State and OAuth
  is_active: boolean;
  status: 'pending' | 'connected' | 'disconnected' | 'error';
  oauth_state?: string;
  redirect_url?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export const useBrokerConnections = () => {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const { userId, isAuthenticated, isLoading: clerkLoading } = useClerkUser();
  const { getAuthenticatedClient } = useSupabaseClient();

  // Removed: console.log on every render causes log flood

  // Generate secure OAuth state
  const generateOAuthState = (connectionId: string, brokerId: string) => {
    return `${userId}:${brokerId}:${connectionId}:${Date.now()}`;
  };

  // Parse OAuth state  
  const parseOAuthState = (state: string) => {
    const parts = state.split(':');
    if (parts.length !== 4) return null;
    return {
      userId: parts[0],
      brokerId: parts[1], 
      connectionId: parts[2],
      timestamp: parseInt(parts[3])
    };
  };

  // Fetch broker connections from Supabase
  const fetchConnections = useCallback(async () => {
    
    try {
      // If Clerk is still loading, wait but set a timeout
      if (clerkLoading) {
        console.log('Clerk still loading, waiting...');
        return;
      }
      
      // If not authenticated after Clerk loads, set empty and stop loading
      if (!isAuthenticated || !userId) {
        console.log('Not authenticated or no userId, setting empty connections');
        setConnections([]);
        return;
      }

      // Fetching connections for user
      
      // Get authenticated client with Clerk JWT
      const supabase = await getAuthenticatedClient();
      
      const { data, error } = await (supabase as any)
        .from('broker_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching connections:', error);
        throw error;
      }
      
      setConnections((data || []) as BrokerConnection[]);
    } catch (error) {
      console.error('Error fetching broker connections:', error);
      toast.error('Failed to load broker connections');
      setConnections([]);
    }
  }, [clerkLoading, isAuthenticated, userId, getAuthenticatedClient]);

  // Create a new broker connection - only uses broker_metadata for data
  const createConnection = async (connectionData: {
    broker_type: string;
    connection_name: string;
    broker_metadata?: BrokerMetadata;
    status?: 'pending' | 'connected' | 'disconnected' | 'error';
  }) => {
    if (!userId) throw new Error('User not authenticated');

    // Get authenticated client with Clerk JWT
    const supabase = await getAuthenticatedClient();

    try {
      // First, check if there's already an active connection for this broker type
      const { data: existingConnections, error: fetchError } = await (supabase as any)
        .from('broker_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('broker_type', connectionData.broker_type)
        .eq('status', 'connected')
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      // Check if any existing connection has valid, non-expired tokens (check broker_metadata)
      if (existingConnections && existingConnections.length > 0) {
        const activeConnection = existingConnections.find(conn => {
          const metadata = conn.broker_metadata as BrokerMetadata | null;
          const tokenExpiresAt = metadata ? getMetadataField<string>(metadata, 'token_expires_at') : null;
          if (!tokenExpiresAt) return true; // No expiration means it's valid
          return new Date() < new Date(tokenExpiresAt); // Check if not expired
        });

        if (activeConnection) {
          console.log('Found existing active connection for', connectionData.broker_type, ':', activeConnection.id);
          toast.success(`Using existing active ${connectionData.broker_type} connection`);
          return activeConnection;
        }
      }

      // No active connection found, create a new one
      const { data, error } = await (supabase as any)
        .from('broker_connections')
        .insert({
          ...connectionData,
          user_id: userId,
          status: connectionData.status || 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Optimistic update: add to local state immediately after insert
      setConnections(prev => [data as BrokerConnection, ...prev]);
      
      // Generate OAuth state and update connection
      const oauthState = generateOAuthState(data.id, connectionData.broker_type);
      const redirectUrl = `${window.location.origin}/auth/callback/${connectionData.broker_type}?state=${oauthState}`;
      
      console.log('🚀 Creating new connection with details:', {
        connectionId: data.id,
        brokerType: connectionData.broker_type,
        redirectUrl,
        oauthState,
        userId,
        parsedState: parseOAuthState(oauthState)
      });
      
      const { data: updatedData, error: updateError } = await (supabase as any)
        .from('broker_connections')
        .update({ 
          oauth_state: oauthState,
          redirect_url: redirectUrl 
        })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      // Update local state with final data including oauth state
      setConnections(prev => 
        prev.map(conn => conn.id === data.id ? updatedData as BrokerConnection : conn)
      );
      return updatedData;
    } catch (error) {
      console.error('Error creating broker connection:', error);
      toast.error('Failed to create broker connection');
      throw error;
    }
  };

  // Update connection with OAuth tokens - stores in broker_metadata
  const updateConnectionTokens = async (
    connectionId: string,
    tokenData: {
      access_token?: string;
      refresh_token?: string;
      request_token?: string;
      feed_token?: string;
      token_expires_at?: string;
      status?: 'connected' | 'error';
    }
  ) => {
    // Get authenticated client with Clerk JWT
    const supabase = await getAuthenticatedClient();

    try {
      console.log('🚀 updateConnectionTokens called with:', {
        connectionId,
        tokenData,
        userId,
        currentConnections: connections.map(c => ({ id: c.id, broker_type: c.broker_type, user_id: c.user_id }))
      });

      // Check if connection exists in our local state
      const localConnection = connections.find(c => c.id === connectionId);
      if (!localConnection) {
        console.error('❌ Connection not found in local state:', {
          searchedId: connectionId,
          availableIds: connections.map(c => c.id)
        });
      } else {
        console.log('✅ Found connection in local state:', {
          id: localConnection.id,
          user_id: localConnection.user_id,
          broker_type: localConnection.broker_type,
          status: localConnection.status
        });
      }

      const generatedAt = new Date().toISOString();
      let tokenExpiresAt = tokenData.token_expires_at;
      
      // If tokens are being updated but no expiry is provided, set default expiry (24 hours)
      if ((tokenData.access_token || tokenData.refresh_token || tokenData.request_token) && !tokenExpiresAt) {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24);
        tokenExpiresAt = expiryDate.toISOString();
        console.log('💾 Auto-setting token_expires_at to:', tokenExpiresAt);
      }

      // Get existing broker_metadata and merge token data into it
      const existingMetadata = (localConnection?.broker_metadata || {}) as Record<string, unknown>;
      const updatedMetadata: BrokerMetadata = {
        ...existingMetadata,
        type: existingMetadata.type as string || localConnection?.broker_type || 'unknown',
        access_token: tokenData.access_token || existingMetadata.access_token as string,
        refresh_token: tokenData.refresh_token || existingMetadata.refresh_token as string,
        ...(tokenData.request_token && { request_token: tokenData.request_token }),
        ...(tokenData.feed_token && { feed_token: tokenData.feed_token }),
        token_expires_at: tokenExpiresAt || existingMetadata.token_expires_at as string,
        generated_at: generatedAt,
      };

      const updatePayload: any = {
        broker_metadata: updatedMetadata,
        is_active: tokenData.status === 'connected' ? true : false,
        status: tokenData.status,
        // Also update legacy columns for backward compatibility
        token_expires_at: tokenExpiresAt,
      };

      console.log('📤 Sending update payload with broker_metadata:', updatePayload);

      const { data, error } = await (supabase as any)
        .from('broker_connections')
        .update(updatePayload)
        .eq('id', connectionId)
        .eq('user_id', userId)
        .select()
        .single();

      console.log('📥 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.error('❌ No data returned from update - connection may not exist or user mismatch');
        throw new Error('No data returned from update operation');
      }

      console.log('✅ Update successful, updating local state');
      
      setConnections(prev => 
        prev.map(conn => conn.id === connectionId ? data as BrokerConnection : conn)
      );
      
      return data;
    } catch (error) {
      console.error('💥 Error updating connection tokens:', error);
      toast.error('Failed to update connection tokens');
      throw error;
    }
  };

  // Update connection status
  const updateConnectionStatus = async (
    connectionId: string,
    status: BrokerConnection['status']
  ) => {
    // Get authenticated client with Clerk JWT
    const supabase = await getAuthenticatedClient();

    try {
      const { data, error } = await (supabase as any)
        .from('broker_connections')
        .update({ status })
        .eq('id', connectionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      
      setConnections(prev => 
        prev.map(conn => conn.id === connectionId ? data as BrokerConnection : conn)
      );
      
      return data;
    } catch (error) {
      console.error('Error updating connection status:', error);
      toast.error('Failed to update connection status');
      throw error;
    }
  };

  // Update connection basic details - only uses broker_metadata
  const updateConnection = async (
    connectionId: string,
    connectionData: {
      connection_name?: string;
      broker_metadata?: BrokerMetadata;
    }
  ) => {
    // Get authenticated client with Clerk JWT
    const supabase = await getAuthenticatedClient();

    try {
      const { data, error } = await (supabase as any)
        .from('broker_connections')
        .update(connectionData)
        .eq('id', connectionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      
      setConnections(prev => 
        prev.map(conn => conn.id === connectionId ? data as BrokerConnection : conn)
      );
      
      toast.success('Connection updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating connection:', error);
      toast.error('Failed to update connection');
      throw error;
    }
  };

  // Delete a broker connection - optimistic update
  const deleteConnection = async (connectionId: string) => {
    // Optimistic update: remove from local state immediately
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    
    // Optimistic update: clear from any assigned strategies immediately
    const { liveStrategies, strategyConnections } = useLiveTradeStore.getState();
    const updatedMappings = { ...strategyConnections };
    let hasChanges = false;
    
    for (const [strategyId, connId] of Object.entries(updatedMappings)) {
      if (connId === connectionId) {
        delete updatedMappings[strategyId];
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      useLiveTradeStore.setState({ strategyConnections: updatedMappings });
      const updatedStrategies = liveStrategies.map(s => 
        s.connectionId === connectionId ? { ...s, connectionId: undefined } : s
      );
      useLiveTradeStore.setState({ liveStrategies: updatedStrategies });
    }

    // Get authenticated client with Clerk JWT
    const supabase = await getAuthenticatedClient();

    try {
      const { error } = await (supabase as any)
        .from('broker_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', userId);

      if (error) {
        // Rollback: refetch on error
        await fetchConnections();
        throw error;
      }
      
      toast.success('Broker connection deleted');
    } catch (error) {
      console.error('Error deleting broker connection:', error);
      toast.error('Failed to delete broker connection');
      throw error;
    }
  };

  useEffect(() => {
    // useEffect triggered
    
    fetchConnections();
  }, [userId, isAuthenticated, clerkLoading, fetchConnections]);

  // Subscribe to realtime updates for broker_connections - only for external changes (other tabs/devices)
  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    const setupRealtimeSubscription = async () => {
      const supabase = await getAuthenticatedClient();
      
      const channel = (supabase as any)
        .channel('broker-connections-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'broker_connections',
            filter: `user_id=eq.${userId}`
          },
          async (payload: any) => {
            console.log('🔄 Realtime broker connection update (external):', payload);
            // Refetch to sync with external changes from other tabs/devices
            await fetchConnections();
          }
        )
        .subscribe();

      return () => {
        (supabase as any).removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscription();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [userId, isAuthenticated, getAuthenticatedClient, fetchConnections]);

  return {
    connections,
    loading: false, // FORCE: Never show loading to fix spinner issue
    createConnection,
    updateConnection,
    updateConnectionTokens,
    updateConnectionStatus,
    deleteConnection,
    refetch: fetchConnections,
    parseOAuthState,
    generateOAuthState
  };
};
