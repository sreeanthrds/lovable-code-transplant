import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, Clock, TrendingUp, CheckCircle, FlaskConical } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useSessionStatus } from '@/hooks/use-session-status';
import { useSessionDataPolling } from '@/hooks/use-session-data-polling';
import BacktestReport from '@/components/backtest-report/BacktestReport';
import type { TradesDaily, DiagnosticsExport } from '@/types/backtest';

interface ViewTradesModalV2Props {
  strategy: {
    id: string;
    strategyId: string;
    name: string;
    description: string;
  } | null;
  userId: string | null;
  connectionId?: string;
  apiBaseUrl: string | null;
  onClose: () => void;
  // Backtest mode props
  mode?: 'live' | 'backtest';
  backtestDate?: string; // YYYY-MM-DD format for backtest mode
  // Streaming data - passed from parent to avoid re-fetching
  streamingTradesData?: {
    date: string;
    summary: {
      total_trades: number;
      total_pnl: string;
      realized_pnl: string;
      unrealized_pnl: string;
      winning_trades: number;
      losing_trades: number;
    };
    trades: any[];
    diagnostics?: {
      events_history: Record<string, any>;
    };
  } | null;
  // Cached backtest results - passed from parent to avoid re-running backtest
  cachedBacktestResults?: any;
}

