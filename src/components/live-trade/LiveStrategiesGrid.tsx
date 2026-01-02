import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, Link2, Play, Pause, Square, Loader2, Settings, Plus, X } from 'lucide-react';
import { useLiveTradeStore, type LiveStrategy } from '@/hooks/use-live-trade-store';
import { useBrokerConnections, ClickHouseMetadata, getMetadataField } from '@/hooks/use-broker-connections';
import { useLiveTradingApi } from '@/hooks/use-live-trading-api';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useStartSimulation } from '@/hooks/use-start-simulation';
import { useUserSSE } from '@/hooks/use-user-sse';
import { toast } from 'sonner';
import { StrategyCardWithWebSocket } from './StrategyCardWithWebSocket';
import BrokerSidebar from './BrokerSidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LiveStrategiesGridProps {
  strategies: LiveStrategy[];
  onRemoveStrategy: (strategyId: string) => void;
  onViewTrades?: (strategyId: string) => void;
}

const LiveStrategiesGrid = ({ strategies, onRemoveStrategy, onViewTrades }: LiveStrategiesGridProps) => {
  const { userId } = useClerkUser();
  const [isStarting, setIsStarting] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [showBrokerDialog, setShowBrokerDialog] = useState(false);
  const [isExecutingQueue, setIsExecutingQueue] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);
  const [queuedStrategyIds, setQueuedStrategyIds] = useState<Set<string>>(new Set());
  const [isClearingQueue, setIsClearingQueue] = useState(false);
  const [strategyScales, setStrategyScales] = useState<Record<string, number>>({});

  const { 
    strategyConnections, 
    assignConnection,
    addToLiveTrading,
    updateStrategyStatus,
    setStrategyError,
    tradingStatus,
    setTradingStatus
  } = useLiveTradeStore();
  const { connections: brokerConnections } = useBrokerConnections();
  const { startLiveSession, stopLiveSession, stopAllUserSessions, loading, initApiUrl } = useLiveTradingApi(userId || undefined);
  const { startSimulation, isLoading: simulationLoading } = useStartSimulation();
  
  // Track if SSE should be enabled (only when running)
  const sseEnabled = tradingStatus === 'running';
  
  // User-level SSE connection - only connect when trading is running
  const { 
    sessionTicks, 
    isConnected: sseConnected,
    connect: connectSSE,
    disconnect: disconnectSSE
  } = useUserSSE(userId, apiBaseUrl, sseEnabled);

  // Initialize API URL
  useEffect(() => {
    const init = async () => {
      const url = await initApiUrl();
      setApiBaseUrl(url);
    };
    init();
  }, [initApiUrl]);

  // Listen for session completion events from SSE
  useEffect(() => {
    const handleSessionComplete = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { sessionId } = customEvent.detail;
      console.log('🏁 Session completed event received:', sessionId);
      
      // Find and update the strategy for this session
      const strategy = strategies.find(s => s.backendSessionId === sessionId);
      if (strategy) {
        console.log('📝 Updating strategy status to completed:', strategy.id);
        updateStrategyStatus(strategy.id, 'inactive', false); // Not live anymore
      }
      
      // Check if all sessions are completed
      const allCompleted = strategies.every(s => !s.isLive);
      if (allCompleted && tradingStatus === 'running') {
        console.log('✅ All sessions completed, switching to idle');
        setTradingStatus('idle');
        disconnectSSE();
      }
    };
    
    window.addEventListener('session_completed', handleSessionComplete);
    return () => window.removeEventListener('session_completed', handleSessionComplete);
  }, [strategies, tradingStatus, updateStrategyStatus, setTradingStatus, disconnectSSE]);

  // Fetch initial queue state once on mount
  useEffect(() => {
    if (!userId || !apiBaseUrl) return;

    const fetchInitialQueueState = async () => {
      try {
        const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const response = await fetch(`${baseUrl}/api/queue/status/admin_tester`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        if (response.ok) {
          const data = await response.json();
          setQueuedCount(data.total_strategies);
          
          const queuedIds = new Set<string>(
            data.entries?.map((entry: any) => String(entry.strategy_id)) || []
          );
          setQueuedStrategyIds(queuedIds);
          
          console.log('📊 Initial queue state:', { count: data.total_strategies, ids: Array.from(queuedIds) });
        }
      } catch (error) {
        console.error('Failed to fetch initial queue state:', error);
      }
    };

    fetchInitialQueueState();
  }, [userId, apiBaseUrl]);

  const handleConnectionChange = (strategyId: string, connectionId: string) => {
    console.log('🔄 Changing connection for strategy:', { strategyId, connectionId });
    
    const connection = brokerConnections.find(conn => conn.id === connectionId);
    if (!connection) {
      toast.error('Connection not found');
      return;
    }
    
    // Get the strategy being assigned
    const currentStrategy = strategies.find(s => s.id === strategyId);
    if (!currentStrategy) {
      toast.error('Strategy not found');
      return;
    }
    
    // Check for duplicate strategy+broker combination
    const existingDuplicate = strategies.find(s => {
      // Skip self
      if (s.id === strategyId) return false;
      
      // Check if same backend strategy ID + same connection
      const existingConnectionId = strategyConnections[s.id];
      return s.strategyId === currentStrategy.strategyId && existingConnectionId === connectionId;
    });
    
    if (existingDuplicate) {
      const duplicateConnectionName = brokerConnections.find(c => c.id === strategyConnections[existingDuplicate.id])?.connection_name;
      toast.error(
        `⚠️ This strategy is already using ${duplicateConnectionName || 'this broker'}. Each strategy+broker combination must be unique.`,
        { duration: 6000 }
      );
      setStrategyError(strategyId, `Duplicate: Already assigned to ${duplicateConnectionName || 'this broker'}`);
      return;
    }
    
    // Clear any previous errors (valid selection)
    setStrategyError(strategyId, undefined);

    // ClickHouse simulation connections are always ready
    if (connection.broker_type === 'clickhouse') {
      assignConnection(strategyId, connectionId);
      updateStrategyStatus(strategyId, 'active');
      toast.success(`Strategy activated with ${connection.connection_name}`);
      return;
    }

    // For real brokers, check token validity
    const tokenExpiresAt = getMetadataField<string>(connection.broker_metadata, 'token_expires_at');
    const isConnectionExpired = tokenExpiresAt ? new Date() > new Date(tokenExpiresAt) : false;
    
    const accessToken = getMetadataField<string>(connection.broker_metadata, 'access_token');
    const requestToken = getMetadataField<string>(connection.broker_metadata, 'request_token');
    const isEffectivelyConnected = !isConnectionExpired && 
      connection.is_active && 
      (accessToken || requestToken);
    
    // Assign connection regardless of token validity
    assignConnection(strategyId, connectionId);
    
    if (!isEffectivelyConnected) {
      // Show error but keep assignment
      setStrategyError(strategyId, 'Broker connection is not ready. Please reconnect the broker.');
      toast.error('Connection is not ready for trading. Please reconnect.');
      updateStrategyStatus(strategyId, 'inactive');
      return;
    }
    
    // Valid tokens - mark as ready
    updateStrategyStatus(strategyId, 'active');
    toast.success(`Strategy activated with ${connection.connection_name}`);
  };

  const getConnectionName = (connectionId?: string) => {
    if (!connectionId) return 'No connection';
    const connection = brokerConnections.find(c => c.id === connectionId);
    return connection ? `${connection.broker_type} (${connection.connection_name})` : 'Unknown connection';
  };

  const getConnectionStatus = (connectionId?: string) => {
    if (!connectionId) return 'disconnected';
    const connection = brokerConnections.find(c => c.id === connectionId);
    if (!connection) return 'disconnected';
    
    if (connection.broker_type === 'clickhouse') return 'connected';
    
    const accessToken = getMetadataField<string>(connection.broker_metadata, 'access_token');
    const requestToken = getMetadataField<string>(connection.broker_metadata, 'request_token');
    if (connection.is_active && (accessToken || requestToken)) return 'connected';
    
    return connection.status || 'disconnected';
  };

  // Calculate strategy counts
  const connectedCount = strategies.filter(s => strategyConnections[s.id]).length;
  const liveCount = strategies.filter(s => s.isLive).length;

  // Helper to get session tick data
  const getSessionTickData = (sessionId: string) => {
    const sessionData = sessionTicks[sessionId];
    if (!sessionData) return null;
    
    // Return as-is, type compatibility handled by component
    return sessionData as any;
  };

  // Execute all queued strategies
  const handleStartAll = async () => {
    if (!userId || !apiBaseUrl) {
      toast.error('Not configured');
      return;
    }
    
    if (queuedCount === 0) {
      toast.error('No strategies in queue. Submit strategies first.');
      return;
    }
    
    setIsExecutingQueue(true);
    
    try {
      const baseUrl = apiBaseUrl?.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      // Backend fetches simulation params from broker_connection metadata
      const executeUrl = `${baseUrl}/api/queue/execute?queue_type=admin_tester&trigger_type=manual`;
      
      console.log('=== QUEUE EXECUTE REQUEST ===');
      console.log('URL:', executeUrl);
      
      const response = await fetch(executeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to execute: ${errorText}`);
      }
      
      const result = await response.json();
      
      console.log('✅ Queue execute result:', result);
      console.log('📊 Session IDs from backend:', result.session_ids);
      
      // Mark all queued strategies as LIVE by updating their status with correct session IDs
      const queuedStrategiesList = strategies.filter(s => queuedStrategyIds.has(s.strategyId));
      
      // Match strategies to session IDs
      // Backend returns session_ids in format: {strategy_id}_{broker_connection_id}
      const sessionIds = result.session_ids || [];
      queuedStrategiesList.forEach((strategy, index) => {
        const backendSessionId = sessionIds[index];
        const connectionId = strategyConnections[strategy.id];
        
        console.log('🟢 Marking strategy as LIVE:', { 
          id: strategy.id, 
          strategyId: strategy.strategyId,
          connectionId: connectionId,
          backendSessionId,
          expectedFormat: `${strategy.strategyId}_${connectionId}`
        });
        
        // Update existing strategy in store with correct backend session ID
        // Session ID format: {strategy_id}_{broker_connection_id}
        updateStrategyStatus(
          strategy.id,
          'active',
          true, // isLive = true
          backendSessionId // Format: 5708424d-5962-4629-978c-05b3a174e104_acf98a95-1547-4a72-b824-3ce7068f05b4
        );
      });
      
      console.log(`✅ Updated ${queuedStrategiesList.length} strategies to LIVE with session IDs:`, sessionIds);
      
      // Clear queued strategy IDs (queue auto-clears on backend)
      setQueuedStrategyIds(new Set());
      setQueuedCount(0);
      
      // Set trading status to running
      setTradingStatus('running');
      
      // Connect SSE for live updates
      connectSSE();
      
      toast.success(
        `🚀 Started ${result.strategy_count} strategies! ` +
        `Processing ${result.symbols_count} symbols.`,
        { duration: 5000 }
      );
      
      // Update trading status
      setTradingStatus('running');
      
    } catch (error) {
      console.error('Failed to execute queue:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start');
    } finally {
      setIsExecutingQueue(false);
    }
  };

  // Clear entire queue
  const handleClearQueue = async () => {
    if (!userId || !apiBaseUrl) {
      console.error('❌ Clear queue failed:', { userId, apiBaseUrl });
      toast.error('Configuration error: userId or apiBaseUrl missing');
      return;
    }

    setIsClearingQueue(true);
    try {
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const url = `${baseUrl}/api/queue/clear/admin_tester`;
      
      console.log('🗑️ Clearing queue:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Clear failed:', { status: response.status, errorText });
        throw new Error(`Failed to clear: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Queue cleared:', result);
      
      // Reset local state
      setQueuedStrategyIds(new Set());
      setQueuedCount(0);
      
      console.log('📊 Queue state after clear: { count: 0, ids: [] }');

      toast.success(`Cleared ${result.strategies_removed} strategies from queue`);
    } catch (error) {
      console.error('❌ Clear queue error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : 'Failed to clear queue');
    } finally {
      setIsClearingQueue(false);
    }
  };

  // Handle scale change for a strategy
  const handleScaleChange = (strategyId: string, scale: number) => {
    setStrategyScales(prev => ({
      ...prev,
      [strategyId]: scale
    }));
  };

  // Toggle individual strategy in queue
  const handleQueueToggle = async (strategyId: string, shouldQueue: boolean) => {
    if (!userId || !apiBaseUrl) {
      console.error('❌ Queue toggle failed:', { userId, apiBaseUrl, strategyId, shouldQueue });
      toast.error('Configuration error: userId or apiBaseUrl missing');
      return;
    }

    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

    try {
      if (shouldQueue) {
        // Add to queue
        const strategy = strategies.find(s => s.strategyId === strategyId);
        if (!strategy) {
          console.error('❌ Strategy not found:', strategyId);
          return;
        }

        const connectionId = strategyConnections[strategy.id];
        if (!connectionId) {
          toast.error('No broker connection selected');
          return;
        }

        const scale = strategyScales[strategyId] || 1;
        
        const queueStrategy = {
          strategy_id: strategyId,
          broker_connection_id: connectionId,
          scale: scale
        };

        const url = `${baseUrl}/api/queue/submit?user_id=${encodeURIComponent(userId)}&queue_type=admin_tester`;
        console.log('➕ Adding to queue:', { url, payload: queueStrategy });

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify([queueStrategy])
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Add to queue failed:', { status: response.status, errorText });
          throw new Error(`Failed to add: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Added to queue:', result);
        
        // Update local state from API response
        const newQueuedIds = new Set(queuedStrategyIds);
        newQueuedIds.add(strategyId);
        setQueuedStrategyIds(newQueuedIds);
        setQueuedCount(result.total_strategies_queued);
        
        console.log('📊 Queue state after add:', { count: result.total_strategies_queued, ids: Array.from(newQueuedIds) });

        toast.success('Added to queue');
      } else {
        // Remove from queue
        const url = `${baseUrl}/api/queue/remove/admin_tester/${strategyId}`;
        console.log('➖ Removing from queue:', url);

        const response = await fetch(url, {
          method: 'DELETE',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Remove from queue failed:', { status: response.status, errorText });
          throw new Error(`Failed to remove: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Removed from queue:', result);
        
        // Update local state from API response
        const newQueuedIds = new Set(queuedStrategyIds);
        newQueuedIds.delete(strategyId);
        setQueuedStrategyIds(newQueuedIds);
        setQueuedCount(result.remaining_strategies);
        
        console.log('📊 Queue state after remove:', { count: result.remaining_strategies, ids: Array.from(newQueuedIds) });

        toast.success('Removed from queue');
      }
    } catch (error) {
      console.error('❌ Queue toggle error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
        strategyId,
        shouldQueue
      });
      toast.error(error instanceof Error ? error.message : 'Failed to update queue');
    }
  };

// ...

  // USER-LEVEL STOP: Stop all running strategies and disconnect SSE
  const handleStopAllTrading = async () => {
    // Immediately disconnect SSE and set status to idle
    disconnectSSE();
    setTradingStatus('idle');

    if (!userId) {
      toast.success('Trading stopped');
      return;
    }

    try {
      // Stop all user sessions on the backend (including orphaned ones)
      await stopAllUserSessions(userId);
      
      // Reset local state for all strategies
      strategies.forEach(strategy => {
        if (strategy.isLive) {
          updateStrategyStatus(strategy.id, 'inactive', false);
          setStrategyError(strategy.id, undefined);
        }
      });
      
      toast.success('All sessions stopped');
    } catch (error) {
      console.error('Failed to stop all sessions:', error);
      toast.error('Failed to stop some sessions');
    }
  };

// ...

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Left Column - Main Content */}
      <div className="space-y-6">
        {/* User-Level Trading Controls */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-lg">Trading Controls</h3>
                <p className="text-sm text-muted-foreground">
                  {connectedCount} strategies ready • {liveCount} running
                  {sseConnected && <span className="text-success ml-2">• Live data connected</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {tradingStatus === 'idle' && queuedCount > 0 && (
                <>
                  <Button
                    onClick={handleClearQueue}
                    disabled={isClearingQueue || isExecutingQueue}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    {isClearingQueue ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    Clear Queue
                  </Button>
                  
                  <Button
                    onClick={handleStartAll}
                    disabled={isExecutingQueue}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    {isExecutingQueue ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Start All ({queuedCount})
                  </Button>
                </>
              )}
              
              {tradingStatus === 'running' && (
                <Button
                  onClick={handleStopAllTrading}
                  variant="destructive"
                  disabled={loading}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop All
                </Button>
              )}

              {tradingStatus === 'paused' && (
                <>
                  <Button
                    onClick={handleStartAll}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    disabled={isExecutingQueue}
                  >
                    {isExecutingQueue ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Resume
                  </Button>
                  <Button
                    onClick={handleStopAllTrading}
                    variant="destructive"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop All
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Live Trading Dashboard */}
      {/* DEBUG MARKER: LiveStrategiesGrid.tsx FILE IS ACTIVE - VERSION 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <CardContent className="p-4">
            {/* 🔴 DEBUG: If you see this, LiveStrategiesGrid.tsx is ACTIVE */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-400 font-semibold">Total P&L 🟢 UPDATED</p>
                <p className={`text-2xl font-bold ${
                  Object.values(sessionTicks).reduce((total, tick) => {
                    const pnl = parseFloat(tick.tickState.pnl_summary?.total_pnl || '0');
                    return total + pnl;
                  }, 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ₹{Object.values(sessionTicks).reduce((total, tick) => {
                    const pnl = parseFloat(tick.tickState.pnl_summary?.total_pnl || '0');
                    return total + pnl;
                  }, 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400 font-semibold">Realized P&L</p>
                <p className={`text-2xl font-bold ${
                  Object.values(sessionTicks).reduce((total, tick) => {
                    const pnl = parseFloat(tick.tickState.pnl_summary?.realized_pnl || '0');
                    return total + pnl;
                  }, 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ₹{Object.values(sessionTicks).reduce((total, tick) => {
                    const pnl = parseFloat(tick.tickState.pnl_summary?.realized_pnl || '0');
                    return total + pnl;
                  }, 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400 font-semibold">LTP Updates</p>
                <p className="text-2xl font-bold text-cyan-300">
                  {Object.values(sessionTicks).reduce((total, tick) => {
                    const ltpCount = tick.tickState.ltp_store ? Object.keys(tick.tickState.ltp_store).length : 0;
                    return total + ltpCount;
                  }, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.values(sessionTicks).reduce((total, tick) => {
                    const ltpCount = tick.tickState.ltp_store ? Object.keys(tick.tickState.ltp_store).length : 0;
                    return total + ltpCount;
                  }, 0)} symbols streaming
                </p>
              </div>
              <Activity className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-400 font-semibold">Position Store</p>
                <p className="text-2xl font-bold text-orange-300">
                  {Object.values(sessionTicks).reduce((total, tick) => {
                    const positions = tick.tickState.open_positions || [];
                    return total + positions.length;
                  }, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.values(sessionTicks).reduce((total, tick) => {
                    const positions = tick.tickState.open_positions || [];
                    return total + positions.length;
                  }, 0)} active positions
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategies Grid - No individual start buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {strategies.map((strategy) => {
          const connectionId = strategyConnections[strategy.id];
          const connectionStatus = getConnectionStatus(connectionId);
          const tickData = strategy.backendSessionId ? getSessionTickData(strategy.backendSessionId) : null;
          
          return (
            <StrategyCardWithWebSocket
              key={strategy.id}
              strategy={strategy}
              connectionId={connectionId}
              connectionStatus={connectionStatus}
              getConnectionName={getConnectionName}
              handleConnectionChange={handleConnectionChange}
              handleStartStrategy={() => {}} // Disabled - use user-level controls
              handleStopStrategy={() => {}} // Disabled - use user-level controls
              handleRemoveStrategy={() => onRemoveStrategy(strategy.id)}
              brokerConnections={brokerConnections}
              loading={loading || simulationLoading}
              hideStartStopButtons={true}
              liveTickData={tickData}
              onViewTrades={onViewTrades}
              isQueued={queuedStrategyIds.has(strategy.strategyId)}
              onQueueToggle={handleQueueToggle}
              canQueue={tradingStatus === 'idle'}
              scale={strategyScales[strategy.strategyId] || 1}
              onScaleChange={handleScaleChange}
            />
          );
        })}
      </div>
      </div>

      {/* Right Column - Broker Connections */}
      <div className="space-y-6">
        <Card className="border-2 border-blue-500/30 bg-blue-500/5 sticky top-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-500" />
                Broker Connections
              </CardTitle>
              <Button
                onClick={() => setShowBrokerDialog(true)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Manage trading accounts
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {brokerConnections.length === 0 ? (
              <div className="text-center py-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No Connections</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add broker to start
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowBrokerDialog(true)}
                    size="sm"
                    className="mt-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Broker
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {brokerConnections.map((conn) => (
                  <Card key={conn.id} className="border-muted">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{conn.connection_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{conn.broker_type}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                          conn.is_active && conn.status === 'connected' 
                            ? 'bg-green-500 animate-pulse' 
                            : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conn.is_active && conn.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  onClick={() => setShowBrokerDialog(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Connection
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Broker Connection Management Dialog */}
      <Dialog open={showBrokerDialog} onOpenChange={setShowBrokerDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Broker Connection Management</DialogTitle>
          </DialogHeader>
          <div className="h-full">
            <BrokerSidebar />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveStrategiesGrid;