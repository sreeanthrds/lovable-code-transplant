import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLiveTradeStore, LiveStrategy } from '@/hooks/use-live-trade-store';
import { useLivePolling } from '@/hooks/use-live-polling';
import { useUserSSE } from '@/hooks/use-user-sse';
import { useStrategyNodes } from '@/hooks/use-strategy-nodes';
import { useClerkUser } from '@/hooks/useClerkUser';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Activity, RefreshCw, Radio, ScrollText } from 'lucide-react';
import { useSSELogsStore } from '@/stores/sse-logs-store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Trade, DailySummary } from '@/types/backtest';

// Components
import { SessionsSidebar } from './SessionsSidebar';
import { LiveReportPanel } from './LiveReportPanel';
import { LiveStrategyCanvas } from './LiveStrategyCanvas';
import { SSELogsPanel } from './SSELogsPanel';
import LiveStrategiesGrid from '../LiveStrategiesGrid';
import BrokerSidebar from '../BrokerSidebar';

// Transform polling session data to format expected by LiveReportPanel
function transformSessionToPollingData(sessionData: any): {
  trades: Trade[];
  pnl: DailySummary;
  positions: any[];
  timestamp: string;
} | null {
  if (!sessionData?.data?.gps_data) {
    console.log('⚠️ transformSessionToPollingData: No gps_data in session');
    return null;
  }
  
  const { gps_data } = sessionData.data;
  
  // Log raw data for debugging
  console.log('📊 Raw gps_data:', {
    tradesCount: gps_data.trades?.length || 0,
    pnl: gps_data.pnl,
    positionsCount: gps_data.positions?.length || 0
  });
  
  // Trades are already in the correct format from backend
  const trades: Trade[] = (gps_data.trades || []).map((trade: any) => ({
    trade_id: trade.trade_id,
    position_id: trade.position_id,
    re_entry_num: trade.re_entry_num || 0,
    symbol: trade.symbol,
    side: trade.side,
    quantity: trade.quantity,
    entry_price: trade.entry_price,
    entry_time: trade.entry_time,
    exit_price: trade.exit_price,
    exit_time: trade.exit_time,
    pnl: trade.pnl,
    pnl_percent: trade.pnl_percent,
    duration_minutes: trade.duration_minutes,
    status: trade.status,
    entry_flow_ids: trade.entry_flow_ids || [],
    exit_flow_ids: trade.exit_flow_ids || [],
    entry_trigger: trade.entry_trigger || '',
    exit_reason: trade.exit_reason || null
  }));

  // PnL summary - map to DailySummary format
  const pnlData = gps_data.pnl || {};
  
  // Calculate winning/losing from trades if not provided
  const winningTrades = pnlData.winning_trades ?? trades.filter((t: Trade) => parseFloat(String(t.pnl || 0)) > 0).length;
  const losingTrades = pnlData.losing_trades ?? trades.filter((t: Trade) => parseFloat(String(t.pnl || 0)) <= 0).length;
  
  const pnl: DailySummary = {
    total_trades: pnlData.closed_trades || trades.length,
    total_pnl: pnlData.total_pnl || '0',
    winning_trades: winningTrades,
    losing_trades: losingTrades,
    win_rate: pnlData.win_rate || (trades.length > 0 ? ((winningTrades / trades.length) * 100).toFixed(1) : '0')
  };
  
  console.log('📊 Transformed:', { tradesCount: trades.length, pnl });

  return {
    trades,
    pnl,
    positions: gps_data.positions || [],
    timestamp: sessionData.data.timestamp || new Date().toISOString()
  };
}

