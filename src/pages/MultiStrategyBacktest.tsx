import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useToast } from '@/hooks/use-toast';
import { strategyService } from '@/lib/supabase/services/strategy-service';
import { cn } from '@/lib/utils';
import { 
  Calendar as CalendarIcon, 
  Loader2, 
  Play, 
  TrendingUp, 
  TrendingDown,
  Target,
  Layers,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-config';
import BacktestReport from '@/components/backtest-report/BacktestReport';
import type { TradesDaily, DiagnosticsExport } from '@/types/backtest';
import { getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';

interface QueuedStrategy {
  id: string;
  strategy_id: string;
  user_id: string;
  broker_connection_id: string;
  scale: number;
  is_active: number;
  status: string;
}

interface Strategy {
  id: string;
  name: string;
  description?: string;
}

interface StrategyResult {
  strategy_id: string;
  positions: any[];
  diagnostics: any;
  summary: {
    total_positions: number;
    closed_positions: number;
    open_positions: number;
    total_pnl: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    avg_win: number;
    avg_loss: number;
  };
}

interface MultiStrategyResults {
  backtest_date: string;
  strategies: Record<string, StrategyResult>;
  combined_summary: {
    strategy_count: number;
    total_positions: number;
    closed_positions: number;
    open_positions: number;
    combined_pnl: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
  };
}

// Transform strategy result to TradesDaily format for BacktestReport
const transformToTradesDaily = (strategyResult: StrategyResult, backtest_date: string): TradesDaily => {
  const trades = strategyResult.positions.map((pos, idx) => ({
    trade_id: pos.position_id || `trade-${idx}`,
    position_id: pos.position_id || `pos-${idx}`,
    re_entry_num: pos.re_entry_num || 0,
    symbol: pos.symbol || pos.instrument || '',
    side: pos.side || 'buy',
    quantity: pos.quantity || 1,
    actual_quantity: pos.quantity || 1,
    multiplier: pos.lot_size || 1,
    qty_closed: pos.status === 'CLOSED' ? (pos.quantity || 1) : 0,
    entry_price: String(pos.entry_price || 0),
    entry_time: pos.entry_time || pos.entry_timestamp || '',
    exit_price: pos.exit_price ? String(pos.exit_price) : null,
    exit_time: pos.exit_time || pos.exit_timestamp || null,
    pnl: String(pos.pnl || 0),
    pnl_percent: String(pos.pnl_percentage || 0),
    unrealized_pnl: null,
    duration_minutes: pos.duration_minutes || 0,
    status: (pos.status || 'CLOSED') as 'OPEN' | 'PARTIAL' | 'CLOSED',
    entry_flow_ids: pos.entry_flow_ids || [],
    exit_flow_ids: pos.exit_flow_ids || [],
    entry_trigger: pos.entry_node_id || '',
    exit_reason: pos.exit_reason || null,
  }));

  return {
    date: backtest_date,
    summary: {
      total_trades: strategyResult.summary.total_positions,
      total_pnl: String(strategyResult.summary.total_pnl),
      winning_trades: strategyResult.summary.winning_trades,
      losing_trades: strategyResult.summary.losing_trades,
      win_rate: String(strategyResult.summary.win_rate),
    },
    trades,
  };
};

const MultiStrategyBacktest = () => {
  const { userId, isAuthenticated } = useClerkUser();
  const { toast } = useToast();
  
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2024, 9, 1)); // Oct 1, 2024
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<MultiStrategyResults | null>(null);
  const [selectedStrategyForReport, setSelectedStrategyForReport] = useState<{id: string, name: string} | null>(null);
  const [detailedReportData, setDetailedReportData] = useState<{tradesDaily: TradesDaily, diagnostics: DiagnosticsExport} | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [queuedStrategies, setQueuedStrategies] = useState<QueuedStrategy[]>([]);

  const DEFAULT_BROKER_ID = '11111111-2222-3333-4444-555555555555';

  // Load strategies and queue on mount
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadStrategies();
      loadQueuedStrategies();
    }
  }, [isAuthenticated, userId]);

  // Load queued strategies from Supabase
  const loadQueuedStrategies = async () => {
    if (!userId) return;
    try {
      const client = await getAuthenticatedTradelayoutClient();
      // Use 'as any' since multi_strategy_queue is a new table not in types yet
      const { data, error } = await (client as any)
        .from('multi_strategy_queue')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      setQueuedStrategies((data as QueuedStrategy[]) || []);
      
      // Set selected strategies based on queued items
      const activeIds = ((data as QueuedStrategy[]) || [])
        .filter((q) => q.is_active === 1)
        .map((q) => q.strategy_id);
      setSelectedStrategies(activeIds);
    } catch (error) {
      console.error('Error loading queued strategies:', error);
    }
  };

  // Upsert strategy to queue
  const upsertToQueue = async (strategyId: string, isActive: number) => {
    if (!userId) return;
    try {
      const client = await getAuthenticatedTradelayoutClient();
      // Use 'as any' since multi_strategy_queue is a new table not in types yet
      const { error } = await (client as any)
        .from('multi_strategy_queue')
        .upsert({
          user_id: userId,
          strategy_id: strategyId,
          broker_connection_id: DEFAULT_BROKER_ID,
          scale: 1,
          is_active: isActive,
          status: 'pending'
        }, {
          onConflict: 'strategy_id,user_id,broker_connection_id'
        });
      
      if (error) throw error;
      await loadQueuedStrategies(); // Refresh
    } catch (error) {
      console.error('Error upserting to queue:', error);
      toast({
        title: "Error",
        description: "Failed to update strategy queue",
        variant: "destructive",
      });
    }
  };

  const loadStrategies = async () => {
    setLoadingStrategies(true);
    try {
      if (userId) {
        const supabaseData = await strategyService.getStrategies(userId);
        const dbStrategies = supabaseData.map(strategy => ({
          id: strategy.id,
          name: strategy.name,
          description: strategy.description || ''
        }));
        setStrategies(dbStrategies);
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
      toast({
        title: "Error loading strategies",
        description: "Failed to load your strategies",
        variant: "destructive",
      });
    } finally {
      setLoadingStrategies(false);
    }
  };

  const toggleStrategy = async (strategyId: string) => {
    const isCurrentlySelected = selectedStrategies.includes(strategyId);
    const newIsActive = isCurrentlySelected ? 0 : 1;
    
    // Update local state immediately for responsiveness
    setSelectedStrategies(prev => 
      prev.includes(strategyId)
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
    
    // Upsert to database
    await upsertToQueue(strategyId, newIsActive);
  };

  const selectAll = () => {
    setSelectedStrategies(strategies.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedStrategies([]);
  };

  const runMultiStrategyBacktest = async () => {
    if (selectedStrategies.length === 0) {
      toast({
        title: "No strategies selected",
        description: "Please select at least one strategy to backtest",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setResults(null);

    try {
      // Get API base URL from config (falls back to localhost:8000)
      const baseUrl = await getApiBaseUrl(userId || undefined) || 'http://localhost:8000';
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Use queue-based endpoint - reads active strategies from multi_strategy_queue table
      const response = await fetch(`${baseUrl}/api/v1/backtest/multi-strategy-queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backtest_date: dateStr,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      
      // Refresh queued strategies to show updated status
      await loadQueuedStrategies();
      
      toast({
        title: "Backtest completed",
        description: `Processed ${selectedStrategies.length} strategies`,
      });
    } catch (error) {
      console.error('Multi-strategy backtest error:', error);
      toast({
        title: "Backtest failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetResults = () => {
    setResults(null);
  };

  // Load detailed report by calling the single backtest API
  const loadDetailedReport = async (strategyId: string, strategyName: string) => {
    if (!results?.backtest_date) return;
    
    setSelectedStrategyForReport({ id: strategyId, name: strategyName });
    setLoadingReport(true);
    setDetailedReportData(null);
    
    try {
      const baseUrl = await getApiBaseUrl(userId || undefined) || 'http://localhost:8000';
      
      // Call the existing single backtest API which has proper diagnostics
      const response = await fetch(`${baseUrl}/api/v1/backtest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_id: strategyId,
          start_date: results.backtest_date,
          end_date: results.backtest_date,
          include_diagnostics: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract trades_daily and diagnostics from the response
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

        // Get diagnostics from the daily result
        const diagnostics = dayResult.diagnostics || { events_history: {} };
        setDetailedReportData({ tradesDaily, diagnostics });
      }
    } catch (error) {
      console.error('Error loading detailed report:', error);
      toast({
        title: "Error loading report",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      setSelectedStrategyForReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] overflow-auto">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Layers className="h-8 w-8" />
              Multi-Strategy Backtest
            </h1>
            <p className="text-muted-foreground">
              Run backtests for multiple strategies simultaneously on a single date
            </p>
          </div>

          {/* Configuration Section */}
          {!results && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Strategy Selection */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Select Strategies
                      </CardTitle>
                      <CardDescription>
                        Choose strategies to backtest together
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAll}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAll}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingStrategies ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : strategies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No strategies found. Create strategies first.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {strategies.map(strategy => (
                        <div
                          key={strategy.id}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedStrategies.includes(strategy.id)
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => toggleStrategy(strategy.id)}
                        >
                          <Checkbox
                            checked={selectedStrategies.includes(strategy.id)}
                            onCheckedChange={() => toggleStrategy(strategy.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{strategy.name}</div>
                            {strategy.description && (
                              <div className="text-sm text-muted-foreground truncate">
                                {strategy.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedStrategies.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Badge variant="secondary">
                        {selectedStrategies.length} strategies selected
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Date Selection & Run */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Backtest Date
                  </CardTitle>
                  <CardDescription>
                    Select a single date for backtesting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) => date.getFullYear() < 2024 || date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={runMultiStrategyBacktest}
                    disabled={isRunning || selectedStrategies.length === 0}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Backtest
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="space-y-6">
              {/* Header with Reset */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Results for {results.backtest_date}
                </h2>
                <Button variant="outline" onClick={resetResults}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Backtest
                </Button>
              </div>

              {/* Combined Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Combined Summary</CardTitle>
                  <CardDescription>
                    Aggregated results across {results.combined_summary.strategy_count} strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {results.combined_summary.strategy_count}
                      </div>
                      <div className="text-sm text-muted-foreground">Strategies</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className={cn(
                        "text-2xl font-bold",
                        results.combined_summary.combined_pnl >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        ₹{results.combined_summary.combined_pnl.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Combined P&L</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {results.combined_summary.total_positions}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Positions</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {results.combined_summary.win_rate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Per-Strategy Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(results.strategies).map(([strategyId, strategyResult]) => {
                  const strategy = strategies.find(s => s.id === strategyId);
                  const pnl = strategyResult.summary.total_pnl;
                  const isProfit = pnl >= 0;
                  
                  return (
                    <Card key={strategyId}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {strategy?.name || strategyId}
                          </CardTitle>
                          <Badge variant={isProfit ? "default" : "destructive"}>
                            {isProfit ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            ₹{pnl.toLocaleString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                          <div>
                            <div className="text-muted-foreground">Positions</div>
                            <div className="font-medium">{strategyResult.summary.total_positions}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Win Rate</div>
                            <div className="font-medium">{strategyResult.summary.win_rate.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">W/L</div>
                            <div className="font-medium">
                              <span className="text-green-600">{strategyResult.summary.winning_trades}</span>
                              /
                              <span className="text-red-600">{strategyResult.summary.losing_trades}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => loadDetailedReport(strategyId, strategy?.name || strategyId)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Detailed Report
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Running State */}
          {isRunning && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-1">Running Multi-Strategy Backtest...</h3>
                    <p className="text-muted-foreground text-sm">
                      Processing {selectedStrategies.length} strategies for {format(selectedDate, "PPP")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Detailed Report Modal */}
      {selectedStrategyForReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">
                Detailed Report - {selectedStrategyForReport.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStrategyForReport(null);
                  setDetailedReportData(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {loadingReport ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading detailed report...</span>
                </div>
              ) : detailedReportData ? (
                <BacktestReport 
                  externalTradesData={detailedReportData.tradesDaily}
                  externalDiagnosticsData={detailedReportData.diagnostics}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default MultiStrategyBacktest;
