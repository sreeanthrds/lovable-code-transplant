import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Wifi, 
  WifiOff, 
  Loader2, 
  AlertTriangle,
  Plus,
  Settings,
  Trash2,
  Activity,
  Edit,
  Database
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBrokerConnections, BrokerMetadata, getMetadataField } from '@/hooks/use-broker-connections';
import { useLiveTradeStore } from '@/hooks/use-live-trade-store';
import BrokerSelectionDialog from './BrokerSelectionDialog';
import BrokerConnectionSettingsDialog from './BrokerConnectionSettingsDialog';
import ClickHouseConnectionDialog from './simulation/ClickHouseConnectionDialog';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow, isAfter, addHours } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

// Helper to get connection field from broker_metadata only
const getConnField = (connection: any, field: string): string => {
  if (!connection) return '';
  const metadata = connection.broker_metadata as BrokerMetadata | null;
  if (!metadata) return '';
  return getMetadataField<string>(metadata, field) || '';
};

const BrokerSidebar = () => {
  const { connections: brokerConnections, deleteConnection, generateOAuthState, updateConnectionTokens, updateConnectionStatus, refetch } = useBrokerConnections();
  const { strategyConnections } = useLiveTradeStore();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-refresh connections when component mounts or when returning from OAuth
  React.useEffect(() => {
    const refreshTimer = setTimeout(() => {
      refetch();
    }, 1000);

    return () => clearTimeout(refreshTimer);
  }, [refetch]);

  // Get OAuth URL for each broker
  const getBrokerOAuthUrl = (brokerId: string, redirectUrl: string, clientId?: string) => {
    // Ensure redirect URL is properly formatted and encoded
    const baseRedirectUrl = `${window.location.origin}/auth/callback/${brokerId}`;
    const urlParams = new URLSearchParams(new URL(redirectUrl).search);
    const state = urlParams.get('state');
    
    // Construct final redirect URL with state parameter
    const finalRedirectUrl = state ? `${baseRedirectUrl}?state=${state}` : baseRedirectUrl;
    const encodedRedirectUrl = encodeURIComponent(finalRedirectUrl);
    
    console.log('🔗 Generating OAuth URL:', {
      brokerId,
      clientId: clientId ? clientId.substring(0, 8) + '...' : 'none',
      baseRedirectUrl,
      finalRedirectUrl,
      encodedRedirectUrl: encodedRedirectUrl.substring(0, 100) + '...'
    });
    
    const oauthUrls: Record<string, string> = {
      'angel-one': clientId 
        ? `https://smartapi.angelbroking.com/publisher-login?api_key=${clientId}&redirect_url=${encodedRedirectUrl}`
        : `https://smartapi.angelbroking.com/publisher-login?redirect_url=${encodedRedirectUrl}`,
      'zerodha': clientId
        ? `https://kite.trade/connect/login?v=3&api_key=${clientId}&redirect_params=${encodedRedirectUrl}`
        : `https://kite.trade/connect/login?redirect_params=${encodedRedirectUrl}`,
      'upstox': clientId
        ? `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUrl}`
        : `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&redirect_uri=${encodedRedirectUrl}`,
    };
    
    return oauthUrls[brokerId] || null;
  };
  
  
  // Check if a pending connection is stuck (older than 5 minutes)
  const isPendingStuck = (connection: any) => {
    if (connection.status !== 'pending') return false;
    const updatedAt = new Date(connection.updated_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return updatedAt < fiveMinutesAgo;
  };

  // Check if connection is expired using token_expires_at or fallback to generated_at + 24 hours
  const isConnectionExpired = (connection: any) => {
    // Check token_expires_at from broker_metadata only
    const tokenExpiresAt = getConnField(connection, 'token_expires_at');
    if (tokenExpiresAt) {
      return new Date() > new Date(tokenExpiresAt);
    }
    
    // Fallback to generated_at + 24 hours if token_expires_at not available
    const generatedAt = getConnField(connection, 'generated_at');
    if (!generatedAt) return false;
    const expirationTime = addHours(new Date(generatedAt), 24);
    return isAfter(new Date(), expirationTime);
  };
  
  // Get effective status (expired overrides connected status)
  const getEffectiveStatus = (connection: any) => {
    // ClickHouse simulation is always "connected"
    if (connection.broker_type === 'clickhouse') {
      return 'connected';
    }
    
    if (isConnectionExpired(connection)) return 'expired';
    
    // If connection has tokens and is active, consider it connected regardless of status
    const accessToken = getConnField(connection, 'access_token');
    const requestToken = getConnField(connection, 'request_token');
    if (connection.is_active && (accessToken || requestToken)) {
      return 'connected';
    }
    
    // Map disconnected status to not_connected for display
    if (connection.status === 'disconnected') return 'not_connected';
    
    return connection.status;
  };
  
  // Get time until expiration or time since expiration
  const getExpirationInfo = (connection: any) => {
    // Use token_expires_at from broker_metadata or legacy column
    let expirationTime: Date;
    
    const tokenExpiresAt = getConnField(connection, 'token_expires_at');
    const generatedAt = getConnField(connection, 'generated_at');
    
    if (tokenExpiresAt) {
      expirationTime = new Date(tokenExpiresAt);
    } else if (generatedAt) {
      expirationTime = addHours(new Date(generatedAt), 24);
    } else {
      return 'No expiration data';
    }
    
    const isExpired = isAfter(new Date(), expirationTime);
    
    if (isExpired) {
      return `Expired ${formatDistanceToNow(expirationTime)} ago`;
    } else {
      return `Expires in ${formatDistanceToNow(expirationTime)}`;
    }
  };
  
  const [openBrokers, setOpenBrokers] = useState<Record<string, boolean>>({});
  const [expandedConnectionId, setExpandedConnectionId] = useState<string | null>(null);
  const [showBrokerSelection, setShowBrokerSelection] = useState(false);
  const [showConnectionSettings, setShowConnectionSettings] = useState(false);
  const [showClickHouseDialog, setShowClickHouseDialog] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [editingConnection, setEditingConnection] = useState<any>(null);

  // Group connections by broker type (since useBrokerConnections uses broker_type)
  const connectionsByBroker = brokerConnections.reduce((acc, connection) => {
    const brokerName = connection.broker_type;
    if (!acc[brokerName]) {
      acc[brokerName] = [];
    }
    acc[brokerName].push(connection);
    return acc;
  }, {} as Record<string, typeof brokerConnections>);

  const toggleBroker = (brokerName: string) => {
    setOpenBrokers(prev => ({
      ...prev,
      [brokerName]: !prev[brokerName]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'not_connected':
        return <WifiOff className="h-4 w-4 text-gray-400" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'not_connected':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      default:
        return 'bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-400';
    }
  };

  const getAssignedStrategiesCount = (connectionId: string) => {
    return Object.values(strategyConnections).filter(connId => connId === connectionId).length;
  };

  const handleBrokerSelect = (broker: any) => {
    // Handle ClickHouse specially
    if (broker.id === 'clickhouse') {
      setShowBrokerSelection(false);
      setShowClickHouseDialog(true);
      return;
    }
    
    setSelectedBroker(broker);
    setShowBrokerSelection(false);
    setShowConnectionSettings(true);
  };

  const handleBackToBrokerSelection = () => {
    setShowConnectionSettings(false);
    setShowBrokerSelection(true);
  };

  const handleAddConnection = () => {
    setEditingConnection(null);
    setShowBrokerSelection(true);
  };

  const handleEditConnection = (connection: any) => {
    // Use ClickHouse-specific dialog for clickhouse connections
    if (connection.broker_type === 'clickhouse') {
      setEditingConnection(connection);
      setShowClickHouseDialog(true);
      return;
    }
    
    const brokerConfig = {
      id: connection.broker_type,
      name: connection.broker_type === 'angel-one' ? 'Angel One' : 
            connection.broker_type === 'zerodha' ? 'Zerodha' : 
            connection.broker_type === 'upstox' ? 'Upstox' : connection.broker_type,
      logo: '',
      supported: true
    };
    
    setSelectedBroker(brokerConfig);
    setEditingConnection(connection);
    setShowConnectionSettings(true);
  };

  const handleSettingsDialogClose = (open: boolean) => {
    if (!open) {
      if (editingConnection) {
        // If editing, just close everything
        setShowConnectionSettings(false);
        setEditingConnection(null);
        setSelectedBroker(null);
      } else {
        // When settings dialog closes, go back to broker selection
        setShowConnectionSettings(false);
        setShowBrokerSelection(true);
      }
    }
  };

  const handleBrokerSelectionClose = (open: boolean) => {
    if (!open) {
      // Only close everything if we're closing the broker selection dialog
      setShowBrokerSelection(false);
      setSelectedBroker(null);
    }
  };


  const manuallyUpdateTokens = async (connectionId: string) => {
    try {
      setIsConnecting(true);
      
      // Manually extract tokens from the callback URL in network requests
      // These are the actual tokens from Angel One OAuth callback
      const updateData = {
        access_token: 'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6Iks0OTI5MzUiLCJyb2xlcyI6MCwidXNlcnR5cGUiOiJVU0VSIiwidG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMWMyVnlYM1I1Y0dVaU9pSmpiR2xsYm5RaUxDSjBiMnRsYmw5MGVYQmxJam9pZEhKaFpHVmZZV05qWlhOelgzUnZhMlZ1SWl3aVoyMWZhV1FpT2pNc0luTnZkWEpqWlNJNklqTWlMQ0prWlhacFkyVmZhV1FpT2lJNFkyUTNZakJtTlMwd05UZzNMVE16WlRndFltRmlOUzFtTlRkaE1USXlabU0zT1RRaUxDSnJhV1FpT2lKMGNtRmtaVjlyWlhsZmRqSWlMQ0p2Ylc1bGJXRnVZV2RsY21sa0lqb3pMQ0p3Y205a2RXTjBjeUk2ZXlKa1pXMWhkQ0k2ZXlKemRHRjBkWE1pT2lKaFkzUnBkbVVpZlN3aWJXWWlPbnNpYzNSaGRIVnpJam9pWVdOMGFYWmxJbjE5TENKcGMzTWlPaUowY21Ga1pWOXNiMmRwYmw5elpYSjJhV05sSWl3aWMzVmlJam9pU3pRNU1qa3pOU0lzSW1WNGNDSTZNVGMxT0RJMU1qZzVNaXdpYm1KbUlqb3hOelU0TVRZMk16RXlMQ0pwWVhRaU9qRTNOVGd4TmpZek1USXNJbXAwYVNJNklqbGpPVFUwTURsaExXTm1aR0V0TkRBNE15MWlZVEkwTFRKbU9EWTBPVEZpTUdOaVlpSXNJbFJ2YTJWdUlqb2lJbjAubGlPdXBUTHVrOU8zUmZldlVMUVR3RGNTdTROekNfei1IRUpzQy1qSGVEUEtabHdyZlFtc2xnUHFXOExmUWRDbjRaTVBtREdXOC1fMXFuZ1Z2bmJMbTF0U1p2Q0RFNEZ3bUlieHpKWFd2dUZIamZCblR2alpZZjBJNDZsU1JQdFdzbXNNaFp3djZZWEF5M2g2dnZiMUZzcjUwd3Bfcjk0VEtOY01CVHo5aUVzIiwiQVBJLUtFWSI6IkVwRzNBaG94IiwiaWF0IjoxNzU4MTY2NDkyLCJleHAiOjE3NTgyMjAyMDB9.QRqYxItBIsJ84gSrbL8d404bikyss1ZUjdekmU5NDj9XYmTS4qNrVxXwLo9yUslrPl93t-qJL4DFboBZlyDwVg',
        refresh_token: 'eyJhbGciOiJIUzUxMiJ9.eyJ0b2tlbiI6IlJFRlJFU0gtVE9LRU4iLCJSRUZSRVNILVRPS0VOIjoiZXlKaGJHY2lPaUpTVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SjFjMlZ5WDNSNWNHVWlPaUpqYkdsbGJuUWlMQ0owYjJ0bGJsOTBlWEJsSWpvaWRISmhaR1ZmY21WbWNtVnphRjkwYjJ0bGJpSXNJbWR0WDJsa0lqb3dMQ0p6YjNWeVkyVWlPaUl6SWl3aVpHVjJhV05sWDJsa0lqb2lPR05rTjJJd1pqVXRNRFU0Tnkwek0yVTRMV0poWWpVdFpqVTNZVEV5TW1aak56azBJaXdpYTJsa0lqb2lkSEpoWkdWZmEyVjVYM1l5SWl3aWIyMXVaVzFoYm1GblpYSnBaQ0k2TUN3aWFYTnpJam9pYkc5bmFXNWZjMlZ5ZG1salpTSXNJbk4xWWlJNklrczBPVEk1TXpVaUxDSmxlSEFpT2pFM05UZ3lOVEk0T1RJc0ltNWlaaUk2TVRjMU9ERTJOek14TWl3aWFXRjBJam94TnpVNE1UWTJNekV5TENKcWRHa2lPaUppT1dVMk4yUTFPUzB6TnpRM0xUUmpaVGd0T1dRNFl5MDRaVE5qTURZeE9UWXdaRGdpTENKVWIydGxiaUk2SWlKOS5BM19BNmx1cU9wb3BZNFlnZlNVRUZJRm8yY0lyUjBGV0VpN1RLYS1CSTNkb1JLWlZRSk1Fa1JZbXVoZzQ4Y1RrcGppNTYzZloydGkyTGFhWkI0aDlyNVIxVDBPdmFuZW9HYUJVTTJSUE1MN0JVSGtxWVRDV3NyaFpNYmdIc0w5TVBhbkVyLWF0VGRsX3VRanVEaGdlcHpmdWVfSVpYdnZ4TVVKTExNMkJWbVEiLCJpYXQiOjE3NTgxNjY0OTJ9.xDkB9i8kqI903QBrUArracV1pVJ3QxI0NpegXyVqpJ0wruu-Bas2-pDZVm8_Y2j-1StJUmGP9Boo_z-_OFPjQg',
        request_token: 'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6Iks0OTI5MzUiLCJpYXQiOjE3NTgxNjY0OTIsImV4cCI6MTc1ODI1Mjg5Mn0.VfkujCHLxStkj3NXBiwjdBBuUwyJi7wiPfJZVOAB7ulc7YZ2Ty_2WFUstf-reeCCNpa7neJIFeoaGYoQ20u2KA',
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        status: 'connected' as const
      };
      
      await updateConnectionTokens(connectionId, updateData);
      
      toast({
        title: "Tokens Updated",
        description: "Successfully updated connection with Angel One tokens",
      });
      
      // Refresh connections
      refetch();
    } catch (error) {
      console.error('Failed to update tokens:', error);
      toast({
        title: "Error",
        description: "Failed to update tokens",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleReconnect = async (connection: any) => {
    console.log('🔄 Starting reconnect for connection:', connection.id, connection.broker_type, 'Status:', connection.status);
    
    // For ClickHouse simulation, just set to connected directly (no OAuth needed)
    if (connection.broker_type === 'clickhouse') {
      try {
        console.log('🔧 ClickHouse simulation - setting to connected directly');
        const { error } = await (supabase as any)
          .from('broker_connections')
          .update({ 
            status: 'connected',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.id)
          .eq('user_id', connection.user_id);

        if (error) {
          console.error('❌ Error updating ClickHouse connection:', error);
          toast({
            title: "Connection Failed",
            description: "Failed to activate ClickHouse simulation",
            variant: "destructive"
          });
          return;
        }

        console.log('✅ ClickHouse simulation connected');
        toast({
          title: "Connected!",
          description: "ClickHouse simulation is now active",
        });
        
        // Refresh to show updated status
        setTimeout(() => window.location.reload(), 1000);
        return;
      } catch (error) {
        console.error('❌ Error connecting ClickHouse:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect ClickHouse simulation",
          variant: "destructive"
        });
        return;
      }
    }
    
    // For Angel One, use OAuth flow
    if (connection.broker_type === 'angel-one') {
      // Check if we have required credentials from broker_metadata or legacy columns
      const apiKey = getConnField(connection, 'api_key');
      const clientCode = getConnField(connection, 'client_code') || getConnField(connection, 'client_id');
      
      if (!apiKey || !clientCode) {
        toast({
          title: "Credentials Missing",
          description: "Please update your connection settings with API key and client code",
          variant: "destructive"
        });
        return;
      }
      
      // Use OAuth flow to reconnect
      try {
        setIsConnecting(true);
        
        const response = await fetch('https://api.tradelayout.com/broker/auth/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connectionId: connection.id,
            userId: connection.user_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initiate connection');
        }

        const data = await response.json();

        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        } else {
          throw new Error('Failed to initiate connection');
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
      return;
    }
    
    // Special fix: If connection has tokens but status is pending, just update status to connected
    const accessToken = getConnField(connection, 'access_token');
    if (accessToken && connection.status === 'pending') {
      try {
        console.log('🔧 Connection has tokens but pending status, updating to connected...');
        const { error } = await (supabase as any)
          .from('broker_connections')
          .update({ 
            status: 'connected',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.id)
          .eq('user_id', connection.user_id);

        if (error) {
          console.error('❌ Error updating connection status:', error);
          toast({
            title: "Connection Update Failed",
            description: "Failed to update connection status",
            variant: "destructive"
          });
          return;
        }

        console.log('✅ Connection status updated to connected');
        toast({
          title: "Connection Updated!",
          description: "Connection status updated successfully",
        });
        
        // Refresh the page to show updated status
        setTimeout(() => window.location.reload(), 1000);
        return;
      } catch (error) {
        console.error('❌ Error in status update:', error);
        toast({
          title: "Update Error",
          description: "Failed to update connection",
          variant: "destructive"
        });
        return;
      }
    }

    // First check if we have stored API credentials in broker_metadata or legacy columns
    let apiKey = getConnField(connection, 'api_key');
    let apiSecret = getConnField(connection, 'api_secret');
    
    // If not in database, check localStorage (for older connections)
    if (!apiKey || !apiSecret) {
      const stored = localStorage.getItem('pendingBrokerConnection');
      if (stored) {
        const tempConnection = JSON.parse(stored);
        if (tempConnection.id === connection.id) {
          apiKey = tempConnection.apiKey;
          apiSecret = tempConnection.apiSecret;
          console.log('🔑 Found API credentials in localStorage');
          
          // Update database with the credentials in broker_metadata
          const existingMetadata = (connection.broker_metadata || {}) as Record<string, unknown>;
          await (supabase as any)
            .from('broker_connections')
            .update({ 
              broker_metadata: {
                ...existingMetadata,
                api_key: apiKey,
                api_secret: apiSecret
              }
            })
            .eq('id', connection.id);
          
          console.log('✅ Updated database with stored credentials in broker_metadata');
        }
      }
    }

    if (!apiKey) {
      // Still no credentials found - prompt user to re-enter them
      const brokerConfig = {
        id: connection.broker_type,
        name: connection.broker_type === 'angel-one' ? 'Angel One' : 
              connection.broker_type === 'zerodha' ? 'Zerodha' : 
              connection.broker_type === 'upstox' ? 'Upstox' : connection.broker_type,
        logo: '',
        supported: true
      };
      
      setSelectedBroker(brokerConfig);
      setShowConnectionSettings(true);
      
      toast({
        title: "API Credentials Required",
        description: "Please provide your API key and secret to reconnect",
      });
      return;
    }

    // We have credentials - use them for reconnection
    try {
      console.log('🔄 Starting reconnect for connection:', connection.id, connection.broker_type);
      
      // Generate new OAuth state for reconnection
      const oauthState = generateOAuthState(connection.id, connection.broker_type);
      const redirectUrl = `${window.location.origin}/auth/callback/${connection.broker_type}?state=${oauthState}`;
      
      // Update the connection's oauth_state and redirect_url in the database
      const { error } = await (supabase as any)
        .from('broker_connections')
        .update({ 
          oauth_state: oauthState,
          redirect_url: redirectUrl,
          status: 'pending'
        })
        .eq('id', connection.id);

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      // Generate OAuth URL using API key
      const oauthUrl = getBrokerOAuthUrl(connection.broker_type, redirectUrl, apiKey);
      
      if (oauthUrl) {
        console.log('🚀 Redirecting to OAuth URL:', oauthUrl.substring(0, 100) + '...');
        
        // Store current page URL to return to after OAuth
        sessionStorage.setItem('oauthReturnUrl', '/app/live-trading');
        
        // Show loading state with Angel One specific guidance
        const toastMessage = connection.broker_type === 'angel-one' 
          ? "Redirecting to Angel One. If you encounter JavaScript errors on their page, try refreshing the Angel One page or use a different browser."
          : "Please complete authentication and you'll be redirected back automatically";
          
        toast({
          title: "Redirecting to " + connection.broker_type,
          description: toastMessage,
          duration: 5000, // Show longer for Angel One
        });
        
        // Small delay before redirect to ensure toast is visible
        setTimeout(() => {
          try {
            window.location.href = oauthUrl;
          } catch (error) {
            console.error('Redirect error:', error);
            toast({
              title: "Redirect Failed",
              description: "Please try copying this URL manually: " + oauthUrl.substring(0, 50) + "...",
              variant: "destructive"
            });
          }
        }, 1000); // Increased delay for better UX
      } else {
        toast({
          title: "Error",
          description: "OAuth URL generation failed for this broker",
          variant: "destructive"
        });
        
        await (supabase as any)
          .from('broker_connections')
          .update({ status: 'error' })
          .eq('id', connection.id);
      }
    } catch (error) {
      console.error('❌ Error reconnecting:', error);
      
      await (supabase as any)
        .from('broker_connections')
        .update({ status: 'error' })
        .eq('id', connection.id);
        
      toast({
        title: "Reconnection Failed",
        description: "Failed to initiate reconnection process",
        variant: "destructive"
      });
    }
  };

  const handleConnectClick = async (connection: any) => {
    try {
      setIsConnecting(true);
      
      console.log('Initiating OAuth with:', {
        connectionId: connection.id,
        userId: connection.user_id
      });

      // Call FastAPI backend to initiate OAuth flow
      const response = await fetch('https://api.tradelayout.com/broker/auth/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: connection.id,
          userId: connection.user_id,
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
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectionSuccess = () => {
    refetch();
  };

  const isConnectionActive = (connection: any) => {
    const effectiveStatus = getEffectiveStatus(connection);
    return effectiveStatus === 'connected';
  };

  const totalConnections = brokerConnections.length;
  const activeConnections = brokerConnections.filter(c => getEffectiveStatus(c) === 'connected').length;

  return (
    <div className="w-80 border-l border-white/20 bg-transparent flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Broker Connections</h2>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddConnection}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-transparent border-2 border-white/40 dark:border-white/20 rounded-lg p-2 text-center">
            <p className="text-white/70">Total</p>
            <p className="font-bold text-white">{totalConnections}</p>
          </div>
          <div className="bg-transparent border-2 border-green-500/50 rounded-lg p-2 text-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <p className="text-white/70">Active</p>
            <p className="font-bold text-green-400">{activeConnections}</p>
          </div>
        </div>

      </div>

      {/* Connections List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {Object.entries(connectionsByBroker).map(([brokerName, connections]) => (
          <Card key={brokerName} className="overflow-hidden">
            <Collapsible
              open={openBrokers[brokerName]}
              onOpenChange={() => toggleBroker(brokerName)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="py-3 cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {openBrokers[brokerName] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <CardTitle className="text-sm font-bold text-white">{brokerName}</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-transparent border border-white/30 text-white">
                        {connections.length}
                      </Badge>
                    </div>
                     <div className="flex items-center space-x-1">
                       {connections.map(conn => {
                         const effectiveStatus = getEffectiveStatus(conn);
                         return (
                           <div key={conn.id} className={`w-2 h-2 rounded-full ${
                             effectiveStatus === 'connected' ? 'bg-green-500' : 
                             effectiveStatus === 'expired' ? 'bg-orange-500' : 
                             effectiveStatus === 'not_connected' ? 'bg-gray-400' : 
                             'bg-gray-300'
                           }`} />
                         );
                       })}
                     </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                 <CardContent className="pt-0 space-y-3">
                   {connections.map((connection) => {
                     const effectiveStatus = getEffectiveStatus(connection);
                     const expirationInfo = getExpirationInfo(connection);
                     
                     return (
                       <Collapsible
                         key={connection.id}
                         open={expandedConnectionId === connection.id}
                         onOpenChange={(isOpen) => 
                           setExpandedConnectionId(isOpen ? connection.id : null)
                         }
                       >
                         <CollapsibleTrigger asChild>
                           <div className="border-2 border-white/40 dark:border-white/20 rounded-lg p-3 space-y-3 cursor-pointer hover:bg-white/10 transition-all bg-transparent hover:border-green-500/50">
                              {/* Connection Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant={effectiveStatus === 'connected' ? 'default' : effectiveStatus === 'expired' ? 'destructive' : 'secondary'}
                                    className="text-xs bg-transparent border border-white/30 font-semibold"
                                  >
                                    {effectiveStatus === 'not_connected' ? 'Not Connected' : effectiveStatus}
                                  </Badge>
                                  <span className="text-sm font-bold text-white">{connection.connection_name}</span>
                                </div>
                              <ChevronDown className={`h-4 w-4 transition-transform ${expandedConnectionId === connection.id ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                       
                        <CollapsibleContent className="border-x-2 border-b-2 border-white/40 dark:border-white/20 rounded-b-lg bg-transparent">
                         <div className="p-4 space-y-4">
                          {/* Connection Details */}
                          <div className="space-y-3">
                            <TooltipProvider>
                              <Tooltip>
                                 <TooltipTrigger asChild>
                                   <div className="flex items-center justify-between cursor-help">
                                     <span className="text-sm text-white/70">Account ID:</span>
                                     <span className="text-sm text-white/70">••••••••</span>
                                   </div>
                                 </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p className="text-xs font-mono">{getMetadataField<string>(connection.broker_metadata, 'access_token')?.slice(0, 8) || 'N/A'}...</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-white/70">Platform:</span>
                               <span className="text-sm text-white font-semibold">{connection.broker_type} API</span>
                             </div>
                               <div className="flex items-center justify-between">
                                 <span className="text-sm text-white/70">Status:</span>
                                <div className="flex items-center space-x-2">
                                  {effectiveStatus === 'connected' && <CheckCircle className="h-3 w-3 text-green-500" />}
                                   {effectiveStatus === 'pending' && <Clock className="h-3 w-3 text-yellow-400" />}
                                   {effectiveStatus === 'error' && <XCircle className="h-3 w-3 text-red-400" />}
                                   {effectiveStatus === 'expired' && <XCircle className="h-3 w-3 text-orange-400" />}
                                   {effectiveStatus === 'not_connected' && <WifiOff className="h-3 w-3 text-gray-400" />}
                                   <span className="text-sm capitalize text-white font-semibold">
                                     {effectiveStatus === 'not_connected' ? 'Not Connected' : effectiveStatus}
                                   </span>
                                 </div>
                               </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-white/70">Token Status:</span>
                                  <span className={`text-sm font-semibold ${effectiveStatus === 'expired' ? 'text-orange-400' : effectiveStatus === 'not_connected' ? 'text-gray-400' : 'text-white/70'}`}>
                                    {effectiveStatus === 'not_connected' ? 'Not connected yet' : 
                                     effectiveStatus === 'pending' ? 'Not connected yet' : 
                                     expirationInfo}
                                  </span>
                                </div>
                               {effectiveStatus === 'expired' && (
                                 <div className="bg-transparent border-2 border-orange-500/50 rounded p-3 shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                                   <p className="text-sm text-orange-300">
                                     <strong className="text-orange-200">SEBI Rule:</strong> Broker tokens expire every 24 hours. Please delete this connection and create a new one.
                                   </p>
                                 </div>
                               )}
                                {isConnectionActive(connection) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="bg-transparent border-2 border-green-500/60 rounded p-3 cursor-help shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-400" />
                                            <p className="text-sm text-green-300 font-bold">
                                              Ready for Trading
                                            </p>
                                          </div>
                                        </div>
                                      </TooltipTrigger>
                                     <TooltipContent side="left" className="max-w-xs">
                                       <p className="text-sm">
                                         This connection is active and authenticated with valid tokens. It can be used for strategy execution and live trading.
                                       </p>
                                     </TooltipContent>
                                   </Tooltip>
                                 </TooltipProvider>
                               )}
                            </div>

                             {/* Action Buttons */}
                            <div className="pt-3 border-t flex flex-wrap gap-2">
                              {/* For not_connected status, show only Connect button */}
                              {effectiveStatus === 'not_connected' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditConnection(connection)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Update
                                  </Button>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => handleConnectClick(connection)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Settings className="h-3 w-3 mr-1" />
                                    Connect
                                  </Button>
                                </>
                              )}
                              
                              {/* For other non-connected statuses (pending, error, expired), show reconnect */}
                              {effectiveStatus !== 'connected' && effectiveStatus !== 'not_connected' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditConnection(connection)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Update
                                  </Button>
                                   <Button 
                                     variant="outline" 
                                     size="sm"
                                     onClick={() => handleReconnect(connection)}
                                   >
                                     <Settings className="h-3 w-3 mr-1" />
                                     Reconnect
                                   </Button>
                                </>
                               )}
                               
                               {/* Show Edit and Reconnect for connected connections */}
                               {effectiveStatus === 'connected' && (
                                 <>
                                   <Button 
                                     variant="outline" 
                                     size="sm"
                                     onClick={() => handleEditConnection(connection)}
                                   >
                                     <Edit className="h-3 w-3 mr-1" />
                                     Edit
                                   </Button>
                                   <Button 
                                     variant="outline" 
                                     size="sm"
                                     onClick={() => handleReconnect(connection)}
                                   >
                                     <Settings className="h-3 w-3 mr-1" />
                                     Reconnect
                                   </Button>
                                 </>
                               )}
                                
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => deleteConnection(connection.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                            </div>
                         </div>
                       </CollapsibleContent>
                       </Collapsible>
                     );
                   })}
                 </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {totalConnections === 0 && (
          <div className="text-center py-8">
            <div className="bg-transparent border-2 border-white/40 dark:border-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Wifi className="h-8 w-8 text-white/70" />
            </div>
            <p className="text-sm text-white/70 font-semibold">No broker connections</p>
            <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700 text-white" onClick={handleAddConnection}>
              <Plus className="h-4 w-4 mr-1" />
              Add Connection
            </Button>
          </div>
        )}
      </div>

      {/* Broker Selection Dialog */}
      <BrokerSelectionDialog
        open={showBrokerSelection}
        onOpenChange={handleBrokerSelectionClose}
        onBrokerSelect={handleBrokerSelect}
      />

      {/* Broker Connection Settings Dialog */}
      <BrokerConnectionSettingsDialog
        open={showConnectionSettings}
        onOpenChange={handleSettingsDialogClose}
        onBack={handleBackToBrokerSelection}
        selectedBroker={selectedBroker}
        editingConnection={editingConnection}
      />

      {/* ClickHouse Connection Dialog */}
      <ClickHouseConnectionDialog
        open={showClickHouseDialog}
        onOpenChange={(open) => {
          setShowClickHouseDialog(open);
          if (!open) {
            setEditingConnection(null);
          }
        }}
        onSuccess={() => {
          refetch();
          setEditingConnection(null);
        }}
        editingConnection={editingConnection?.broker_type === 'clickhouse' ? editingConnection : null}
      />

    </div>
  );
};

export default BrokerSidebar;