export const ViewTradesModalV2: React.FC<ViewTradesModalV2Props> = ({
  strategy,
  userId,
  connectionId,
  apiBaseUrl,
  onClose,
  mode = 'live',
  backtestDate,
  streamingTradesData,
  cachedBacktestResults
}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Backtest mode state
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestTrades, setBacktestTrades] = useState<TradesDaily | null>(null);
  const [backtestDiagnostics, setBacktestDiagnostics] = useState<DiagnosticsExport | null>(null);
  const [backtestError, setBacktestError] = useState<string | null>(null);

  // Get session status
  const sessionStatus = useSessionStatus(
    userId,
    strategy?.strategyId || '',
    connectionId,
    apiBaseUrl,
    refreshTrigger
  );

  // Poll session data files when modal is open (heartbeat mechanism)
  const pollingEnabled = sessionStatus.status === 'running' || sessionStatus.status === 'completed';
  
  console.log('🔵 [ViewTradesModalV2] Polling config:', {
    session_id: sessionStatus.session_id,
    status: sessionStatus.status,
    pollingEnabled,
    apiBaseUrl
  });
  
  const sessionDataPolling = useSessionDataPolling(
    sessionStatus.session_id,
    apiBaseUrl,
    pollingEnabled
  );

  // Log when modal opens and data changes
  useEffect(() => {
    console.log('🔴 [ViewTradesModalV2] Modal state changed:', {
      session_id: sessionStatus.session_id,
      status: sessionStatus.status,
      has_trades: !!sessionDataPolling.trades,
      has_diagnostics: !!sessionDataPolling.diagnostics,
      trades_count: sessionDataPolling.trades?.trades?.length || 0,
      diagnostics_count: sessionDataPolling.diagnostics?.events_history ? Object.keys(sessionDataPolling.diagnostics.events_history).length : 0
    });
  }, [sessionStatus.session_id, sessionDataPolling.trades, sessionDataPolling.diagnostics]);

  // Auto-refresh status every 2 seconds when queued
  useEffect(() => {
    if (sessionStatus.status === 'queued') {
      const interval = setInterval(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [sessionStatus.status]);

  // Load backtest data when in backtest mode - USE cached results or streaming data if available
  useEffect(() => {
    if (mode !== 'backtest' || !strategy || !backtestDate) return;

    // Priority 1: If streaming data is provided, use it directly - no API call needed!
    if (streamingTradesData) {
      console.log('[ViewTradesModalV2] Using streaming trades data:', streamingTradesData);
      
      const tradesDaily: TradesDaily = {
        date: streamingTradesData.date,
        summary: {
          total_trades: streamingTradesData.summary.total_trades,
          total_pnl: streamingTradesData.summary.total_pnl,
          winning_trades: streamingTradesData.summary.winning_trades,
          losing_trades: streamingTradesData.summary.losing_trades,
          win_rate: streamingTradesData.summary.total_trades > 0 
            ? String(((streamingTradesData.summary.winning_trades / streamingTradesData.summary.total_trades) * 100).toFixed(1))
            : '0',
          // Add realized/unrealized for display
          realized_pnl: streamingTradesData.summary.realized_pnl,
          unrealized_pnl: streamingTradesData.summary.unrealized_pnl,
        },
        trades: streamingTradesData.trades.map((trade: any) => ({
          trade_id: trade.trade_id,
          position_id: trade.position_id,
          re_entry_num: trade.re_entry_num || 0,
          symbol: trade.symbol,
          side: trade.side,
          quantity: trade.quantity || 1,
          actual_quantity: trade.quantity || 1,
          multiplier: trade.lot_size || 1,
          qty_closed: trade.status === 'CLOSED' ? (trade.quantity || 1) : 0,
          entry_price: String(trade.entry_price || 0),
          entry_time: trade.entry_time,
          exit_price: trade.exit_price ? String(trade.exit_price) : null,
          exit_time: trade.exit_time || null,
          pnl: String(trade.pnl || 0),
          pnl_percent: String(trade.pnl_percent || 0),
          unrealized_pnl: trade.unrealized_pnl ? String(trade.unrealized_pnl) : null,
          duration_minutes: trade.duration_minutes || 0,
          status: trade.status || 'OPEN',
          entry_flow_ids: trade.entry_flow_ids || [],
          exit_flow_ids: trade.exit_flow_ids || [],
          entry_trigger: trade.entry_trigger || '',
          exit_reason: trade.exit_reason || null,
        })),
      };

      setBacktestTrades(tradesDaily);
      // Use diagnostics from streaming data if available, otherwise empty
      // Handle potential structure variations in diagnostics data
      let diagnostics = streamingTradesData.diagnostics || { events_history: {} };
      
      // Ensure events_history exists and is properly structured
      if (!diagnostics.events_history && typeof diagnostics === 'object') {
        // Check if diagnostics itself is the events_history
        const sampleKey = Object.keys(diagnostics)[0];
        const sampleValue = sampleKey ? (diagnostics as any)[sampleKey] : null;
        if (sampleValue && typeof sampleValue === 'object' && 'execution_id' in sampleValue) {
          console.log('[ViewTradesModalV2] Diagnostics appears to be events_history at root, wrapping');
          diagnostics = { events_history: diagnostics as any };
        }
      }
      
      const eventsHistoryKeys = Object.keys(diagnostics.events_history || {});
      console.log('[ViewTradesModalV2] Streaming diagnostics structure:', {
        hasEventsHistory: 'events_history' in diagnostics,
        eventsHistoryCount: eventsHistoryKeys.length,
        sampleKeys: eventsHistoryKeys.slice(0, 5),
        rawDiagnosticsKeys: Object.keys(streamingTradesData.diagnostics || {})
      });
      
      // Log sample trade flow IDs for comparison
      if (streamingTradesData.trades?.length > 0) {
        const firstTrade = streamingTradesData.trades[0];
        console.log('[ViewTradesModalV2] Sample trade flow IDs:', {
          entry_flow_ids: firstTrade.entry_flow_ids?.slice(0, 3),
          exit_flow_ids: firstTrade.exit_flow_ids?.slice(0, 3)
        });
      }
      
      setBacktestDiagnostics(diagnostics);
      setBacktestLoading(false);
      return;
    }

    // Priority 2: If cached backtest results are provided, use them
    if (cachedBacktestResults && cachedBacktestResults.strategies) {
      console.log('[ViewTradesModalV2] Using cached backtest results:', cachedBacktestResults);
      
      const strategyData = cachedBacktestResults.strategies[strategy.strategyId];
      if (strategyData) {
        const positions = strategyData.positions || [];
        const summary = strategyData.summary || {};
        
        const tradesDaily: TradesDaily = {
          date: cachedBacktestResults.backtest_date || backtestDate,
          summary: {
            total_trades: summary.total_positions || positions.length,
            total_pnl: String(summary.total_pnl || 0),
            winning_trades: summary.winning_trades || 0,
            losing_trades: summary.losing_trades || 0,
            win_rate: String(summary.win_rate || 0),
            realized_pnl: String(summary.realized_pnl || summary.total_pnl || 0),
            unrealized_pnl: String(summary.unrealized_pnl || 0),
          },
          trades: positions.map((pos: any) => ({
            trade_id: pos.position_id,
            position_id: pos.position_id,
            re_entry_num: pos.re_entry_num || 0,
            symbol: pos.symbol || pos.instrument,
            side: pos.side,
            quantity: pos.quantity || 1,
            actual_quantity: pos.quantity || 1,
            multiplier: pos.lot_size || 1,
            qty_closed: pos.status === 'CLOSED' ? (pos.quantity || 1) : 0,
            entry_price: String(pos.entry_price || 0),
            entry_time: pos.entry_time || pos.entry_timestamp,
            exit_price: pos.exit_price ? String(pos.exit_price) : null,
            exit_time: pos.exit_time || pos.exit_timestamp || null,
            pnl: String(pos.pnl || 0),
            pnl_percent: String(pos.pnl_percentage || 0),
            unrealized_pnl: null,
            duration_minutes: pos.duration_minutes || 0,
            status: pos.status || 'CLOSED',
            entry_flow_ids: pos.entry_flow_ids || [],
            exit_flow_ids: pos.exit_flow_ids || [],
            entry_trigger: pos.entry_node_id || '',
            exit_reason: pos.exit_reason || null,
          })),
        };

        const diagnostics = strategyData.diagnostics || { events_history: {} };
        setBacktestTrades(tradesDaily);
        setBacktestDiagnostics(diagnostics);
        setBacktestLoading(false);
        return;
      }
    }

    // Priority 3: Only fetch from API if no cached results or streaming data provided
    // VALIDATION: If we reach here but streaming/cached data was expected, log error
    console.error('[ViewTradesModalV2] ⚠️ WARNING: No streaming or cached data found!', {
      strategyId: strategy.strategyId,
      strategyName: strategy.name,
      hasStreamingData: !!streamingTradesData,
      hasCachedResults: !!cachedBacktestResults,
      message: 'Falling back to API call - this may indicate an ID mismatch issue'
    });
    
    if (!apiBaseUrl) return;

    const loadBacktestData = async () => {
      setBacktestLoading(true);
      setBacktestError(null);
      setBacktestTrades(null);
      setBacktestDiagnostics(null);

      try {
        const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        
        console.warn(`[ViewTradesModalV2] 🔴 Calling backtest API for strategy ${strategy.strategyId} - this should NOT happen if streaming backtest was run!`);
        
        const response = await fetch(`${baseUrl}/api/v1/backtest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strategy_id: strategy.strategyId,
            start_date: backtestDate,
            end_date: backtestDate,
            include_diagnostics: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.data?.daily_results?.[0]) {
          const dayResult = data.data.daily_results[0];

          // Transform to TradesDaily format
          const tradesDaily: TradesDaily = {
            date: dayResult.date,
            summary: {
              total_trades: dayResult.summary?.total_positions || 0,
              total_pnl: String(dayResult.summary?.total_pnl || 0),
              winning_trades: dayResult.summary?.winning_trades || 0,
              losing_trades: dayResult.summary?.losing_trades || 0,
              win_rate: String(dayResult.summary?.win_rate || 0),
            },
            trades: dayResult.positions?.map((pos: any) => ({
              trade_id: pos.position_id,
              position_id: pos.position_id,
              re_entry_num: pos.re_entry_num || 0,
              symbol: pos.symbol || pos.instrument,
              side: pos.side,
              quantity: pos.quantity || 1,
              actual_quantity: pos.quantity || 1,
              multiplier: pos.lot_size || 1,
              qty_closed: pos.status === 'CLOSED' ? (pos.quantity || 1) : 0,
              entry_price: String(pos.entry_price || 0),
              entry_time: pos.entry_time || pos.entry_timestamp,
              exit_price: pos.exit_price ? String(pos.exit_price) : null,
              exit_time: pos.exit_time || pos.exit_timestamp || null,
              pnl: String(pos.pnl || 0),
              pnl_percent: String(pos.pnl_percentage || 0),
              unrealized_pnl: null,
              duration_minutes: pos.duration_minutes || 0,
              status: pos.status || 'CLOSED',
              entry_flow_ids: pos.entry_flow_ids || [],
              exit_flow_ids: pos.exit_flow_ids || [],
              entry_trigger: pos.entry_node_id || '',
              exit_reason: pos.exit_reason || null,
            })) || [],
          };

          const diagnostics = dayResult.diagnostics || { events_history: {} };
          setBacktestTrades(tradesDaily);
          setBacktestDiagnostics(diagnostics);
        } else {
          setBacktestError('No backtest data available for this date');
        }
      } catch (error) {
        console.error('Error loading backtest data:', error);
        setBacktestError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setBacktestLoading(false);
      }
    };

    loadBacktestData();
  }, [mode, strategy, backtestDate, apiBaseUrl, streamingTradesData, cachedBacktestResults]);

  if (!strategy) return null;

  const renderContent = () => {
    // BACKTEST MODE - Show backtest report directly
    if (mode === 'backtest') {
      if (backtestLoading) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading backtest data...</p>
            </div>
          </div>
        );
      }

      if (backtestError) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Error Loading Backtest</h3>
            <p className="text-muted-foreground max-w-md">{backtestError}</p>
          </div>
        );
      }

      if (backtestTrades) {
        return (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-muted/30 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold">{strategy.name}</h2>
                <p className="text-sm text-muted-foreground">Backtest Report - {backtestDate}</p>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <FlaskConical className="h-3 w-3 mr-1" />
                BACKTEST
              </Badge>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4">
              <BacktestReport 
                externalTradesData={backtestTrades}
                externalDiagnosticsData={backtestDiagnostics}
              />
            </div>
          </div>
        );
      }

      return null;
    }

    // LIVE MODE - State 1: NOT SUBMITTED
    if (sessionStatus.status === 'not_submitted') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Strategy Not Submitted</h3>
          <p className="text-muted-foreground max-w-md">
            This strategy has not been submitted to the queue for execution.
          </p>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md">
            <p className="text-sm">
              <strong>To view trades:</strong>
            </p>
            <ol className="text-sm text-left mt-2 space-y-1 list-decimal list-inside">
              <li>Ensure the strategy is marked as READY</li>
              <li>Check the "Submit to queue" checkbox on the strategy card</li>
              <li>Click "Start All" to begin execution</li>
            </ol>
          </div>
        </div>
      );
    }

    // State 2: QUEUED (Waiting)
    if (sessionStatus.status === 'queued') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Waiting for Execution</h3>
          <Badge variant="outline" className="mb-4">Status: Queued</Badge>
          <p className="text-muted-foreground max-w-md mb-6">
            This strategy is queued and ready for execution. Click "Start All" to begin processing.
          </p>
          <div className="p-4 bg-muted/50 rounded-lg max-w-md">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Strategy:</span>
                <span className="font-medium">{strategy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session ID:</span>
                <span className="font-mono text-xs">{sessionStatus.session_id}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // State 3 & 4: RUNNING or COMPLETED
    if (sessionStatus.status === 'running' || sessionStatus.status === 'completed') {
      return (
        <div className="h-full flex flex-col">
          {/* Header with status */}
          <div className="flex items-center gap-3 p-4 border-b bg-muted/30 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold">{strategy.name}</h2>
              <p className="text-sm text-muted-foreground">Live Trading Report</p>
            </div>
            {sessionStatus.status === 'running' ? (
              <Badge variant="default" className="bg-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                RUNNING
              </Badge>
            ) : (
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                COMPLETED
              </Badge>
            )}
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4">
            <BacktestReport 
              key={`${sessionStatus.session_id}-${sessionDataPolling.dataVersion}`}
              externalTradesData={sessionDataPolling.trades}
              externalDiagnosticsData={sessionDataPolling.diagnostics}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 flex flex-col overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{strategy.name} - Trading Report</DialogTitle>
        </VisuallyHidden>
        {sessionStatus.loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading session status...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </DialogContent>
    </Dialog>
  );
};
