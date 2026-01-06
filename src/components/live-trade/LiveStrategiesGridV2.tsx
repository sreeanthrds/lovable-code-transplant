import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Trash2, AlertCircle, Activity, Calendar, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveTradeStore } from '@/hooks/use-live-trade-store';
import { useBrokerConnections } from '@/hooks/use-broker-connections';
import { useLiveTradingApi } from '@/hooks/use-live-trading-api';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useHttpPolling } from '@/hooks/use-http-polling';
import { toast } from 'sonner';
import { LiveStrategyCardV2 } from "./LiveStrategyCardV2";
import { ViewTradesModalV2 } from "./ViewTradesModalV2";
import { LiveDataPanel } from "./LiveDataPanel";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';

// Type for card display - simplified from SSE data
interface LiveTickDataForCard {
  pnl_summary?: {
    total_pnl: string;
    realized_pnl: string;
    unrealized_pnl: string;
    closed_trades: number;
    open_trades: number;
  };
  progress?: {
    ticks_processed: number;
    total_ticks: number;
  };
  ltp_store?: Record<string, number>;
  open_positions?: Array<any>;
  last_update?: string;
  timestamp?: string;
}

export const LiveStrategiesGridV2 = () => {
  const navigate = useNavigate();
  const { userId } = useClerkUser();
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [queuedStrategyIds, setQueuedStrategyIds] = useState<Set<string>>(new Set());
  const [strategyScales, setStrategyScales] = useState<Record<string, number>>({});
  const [isExecutingQueue, setIsExecutingQueue] = useState(false);
  const [selectedStrategyForTrades, setSelectedStrategyForTrades] = useState<string | null>(null);
  
  // Backtest mode state
  const [mode, setMode] = useState<'live' | 'backtest'>('live');
  const [backtestDate, setBacktestDate] = useState<Date>(new Date(2024, 9, 1)); // Oct 1, 2024
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [backtestTickData, setBacktestTickData] = useState<Record<string, any>>({});
  
  // Streaming backtest state
  const [streamingProgress, setStreamingProgress] = useState<{
    isStreaming: boolean;
    currentTimestamp: string;
    progressPct: number;
    ticksProcessed: number;
    totalSeconds: number;
    activeNodes: string[];
    positionsCount: number;
  } | null>(null);
  
  // Streaming trades and diagnostics for modal
  const [streamingTrades, setStreamingTrades] = useState<Record<string, any>>({});
  const [streamingDiagnostics, setStreamingDiagnostics] = useState<Record<string, any>>({});
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  
  // Live Data Panel expansion state
  const [isDataPanelExpanded, setIsDataPanelExpanded] = useState(false);

  const {
    liveStrategies,
    strategyConnections,
    assignConnection,
    updateStrategyStatus,
    removeFromLiveTrading,
    tradingStatus,
    setTradingStatus,
    setAllStrategies
  } = useLiveTradeStore();

  const { connections: brokerConnections } = useBrokerConnections();
  const { initApiUrl } = useLiveTradingApi(userId || undefined);

  // Count only active strategies (status = 'active' which maps to is_active = 1)
  const activeStrategiesCount = useMemo(() => {
    return liveStrategies.filter(strategy => strategy.status === 'active').length;
  }, [liveStrategies]);

  // HTTP Polling - get session IDs of all live strategies
  const liveSessionIds = useMemo(() => {
    return liveStrategies
      .filter(s => s.isLive && s.backendSessionId)
      .map(s => s.backendSessionId as string);
  }, [liveStrategies]);

  const pollingEnabled = tradingStatus === 'running' && liveSessionIds.length > 0;
  const {
    sessionTicks,
    isPolling,
    connectPolling,
    disconnectPolling
  } = useHttpPolling(userId, apiBaseUrl, liveSessionIds, pollingEnabled, 100);

  // Initialize API URL
  useEffect(() => {
    const init = async () => {
      const url = await initApiUrl();
      setApiBaseUrl(url);
    };
    init();
  }, [initApiUrl]);

  // Load ALL strategies from multi_strategy_queue table (single source of truth)
  useEffect(() => {
    if (!userId) return;

    const loadQueueStrategies = async () => {
      try {
        const client = await getAuthenticatedTradelayoutClient();
        const { data, error } = await (client as any)
          .from('multi_strategy_queue')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('[DEBUG] Raw queue data from table:', data);
        console.log('[DEBUG] Number of rows loaded:', data?.length || 0);

        // Transform ALL queue data to liveStrategies format (both active and inactive)
        const transformedStrategies = (data || []).map((queueEntry: any) => ({
          id: queueEntry.queue_id, // Use queue_id as the unique identifier
          strategyId: queueEntry.strategy_id,
          name: queueEntry.name || `Strategy ${queueEntry.strategy_id}`,
          description: queueEntry.description || '',
          status: queueEntry.is_active === 1 ? 'active' : 'inactive', // Status based on is_active
          isLive: false,
          backendSessionId: null,
          addedAt: queueEntry.created_at,
          connectionId: queueEntry.broker_connection_id,
          error: undefined
        }));

        console.log('[DEBUG] Transformed strategies:', transformedStrategies);
        console.log('[DEBUG] Number of transformed strategies:', transformedStrategies.length);

        // Set all strategies at once (replaces existing strategies)
        setAllStrategies(transformedStrategies);

        // Load connections from queue data
        (data || []).forEach((queueEntry: any) => {
          if (queueEntry.broker_connection_id) {
            assignConnection(queueEntry.queue_id, queueEntry.broker_connection_id);
          }
        });
      } catch (error) {
        console.error('Failed to load queue strategies:', error);
      }
    };

    loadQueueStrategies();
  }, [userId, setAllStrategies, assignConnection]);

  // Debug: Log liveStrategies after loading
  useEffect(() => {
    console.log('[DEBUG] Current liveStrategies in store:', liveStrategies);
    console.log('[DEBUG] Number of strategies in store:', liveStrategies.length);
    console.log('[DEBUG] Active strategies count:', activeStrategiesCount);
  }, [liveStrategies, activeStrategiesCount]);

  // Listen for session completion
  useEffect(() => {
    const handleSessionComplete = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { sessionId } = customEvent.detail;

      const strategy = liveStrategies.find(s => s.backendSessionId === sessionId);
      if (strategy) {
        updateStrategyStatus(strategy.id, 'inactive', false);
      }

      // Check if all completed
      const allCompleted = liveStrategies.every(s => !s.isLive);
      if (allCompleted && tradingStatus === 'running') {
        setTradingStatus('idle');
        disconnectPolling();
      }
    };

    window.addEventListener('session_completed', handleSessionComplete);
    return () => window.removeEventListener('session_completed', handleSessionComplete);
  }, [liveStrategies, tradingStatus, updateStrategyStatus, setTradingStatus, disconnectPolling]);

  // Handle strategy removal (cascade delete from multi_strategy_queue table)
  const handleRemoveStrategy = useCallback(async (strategyId: string) => {
    if (!userId) return;

    try {
      // Delete from multi_strategy_queue table using queue_id
      const client = await getAuthenticatedTradelayoutClient();
      const { error } = await (client as any)
        .from('multi_strategy_queue')
        .delete()
        .eq('queue_id', strategyId);

      if (error) throw error;

      // Remove from store
      removeFromLiveTrading(strategyId);
      
      toast.success('Strategy removed successfully');
    } catch (error) {
      console.error('Failed to remove strategy:', error);
      toast.error('Failed to remove strategy');
    }
  }, [userId, removeFromLiveTrading]);

  // Helper to get existing combinations excluding a specific strategy
  const getExistingCombinations = (excludeStrategyId: string) => {
    return liveStrategies
      .filter(s => s.id !== excludeStrategyId && strategyConnections[s.id])
      .map(s => [s.strategyId, strategyConnections[s.id]] as [string, string]);
  };

  // Queue management - direct Supabase upsert for backtest mode
  const handleQueueToggle = useCallback(async (strategyId: string, shouldQueue: boolean) => {
    if (!userId) return;

    const strategy = liveStrategies.find(s => s.id === strategyId);
    if (!strategy) return;

    const connectionId = strategyConnections[strategy.id];
    if (!connectionId) {
      toast.error('Please select a broker connection first');
      return;
    }

    const scale = strategyScales[strategy.id] || 1;

    try {
      // Backtest mode: Direct Supabase upsert to multi_strategy_queue table
      if (mode === 'backtest') {
        const client = await getAuthenticatedTradelayoutClient();
        const { error } = await (client as any)
          .from('multi_strategy_queue')
          .upsert({
            user_id: userId,
            strategy_id: strategy.strategyId,
            broker_connection_id: connectionId,
            scale: scale,
            is_active: shouldQueue ? 1 : 0,
            status: 'pending'
          }, {
            onConflict: 'strategy_id,user_id,broker_connection_id'
          });

        if (error) throw error;

        // Reload strategies from table to sync UI
        const { data: updatedData } = await (client as any)
          .from('multi_strategy_queue')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', 1);

        // Transform and update store with fresh data
        const transformedStrategies = (updatedData || []).map((queueEntry: any) => ({
          id: queueEntry.strategy_id,
          strategyId: queueEntry.strategy_id,
          name: queueEntry.name || `Strategy ${queueEntry.strategy_id}`,
          description: queueEntry.description || '',
          status: queueEntry.status || 'ready',
          isLive: false,
          backendSessionId: null,
          pnl: 0,
          selected: true,
          createdAt: queueEntry.created_at,
          updatedAt: queueEntry.updated_at
        }));

        transformedStrategies.forEach(strategy => {
          updateStrategyStatus(strategy.id, strategy.status, false);
        });

        toast.success(shouldQueue ? 'Added to backtest queue' : 'Removed from backtest queue');
        return;
      }

      // Live mode: Use API endpoints
      if (!apiBaseUrl) return;
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

      if (shouldQueue) {
        // Submit to queue
        const response = await fetch(
          `${baseUrl}/api/queue/submit?user_id=${userId}&queue_type=admin_tester`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
              strategies: [{
                strategy_id: strategy.strategyId,
                broker_connection_id: connectionId,
                scale: scale
              }]
            })
          }
        );

        if (response.ok) {
          setQueuedStrategyIds(prev => new Set(prev).add(strategy.strategyId));
          toast.success('Added to queue');
        } else {
          toast.error('Failed to add to queue');
        }
      } else {
        // Remove from queue
        const response = await fetch(
          `${baseUrl}/api/queue/remove/admin_tester/${strategy.strategyId}`,
          {
            method: 'DELETE',
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }
        );

        if (response.ok) {
          setQueuedStrategyIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(strategy.strategyId);
            return newSet;
          });
          toast.success('Removed from queue');
        } else {
          toast.error('Failed to remove from queue');
        }
      }
    } catch (error) {
      console.error('Queue toggle error:', error);
      toast.error('Failed to update queue');
    }
  }, [userId, apiBaseUrl, liveStrategies, strategyConnections, strategyScales, mode]);

  // Load existing data from files (for reconnection)
  const loadExistingData = useCallback(async () => {
    if (!apiBaseUrl || queuedStrategyIds.size === 0) return;
    
    const dateStr = format(backtestDate, 'yyyy-MM-dd');
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    
    console.log('[Stream] Loading existing data from files...');
    
    for (const strategyId of queuedStrategyIds) {
      try {
        // Load trades
        const tradesResponse = await fetch(`${baseUrl}/api/v1/backtest/trades/${strategyId}/${dateStr}`);
        if (tradesResponse.ok) {
          const tradesData = await tradesResponse.json();
          setStreamingTrades(prev => ({
            ...prev,
            [strategyId]: tradesData
          }));
          console.log(`[Stream] Loaded trades for ${strategyId}:`, tradesData.trades?.length || 0);
        }
        
        // Load diagnostics
        const diagnosticsResponse = await fetch(`${baseUrl}/api/v1/backtest/diagnostics/${strategyId}/${dateStr}`);
        if (diagnosticsResponse.ok) {
          const diagnosticsData = await diagnosticsResponse.json();
          setStreamingDiagnostics(prev => ({
            ...prev,
            [strategyId]: diagnosticsData
          }));
          console.log(`[Stream] Loaded diagnostics for ${strategyId}:`, Object.keys(diagnosticsData.events_history || {}).length);
        }
      } catch (error) {
        console.warn(`[Stream] No existing data for ${strategyId}:`, error);
      }
    }
    
    setHasLoadedInitialData(true);
    console.log('[Stream] Initial data load complete');
  }, [apiBaseUrl, activeStrategiesCount, backtestDate]);

  // Execute backtest
  const handleRunBacktest = useCallback(async () => {
    if (!apiBaseUrl || activeStrategiesCount === 0) {
      toast.error('No strategies in queue');
      return;
    }

    setIsExecutingQueue(true);
    setBacktestResults(null);
    setBacktestTickData({});

    try {
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const strategyIds = liveStrategies.filter(s => s.status === 'active').map(s => s.strategyId);
      const dateStr = format(backtestDate, 'yyyy-MM-dd');
      
      const response = await fetch(`${baseUrl}/api/v1/backtest/multi-strategy`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store',  // Prevent browser caching
        body: JSON.stringify({
          strategy_ids: strategyIds,
          backtest_date: dateStr,
        }),
      });

      if (response.ok) {
        const results = await response.json();
        setBacktestResults(results);
        
        // Transform results into tick data format for cards and LiveDataPanel
        // API returns: { strategies: { uuid1: {positions, summary}, uuid2: {...} }, combined_summary: {...} }
        const tickData: Record<string, any> = {};
        if (results.strategies) {
          Object.entries(results.strategies).forEach(([strategyId, strategyResult]: [string, any]) => {
            const positions = strategyResult.positions || [];
            const summary = strategyResult.summary || {};
            
            // Use summary from API if available, otherwise calculate
            const totalPnl = summary.total_pnl ?? positions.reduce((sum: number, p: any) => sum + (parseFloat(p.pnl) || 0), 0);
            const winningTrades = summary.winning_trades ?? positions.filter((p: any) => parseFloat(p.pnl) > 0).length;
            const losingTrades = summary.losing_trades ?? positions.filter((p: any) => parseFloat(p.pnl) < 0).length;
            
            tickData[strategyId] = {
              tickState: {
                pnl_summary: {
                  total_pnl: String(totalPnl),
                  realized_pnl: String(totalPnl),
                  unrealized_pnl: '0.00',
                  closed_trades: positions.length,
                  open_trades: 0,
                },
                open_positions: positions.map((pos: any) => ({
                  position_id: pos.position_id,
                  symbol: pos.symbol || pos.instrument,
                  side: pos.side,
                  quantity: pos.quantity || 1,
                  entry_price: pos.entry_price,
                  exit_price: pos.exit_price,
                  pnl: pos.pnl,
                  status: pos.status || 'CLOSED',
                  entry_time: pos.entry_time || pos.entry_timestamp,
                  exit_time: pos.exit_time || pos.exit_timestamp,
                })),
                ltp_store: {},
                timestamp: new Date().toISOString(),
              },
              summary: {
                total_positions: positions.length,
                total_pnl: totalPnl,
                winning_trades: winningTrades,
                losing_trades: losingTrades,
                win_rate: positions.length > 0 ? ((winningTrades / positions.length) * 100).toFixed(1) : '0',
              }
            };
          });
        }
        console.log('[LiveStrategiesGridV2] Backtest tick data:', tickData);
        setBacktestTickData(tickData);
        
        toast.success(`Backtest completed for ${strategyIds.length} strategies`);
      } else {
        const error = await response.json().catch(() => ({}));
        toast.error(error.detail || 'Backtest failed');
      }
    } catch (error) {
      console.error('Backtest error:', error);
      toast.error('Backtest failed');
    } finally {
      setIsExecutingQueue(false);
    }
  }, [apiBaseUrl, activeStrategiesCount, backtestDate]);

  // Execute streaming backtest (SSE)
  const handleRunBacktestStream = useCallback(async () => {
    if (!apiBaseUrl || activeStrategiesCount === 0) {
      toast.error('No strategies in queue');
      return;
    }

    setIsExecutingQueue(true);
    setBacktestResults(null);
    setBacktestTickData({});
    setStreamingTrades({});
    setStreamingDiagnostics({});
    setHasLoadedInitialData(false);
    
    // Load existing data before starting stream
    await loadExistingData();
    
    setStreamingProgress({
      isStreaming: true,
      currentTimestamp: '',
      progressPct: 0,
      ticksProcessed: 0,
      totalSeconds: 0,
      activeNodes: [],
      positionsCount: 0
    });

    try {
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const dateStr = format(backtestDate, 'yyyy-MM-dd');

      // Use fetch streaming (SSE-style) via POST
      const response = await fetch(`${baseUrl}/api/v1/backtest/stream-live`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          backtest_date: dateStr,
          strategy_ids: Array.from(queuedStrategyIds),
          speed_multiplier: 50,
          emit_interval: 10
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start streaming backtest');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let currentEventType = '';  // Track the current SSE event type
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // Capture the event type from "event:" line
          if (line.startsWith('event:')) {
            currentEventType = line.substring(6).trim();
            continue;
          }
          
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.substring(5).trim());
              // Inject the event type into data for easier handling
              data.type = currentEventType || data.type;
              
              // Handle tick events
              if (data.timestamp) {
                setStreamingProgress(prev => prev ? {
                  ...prev,
                  currentTimestamp: data.timestamp,
                  progressPct: data.progress_pct || 0,
                  ticksProcessed: data.ticks_processed || 0,
                  totalSeconds: data.total_seconds || 0,
                  activeNodes: data.active_nodes || [],
                  positionsCount: data.positions_count || 0
                } : null);

                // Update tick data for each strategy - iterate over ACTUAL keys from backend response
                const strategyData = data.strategy_data || {};
                console.log('[Stream] Received strategy_data keys:', Object.keys(strategyData));
                console.log('[Stream] queuedStrategyIds:', Array.from(queuedStrategyIds));
                
                // Iterate over actual response keys, not queuedStrategyIds (they may differ)
                Object.entries(strategyData).forEach(([strategyId, stratData]: [string, any]) => {
                  const pnlData = stratData.pnl_summary || {};
                  const positions = stratData.positions || {};
                  const ltpStore = stratData.ltp_store || {};
                  const trades = stratData.trades || [];
                  
                  console.log(`[Stream] Strategy ${strategyId}: LTP=${Object.keys(ltpStore).length}, Positions=${Object.keys(positions).length}, Trades=${trades.length}`);
                  
                  setBacktestTickData(prev => ({
                    ...prev,
                    [strategyId]: {
                      ...prev[strategyId],
                      tickState: {
                        pnl_summary: {
                          total_pnl: String(pnlData.total_pnl || 0),
                          realized_pnl: String(pnlData.realized_pnl || 0),
                          unrealized_pnl: String(pnlData.unrealized_pnl || 0),
                          closed_trades: pnlData.closed_positions || 0,
                          open_trades: pnlData.open_positions || 0,
                        },
                        positions: positions,
                        open_positions: Object.values(positions),
                        ltp_store: ltpStore,
                        timestamp: data.timestamp
                      }
                    }
                  }));

                  // Update streaming trades for modal - include diagnostics WITH trades
                  // Diagnostics are sent along with trades (trades are derivatives of diagnostics)
                  const diagnosticsData = stratData.diagnostics || { events_history: {} };
                  
                  setStreamingTrades(prev => ({
                    ...prev,
                    [strategyId]: {
                      date: dateStr,
                      summary: {
                        total_trades: (pnlData.closed_positions || 0) + (pnlData.open_positions || 0),
                        total_pnl: String(pnlData.total_pnl || 0),
                        realized_pnl: String(pnlData.realized_pnl || 0),
                        unrealized_pnl: String(pnlData.unrealized_pnl || 0),
                        winning_trades: pnlData.winning_trades || 0,
                        losing_trades: pnlData.losing_trades || 0,
                      },
                      trades: trades,
                      diagnostics: diagnosticsData
                    }
                  }));
                });
              }

              // Handle node_event - capture trades and diagnostics when node logic completes
              if (data.type === 'node_event') {
                const eventData = data;
                const stratId = eventData.queue_id || eventData.strategy_id;
                const newTrades = eventData.trades || [];
                const diagnosticsData = eventData.diagnostics || { events_history: {} };
                
                console.log(`[Stream] node_event for ${stratId}:`, {
                  nodeType: eventData.node_type,
                  tradesCount: newTrades.length,
                  eventsHistoryCount: Object.keys(diagnosticsData.events_history || {}).length
                });
                
                if (stratId && newTrades.length > 0) {
                  // Merge with existing data
                  setStreamingTrades(prev => {
                    const existing = prev[stratId] || { trades: [], summary: { total_trades: 0, total_pnl: '0', realized_pnl: '0', unrealized_pnl: '0', winning_trades: 0, losing_trades: 0 } };
                    const allTrades = [...(existing.trades || []), ...newTrades];
                    
                    // Calculate summary from all trades
                    const closedTrades = allTrades.filter((t: any) => t.status === 'CLOSED');
                    const realizedPnl = closedTrades.reduce((sum: number, t: any) => sum + parseFloat(t.pnl || 0), 0);
                    const unrealizedPnl = allTrades.filter((t: any) => t.status === 'OPEN').reduce((sum: number, t: any) => sum + parseFloat(t.unrealized_pnl || 0), 0);
                    const winningTrades = closedTrades.filter((t: any) => parseFloat(t.pnl || 0) > 0).length;
                    const losingTrades = closedTrades.filter((t: any) => parseFloat(t.pnl || 0) <= 0).length;
                    
                    return {
                      ...prev,
                      [stratId]: {
                        date: dateStr,
                        summary: {
                          total_trades: allTrades.length,
                          total_pnl: String(realizedPnl + unrealizedPnl),
                          realized_pnl: String(realizedPnl),
                          unrealized_pnl: String(unrealizedPnl),
                          winning_trades: winningTrades,
                          losing_trades: losingTrades,
                        },
                        trades: allTrades,
                        diagnostics: diagnosticsData
                      }
                    };
                  });
                }
              }

              // Handle complete event - capture final diagnostics with events_history
              if (data.type === 'complete') {
                console.log('[Stream] Complete event received:', data);
                setStreamingProgress(prev => prev ? { ...prev, isStreaming: false } : null);
                
                // Extract strategy_results - data is directly the payload (not nested under data.data)
                // because API sends: event.get('data', {}) which is the inner data object
                const strategyResults = data.strategy_results || {};
                console.log('[Stream Complete] 🔍 Raw strategy_results:', {
                  keys: Object.keys(strategyResults),
                  fullData: strategyResults
                });
                
                Object.entries(strategyResults).forEach(([strategyId, result]: [string, any]) => {
                  const diagnosticsExport = result?.diagnostics_export || { events_history: {} };
                  const tradesDaily = result?.trades_daily;
                  
                  console.log(`[Stream Complete] Strategy ${strategyId}:`, {
                    eventsHistoryKeys: Object.keys(diagnosticsExport.events_history || {}).length,
                    sampleEventKeys: Object.keys(diagnosticsExport.events_history || {}).slice(0, 3),
                    hasDiagnosticsExport: !!result?.diagnostics_export,
                    hasTradesDaily: !!tradesDaily
                  });
                  
                  // Update streamingTrades with final trades and diagnostics
                  setStreamingTrades(prev => ({
                    ...prev,
                    [strategyId]: {
                      ...prev[strategyId],
                      date: tradesDaily?.date || prev[strategyId]?.date,
                      summary: tradesDaily?.summary || prev[strategyId]?.summary,
                      trades: tradesDaily?.trades || prev[strategyId]?.trades || [],
                      diagnostics: diagnosticsExport
                    }
                  }));
                });
              }
            } catch (e) {
              console.warn('[Stream] Parse error:', e);
            }
          }
        }
      }

      toast.success('Streaming backtest completed');
    } catch (error) {
      console.error('Streaming backtest error:', error);
      toast.error('Streaming backtest failed');
    } finally {
      setIsExecutingQueue(false);
      setStreamingProgress(prev => prev ? { ...prev, isStreaming: false } : null);
    }
  }, [apiBaseUrl, activeStrategiesCount, backtestDate]);

  // Execute queue (live trading)
  const handleStartAll = useCallback(async () => {
    // If in backtest mode, run backtest instead
    if (mode === 'backtest') {
      return handleRunBacktest();
    }

    if (!userId || !apiBaseUrl || activeStrategiesCount === 0) {
      toast.error('No strategies in queue');
      return;
    }

    setIsExecutingQueue(true);

    try {
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const response = await fetch(
        `${baseUrl}/api/queue/execute?queue_type=admin_tester&trigger_type=manual`,
        {
          method: 'POST',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('[Execute] Backend response:', result);
        
        // Extract session IDs from result.started array
        const startedSessions = result.started || [];
        
        // Create a map of strategy_id -> session_id
        const sessionIdMap = new Map<string, string>();
        startedSessions.forEach((session: any) => {
          sessionIdMap.set(session.strategy_id, session.session_id);
        });
        
        console.log('[Execute] Session ID map:', Object.fromEntries(sessionIdMap));

        // Update strategies as active
        liveStrategies.forEach(strategy => {
          const backendSessionId = sessionIdMap.get(strategy.strategyId);
          console.log(`[Execute] Setting ${strategy.name} -> sessionId: ${backendSessionId}`);
          updateStrategyStatus(strategy.id, 'active', true, backendSessionId);
        });

        setTradingStatus('running');
        // Polling starts automatically when tradingStatus changes to 'running'

        toast.success(`Started ${activeStrategiesCount} strategies`);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to execute queue');
      }
    } catch (error) {
      console.error('Execute queue error:', error);
      toast.error('Failed to start execution');
    } finally {
      setIsExecutingQueue(false);
    }
  }, [userId, apiBaseUrl, activeStrategiesCount, liveStrategies, updateStrategyStatus, setTradingStatus]);

  // Stop all
  const handleStopAll = useCallback(() => {
    liveStrategies.forEach(strategy => {
      if (strategy.isLive) {
        updateStrategyStatus(strategy.id, 'inactive', false);
      }
    });
    setTradingStatus('idle');
    disconnectPolling();
    toast.info('Stopped all strategies');
  }, [liveStrategies, updateStrategyStatus, setTradingStatus, disconnectPolling]);

  // Clear queue
  const handleClearQueue = useCallback(async () => {
    if (!userId || !apiBaseUrl) return;

    try {
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const response = await fetch(
        `${baseUrl}/api/queue/clear/admin_tester`,
        {
          method: 'DELETE',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }
      );

      if (response.ok) {
        setQueuedStrategyIds(new Set());
        toast.success('Queue cleared');
      }
    } catch (error) {
      console.error('Clear queue error:', error);
      toast.error('Failed to clear queue');
    }
  }, [userId, apiBaseUrl]);

  const activeSessionCount = liveStrategies.filter(s => s.isLive).length;
  const selectedStrategy = liveStrategies.find(s => s.id === selectedStrategyForTrades);

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Mode Toggle & Queue Controls */}
        <Card>
          <CardContent className="p-4">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between mb-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'live' | 'backtest')}>
                <TabsList>
                  <TabsTrigger value="live" className="gap-2">
                    <Activity className="h-4 w-4" />
                    Live Trade
                  </TabsTrigger>
                  <TabsTrigger value="backtest" className="gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Backtest
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Date Picker for Backtest Mode */}
              {mode === 'backtest' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal",
                        !backtestDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {backtestDate ? format(backtestDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={backtestDate}
                      onSelect={(date) => date && setBacktestDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Queue: {activeStrategiesCount} strategies
                </span>
                {liveStrategies.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    (Check strategies to add to queue)
                  </span>
                )}
                {/* Streaming timestamp display */}
                {streamingProgress?.isStreaming && streamingProgress.currentTimestamp && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                    <span className="text-sm font-mono text-blue-700 dark:text-blue-400">
                      {new Date(streamingProgress.currentTimestamp).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit',
                        hour12: false 
                      })}
                    </span>
                    <span className="text-xs text-blue-600">
                      {streamingProgress.progressPct.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {mode === 'live' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/app/sse-test')}
                    className="gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    SSE Test
                  </Button>
                )}

                {queuedStrategyIds.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearQueue}
                    disabled={tradingStatus === 'running'}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear Queue
                  </Button>
                )}

                {mode === 'backtest' ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRunBacktest}
                      disabled={activeStrategiesCount === 0 || isExecutingQueue}
                      size="sm"
                      variant="outline"
                    >
                      <FlaskConical className="h-4 w-4 mr-1" />
                      Backtest ({activeStrategiesCount})
                    </Button>
                    <Button
                      onClick={handleRunBacktestStream}
                      disabled={activeStrategiesCount === 0 || isExecutingQueue}
                      size="sm"
                    >
                      {streamingProgress?.isStreaming ? (
                        <>
                          <Activity className="h-4 w-4 mr-1 animate-pulse" />
                          {streamingProgress.progressPct.toFixed(0)}%
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Stream ({activeStrategiesCount})
                        </>
                      )}
                    </Button>
                  </div>
                ) : tradingStatus === 'idle' ? (
                  <Button
                    onClick={handleStartAll}
                    disabled={activeStrategiesCount === 0 || isExecutingQueue}
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start All ({activeStrategiesCount})
                  </Button>
                ) : (
                  activeSessionCount > 0 && (
                    <Button
                      onClick={handleStopAll}
                      variant="destructive"
                      size="sm"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Stop All
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Status indicator */}
            {tradingStatus === 'running' && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-600 font-medium">LIVE</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">
                  {activeSessionCount} active {activeSessionCount === 1 ? 'strategy' : 'strategies'}
                </span>
                {isPolling && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-xs text-muted-foreground">HTTP Polling Active</span>
                  </>
                )}
              </div>
            )}

            {/* Backtest Results Summary */}
            {mode === 'backtest' && backtestResults && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Backtest Results - {backtestResults.backtest_date}</h4>
                  <Button variant="ghost" size="sm" onClick={() => setBacktestResults(null)}>
                    Clear
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{backtestResults.combined_summary?.total_positions || 0}</div>
                    <div className="text-muted-foreground">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-2xl font-bold",
                      (backtestResults.combined_summary?.combined_pnl || 0) >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      ₹{(backtestResults.combined_summary?.combined_pnl || 0).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Total P&L</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{backtestResults.combined_summary?.win_rate?.toFixed(1) || 0}%</div>
                    <div className="text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      <span className="text-green-600">{backtestResults.combined_summary?.winning_trades || 0}</span>
                      /
                      <span className="text-red-600">{backtestResults.combined_summary?.losing_trades || 0}</span>
                    </div>
                    <div className="text-muted-foreground">Win/Loss</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategies Grid */}
        {liveStrategies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Strategies Added</h3>
              <p className="text-muted-foreground">
                Click "Go Live" on strategies from the dashboard to add them here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveStrategies.map(strategy => {
              const connectionId = strategyConnections[strategy.id];
              const isQueued = strategy.status === 'active'; // Based on is_active column
              const scale = strategyScales[strategy.id] || 1;
              
              // Extract tick data for card display - use backtest data or live SSE data
              let tickData: LiveTickDataForCard | null = null;
              
              // Debug: log what we're looking for and available data
              const availableKeys = Object.keys(backtestTickData);
              const foundKey = availableKeys.find(k => k === strategy.strategyId);
              console.log(`[Card] Strategy ${strategy.name}:`);
              console.log(`   Looking for: ${strategy.strategyId}`);
              console.log(`   Available keys: ${availableKeys.length > 0 ? availableKeys.map(k => k.slice(0, 20) + '...').join(', ') : 'NONE'}`);
              console.log(`   Found: ${foundKey ? 'YES' : 'NO'}`);
              
              if (mode === 'backtest' && backtestTickData[strategy.strategyId]) {
                // Backtest mode: use backtest results
                const btData = backtestTickData[strategy.strategyId];
                console.log(`   ✅ Data: LTP=${Object.keys(btData.tickState?.ltp_store || {}).length}, Positions=${(btData.tickState?.open_positions || []).length}`);
                tickData = {
                  pnl_summary: btData.tickState?.pnl_summary,
                  progress: { ticks_processed: 100, total_ticks: 100 },
                  ltp_store: btData.tickState?.ltp_store,
                  open_positions: btData.tickState?.open_positions,
                  last_update: btData.tickState?.timestamp,
                  timestamp: btData.tickState?.timestamp
                };
              } else if (strategy.backendSessionId && sessionTicks[strategy.backendSessionId]) {
                // Live mode: use SSE data
                const sseData = sessionTicks[strategy.backendSessionId];
                tickData = {
                  pnl_summary: sseData.tickState?.pnl_summary,
                  progress: sseData.tickState?.progress,
                  ltp_store: sseData.tickState?.ltp_store,
                  open_positions: sseData.tickState?.open_positions,
                  last_update: sseData.lastUpdate,
                  timestamp: sseData.tickState?.timestamp
                };
              }

              return (
                <LiveStrategyCardV2
                  key={strategy.id}
                  strategy={strategy}
                  connectionId={connectionId}
                  brokerConnections={brokerConnections}
                  existingCombinations={getExistingCombinations(strategy.id)}
                  userId={userId}
                  apiBaseUrl={apiBaseUrl}
                  liveTickData={tickData}
                  isQueued={isQueued}
                  canQueue={tradingStatus === 'idle' || mode === 'backtest'}
                  scale={scale}
                  mode={mode}
                  onConnectionChange={assignConnection}
                  onQueueToggle={handleQueueToggle}
                  onScaleChange={(id, newScale) => setStrategyScales(prev => ({ ...prev, [id]: newScale }))}
                  onViewTrades={setSelectedStrategyForTrades}
                  onRemove={handleRemoveStrategy}
                />
              );
            })}
          </div>
        )}

        {/* View Trades Modal */}
        {selectedStrategyForTrades && selectedStrategy && (
          <ViewTradesModalV2
            strategy={selectedStrategy}
            userId={userId}
            connectionId={strategyConnections[selectedStrategy.id]}
            apiBaseUrl={apiBaseUrl}
            onClose={() => setSelectedStrategyForTrades(null)}
            mode={mode}
            backtestDate={mode === 'backtest' ? format(backtestDate, 'yyyy-MM-dd') : undefined}
            streamingTradesData={(() => {
              if (mode !== 'backtest') return null;
              const data = streamingTrades[selectedStrategy.strategyId];
              if (!data) {
                console.error('[LiveStrategiesGridV2] ❌ Streaming data NOT FOUND!', {
                  lookupKey: selectedStrategy.strategyId,
                  availableKeys: Object.keys(streamingTrades),
                  selectedStrategyId: selectedStrategy.id,
                  selectedStrategyName: selectedStrategy.name
                });
              }
              return data;
            })()}
            cachedBacktestResults={mode === 'backtest' ? backtestResults : undefined}
          />
        )}
      </div>

      {/* Live Data Panel - Right Side */}
      <LiveDataPanel 
        sessionTicks={mode === 'backtest' ? backtestTickData : sessionTicks}
        brokerConnections={brokerConnections}
        strategies={liveStrategies}
        mode={mode}
        isExpanded={isDataPanelExpanded}
        onExpandToggle={() => setIsDataPanelExpanded(prev => !prev)}
      />
    </div>
  );
};