export function LiveDashboardLayout() {
  const { userId } = useClerkUser();
  const { liveStrategies, removeFromLiveTrading, clearAllStrategies, tradingStatus } = useLiveTradeStore();
  const { dashboardData, isConnected: isPollingConnected, startPolling, stopPolling, error: pollingError } = useLivePolling();
  
  // Get API base URL
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  useEffect(() => {
    const initUrl = async () => {
      try {
        const url = await (await import('@/lib/api-config')).getApiBaseUrl(userId || undefined);
        setApiBaseUrl(url);
      } catch (err) {
        console.error('Failed to get API base URL:', err);
        setApiBaseUrl('https://api.tradelayout.com');
      }
    };
    initUrl();
  }, [userId]);
  
  // One-time cleanup: remove any mock/auto-added strategies on mount
  useEffect(() => {
    if (liveStrategies.some(s => s.name === 'Demo Strategy' || s.name === 'Momentum Strategy' || s.name === 'Mean Reversion' || s.name === 'Breakout Strategy')) {
      clearAllStrategies();
    }
  }, []);

  const [activeTab, setActiveTab] = useState<string>('manager');
  const [selectedStrategy, setSelectedStrategy] = useState<LiveStrategy | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  
// Get session ID for selected strategy
  const sessionId = selectedStrategy?.backendSessionId || selectedStrategy?.id || null;
  
  // User-level SSE hook for all sessions (includes eventsHistory for flow diagrams)
  const { 
    sessionTicks,
    sessionDiagnostics,
    sessionTrades,
    isConnected: isSSEConnected,
    error: sseError,
    connect: connectSSE
  } = useUserSSE(userId || null, apiBaseUrl, true);
  
  // Extract data for selected session
  const sseEventsHistory = sessionId ? (sessionDiagnostics[sessionId]?.events_history || {}) : {};
  const sseTickData = sessionId ? sessionTicks[sessionId]?.tickState : null;
  
  // Transform polling data for the selected session (in backtest format)
  const pollingData = useMemo(() => {
    if (!dashboardData?.sessions || !sessionId) return null;
    const sessionData = dashboardData.sessions[sessionId];
    if (!sessionData) return null;
    return transformSessionToPollingData(sessionData);
  }, [dashboardData, sessionId]);
  
  // events_history comes ONLY from SSE (by design - not in polling API)
  // Log SSE events count for debugging
  useEffect(() => {
    const count = Object.keys(sseEventsHistory).length;
    if (count > 0) {
      console.log(`📊 SSE eventsHistory: ${count} events cached`);
    }
  }, [sseEventsHistory]);
  
  // Check if we have data ready
  const hasData = !!pollingData;
  
  // Get node states from SSE tick data for canvas (if available)
  // Map active/pending nodes from tick_update to node states
  const nodeStates = sseTickData ? 
    Object.fromEntries([
...(sseTickData.active_nodes || []).map((nodeId: string) => [
        nodeId,
        {
          nodeId,
          status: 'active' as const,
          lastUpdate: sseTickData.timestamp,
          data: {}
        }
      ]),
...(sseTickData.pending_nodes || []).map((nodeId: string) => [
        nodeId,
        {
          nodeId,
          status: 'pending' as const,
          lastUpdate: sseTickData.timestamp,
          data: {}
        }
      ])
    ])
    : {};
  
  // Load strategy nodes and edges from database for canvas
  const { 
    nodes: strategyNodes, 
    edges: strategyEdges,
    isLoading: isLoadingNodes
  } = useStrategyNodes(selectedStrategy?.strategyId || null);

  // Listen for session completion events from SSE
  useEffect(() => {
    const handleSessionCompleted = (event: CustomEvent) => {
      const { sessionId } = event.detail;
      console.log(`🏁 Dashboard: Session ${sessionId} completed - marking as completed`);
      
      // Update strategy status to 'completed' and isLive to false
      const { liveStrategies, updateStrategyStatus } = useLiveTradeStore.getState();
      const strategy = liveStrategies.find(s => 
        s.id === sessionId || s.backendSessionId === sessionId
      );
      
      if (strategy) {
        updateStrategyStatus(strategy.id, 'completed', false);
      }
    };
    
    window.addEventListener('session_completed', handleSessionCompleted as EventListener);
    
    return () => {
      window.removeEventListener('session_completed', handleSessionCompleted as EventListener);
    };
  }, []);

  // Start/stop polling based on active tab and dashboard visibility
  useEffect(() => {
    if (activeTab === 'dashboard' && userId) {
      // Always poll when on dashboard tab to show data
      startPolling();
    } else {
      stopPolling();
    }
  }, [activeTab, userId, tradingStatus, startPolling, stopPolling]);

  // Clear selected strategy if its session no longer exists in dashboard
  // Only clear when we have confirmed data loaded and session is genuinely missing
  useEffect(() => {
    if (selectedStrategy && dashboardData?.sessions && sessionId) {
      const sessionExists = dashboardData.sessions[sessionId];
      // Only clear if we have sessions data AND this specific session is missing
      // AND we have at least received one successful poll (total_sessions > 0 or sessions object has keys)
      const hasLoadedData = dashboardData.total_sessions !== undefined && 
        (dashboardData.total_sessions > 0 || Object.keys(dashboardData.sessions).length > 0);
      
      if (!sessionExists && hasLoadedData) {
        console.log('⚠️ Selected session no longer exists, clearing selection');
        setSelectedStrategy(null);
      }
    }
  }, [dashboardData, selectedStrategy, sessionId]);

  // Handler for selecting a strategy from sidebar
  const handleSelectStrategy = useCallback((strategy: LiveStrategy) => {
    setSelectedStrategy(strategy);
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    setIsSyncing(true);
    startPolling();
    setTimeout(() => setIsSyncing(false), 1000);
  }, [startPolling]);

  // Remove strategy handler
  const handleRemoveStrategy = (strategyId: string) => {
    removeFromLiveTrading(strategyId);
    if (selectedStrategy?.id === strategyId) {
      setSelectedStrategy(null);
    }
  };

  // Open canvas dialog
  const handleOpenCanvas = useCallback(() => {
    setIsCanvasOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Top Tabs */}
      <div className="border-b border-border/30 bg-background/50 px-6 pt-4 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/30">
            <TabsTrigger value="manager" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Live Trade Manager
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <ScrollText className="w-4 h-4" />
              SSE Logs
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Connection Status & Refresh (Dashboard tab only) */}
        {activeTab === 'dashboard' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              {/* Data source status */}
              <div className={`w-2 h-2 rounded-full ${hasData ? 'bg-success' : isPollingConnected ? 'bg-warning' : 'bg-muted-foreground'}`} />
              <span className="text-muted-foreground">
                {hasData ? 'Data Ready' : isPollingConnected ? 'Loading...' : pollingError ? 'Error' : 'Connecting...'}
              </span>
              {/* SSE status for selected strategy */}
              {selectedStrategy && (
                <>
                  <Radio className={`w-3 h-3 ${isSSEConnected ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className="text-muted-foreground">
                    {isSSEConnected ? 'Live' : sseError ? 'SSE Error' : 'Connecting...'}
                  </span>
                </>
              )}
              {liveStrategies.filter(s => s.isLive).length > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-success/20 text-success font-medium">
                  {liveStrategies.filter(s => s.isLive).length} Live
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isSyncing}
              className="h-7 px-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'manager' && (
          /* Live Trade Manager View */
          <div className="flex h-full w-full overflow-hidden">
            <div className="flex-1 flex flex-col">
              <div className="border-b border-border/30 bg-background/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Live Trade Manager</h1>
                    <p className="text-muted-foreground text-sm">
                      Deploy your strategies for live trading with connected brokers
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-auto">
                <LiveStrategiesGrid 
                  strategies={liveStrategies}
                  onRemoveStrategy={handleRemoveStrategy}
                />
              </div>
            </div>

            <BrokerSidebar />
          </div>
        )}

        {activeTab === 'dashboard' && (
          /* Dashboard View - Simplified: Only Live Report with Canvas button */
          <div className="flex h-full w-full overflow-hidden">
            {/* Left Sidebar - Sessions */}
            <SessionsSidebar
              strategies={liveStrategies}
              selectedStrategyId={selectedStrategy?.id || null}
              onSelectStrategy={handleSelectStrategy}
            />

            {/* Main Content - Live Report */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              <LiveReportPanel
                selectedStrategy={selectedStrategy}
                pollingData={pollingData}
                eventsHistory={sseEventsHistory}
                isConnected={isPollingConnected || isSSEConnected}
                error={pollingError || sseError}
                allStrategies={liveStrategies}
                onOpenCanvas={selectedStrategy ? handleOpenCanvas : undefined}
              />
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          /* SSE Logs View */
          <SSELogsPanel />
        )}
      </div>

      {/* Strategy Canvas Dialog */}
      <Dialog open={isCanvasOpen} onOpenChange={setIsCanvasOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0">
          <DialogHeader className="px-4 py-3 border-b border-border/30">
            <DialogTitle className="flex items-center gap-2">
              Strategy Canvas
              {selectedStrategy && (
                <span className="text-muted-foreground font-normal text-sm">
                  - {selectedStrategy.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-[calc(90vh-60px)]">
            {selectedStrategy && (
              <LiveStrategyCanvas
                selectedStrategy={selectedStrategy}
                nodes={strategyNodes}
                edges={strategyEdges}
                nodeStates={nodeStates as any}
                isLoading={isLoadingNodes}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
