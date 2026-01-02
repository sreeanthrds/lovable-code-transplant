import React, { useState, useCallback } from 'react';
import { BarChart3, Activity, GitBranch } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiveStrategy } from '@/hooks/use-live-trade-store';
import type { DailySummary, Trade, ExecutionNode } from '@/types/backtest';
import SummaryDashboard from '@/components/backtest-report/SummaryDashboard';
import TradesTable from '@/components/backtest-report/TradesTable';
import NodeDetailModal from '@/components/backtest-report/NodeDetailModal';
import { cn } from '@/lib/utils';

interface LiveReportPanelProps {
  selectedStrategy: LiveStrategy | null;
  // Accept raw polling data directly (already in backtest format)
  pollingData: {
    trades: Trade[];
    pnl: DailySummary;
    positions: any[];
    timestamp: string;
  } | null;
  // Events history from SSE for flow diagrams
  eventsHistory: Record<string, ExecutionNode>;
  isConnected: boolean;
  error: string | null;
  allStrategies: LiveStrategy[];
  onOpenCanvas?: () => void;
}

export function LiveReportPanel({ 
  selectedStrategy, 
  pollingData,
  eventsHistory,
  isConnected,
  error,
  allStrategies,
  onOpenCanvas
}: LiveReportPanelProps) {
  const [selectedNode, setSelectedNode] = useState<ExecutionNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handler for node clicks in flow diagram
  const handleNodeClick = useCallback((node: ExecutionNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedNode(null);
  }, []);

  // Get flow nodes from eventsHistory (same as backtest)
  const getFlowNodes = useCallback((executionIds: string[]): ExecutionNode[] => {
    if (!eventsHistory || Object.keys(eventsHistory).length === 0) {
      console.log('🔴 getFlowNodes: eventsHistory is empty');
      return [];
    }
    
    // Debug: log first few IDs and first few keys to check for mismatch
    if (executionIds.length > 0) {
      const historyKeys = Object.keys(eventsHistory);
      console.log('🔍 getFlowNodes debug:', {
        requestedIds: executionIds.slice(0, 3),
        historyKeysSample: historyKeys.slice(0, 3),
        historyKeysCount: historyKeys.length,
        requestedCount: executionIds.length
      });
    }
    
    const nodes = executionIds
      .map(id => eventsHistory[id])
      .filter((node): node is ExecutionNode => node !== undefined);
    
    console.log(`📊 getFlowNodes: ${executionIds.length} IDs → ${nodes.length} nodes resolved`);
    return nodes;
  }, [eventsHistory]);

  // Show overall dashboard when no strategy selected
  if (!selectedStrategy) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live Trading Overview</h2>
            <p className="text-xs text-muted-foreground">
              Select a session to view detailed report
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="card-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Strategies</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-bold text-foreground">{allStrategies.length}</div>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Live Sessions</CardTitle>
                <Activity className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-bold text-success">
                  {allStrategies.filter(s => s.isLive).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {allStrategies.length > 0 && (
            <Card className="card-elegant">
              <CardHeader className="py-3 px-3">
                <CardTitle className="text-sm font-medium">Submitted Strategies</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                {allStrategies.map(strategy => (
                  <div 
                    key={strategy.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/30"
                  >
                    <span className="text-sm font-medium text-foreground">{strategy.name}</span>
                    <span className={cn(
                      "text-xs font-medium capitalize",
                      strategy.isLive ? 'text-success' : 
                      strategy.status === 'starting' ? 'text-warning' : 'text-muted-foreground'
                    )}>
                      {strategy.isLive ? 'LIVE' : strategy.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    );
  }

  // Show waiting state when no data yet
  if (!pollingData) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Live Report</h2>
              <p className="text-xs text-muted-foreground">{selectedStrategy.name}</p>
            </div>
            {onOpenCanvas && (
              <Button variant="outline" size="sm" onClick={onOpenCanvas} className="gap-2">
                <GitBranch className="w-4 h-4" />
                Strategy Canvas
              </Button>
            )}
          </div>

          <Card className="card-elegant">
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <Activity className={cn(
                  "w-12 h-12 mx-auto",
                  isConnected ? "text-success animate-pulse" : "text-muted-foreground"
                )} />
                <h3 className="text-lg font-medium">
                  {error ? 'Connection Error' : isConnected ? 'Waiting for Data...' : 'Connecting...'}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  {error || 'Live trading data will appear here as events occur.'}
                </p>
                {selectedStrategy.isLive && !error && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm text-success font-medium">Strategy is running</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  // Extract data - trades and pnl are already in backtest format
  const { trades, pnl, timestamp } = pollingData;
  
  // Build summary from pnl (which is already DailySummary format from backend)
  const summary: DailySummary = {
    total_trades: pnl.total_trades || trades.length,
    total_pnl: pnl.total_pnl || '0',
    winning_trades: pnl.winning_trades || 0,
    losing_trades: pnl.losing_trades || trades.length,
    win_rate: pnl.win_rate || '0'
  };
  
  // Extract date from timestamp
  const date = timestamp?.split('T')[0] || new Date().toISOString().split('T')[0];

  // Helper to format time
  const formatTime = (isoString: string): string => {
    try {
      const dt = new Date(isoString);
      return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  // Debug: show events history count
  const eventsCount = Object.keys(eventsHistory).length;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header with Canvas Button */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">Live Report</h2>
              {selectedStrategy.isLive && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 animate-pulse">
                  LIVE
                </Badge>
              )}
              {selectedStrategy.status === 'completed' && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                  COMPLETED
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedStrategy.name} • {formatTime(timestamp)}
              {eventsCount > 0 && ` • ${eventsCount} events`}
            </p>
          </div>
          {onOpenCanvas && (
            <Button variant="outline" size="sm" onClick={onOpenCanvas} className="gap-2">
              <GitBranch className="w-4 h-4" />
              Strategy Canvas
            </Button>
          )}
        </div>

        {/* Reuse SummaryDashboard from Backtest */}
        <SummaryDashboard summary={summary} date={date} />

        {/* Reuse TradesTable from Backtest with flow diagrams */}
        {trades.length === 0 ? (
          <Card className="card-elegant">
            <CardContent className="py-8 text-center text-muted-foreground">
              No closed trades yet
            </CardContent>
          </Card>
        ) : (
          <TradesTable 
            trades={trades}
            getFlowNodes={getFlowNodes}
            onNodeClick={handleNodeClick}
          />
        )}

        {/* Node Detail Modal - same as backtest */}
        <NodeDetailModal
          node={selectedNode}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          allNodes={eventsHistory}
        />
      </div>
    </ScrollArea>
  );
}
