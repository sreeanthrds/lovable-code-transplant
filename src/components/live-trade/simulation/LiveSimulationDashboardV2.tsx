import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLiveSimulationStream } from '@/hooks/use-live-simulation-stream';
import { 
  ArrowLeft, 
  Activity, 
  BarChart3, 
  FileText, 
  Circle,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LiveSimulationDashboardV2Props {
  sessionId: string;
  strategyName: string;
  simulationDate?: string;
  onBack: () => void;
}

const LiveSimulationDashboardV2: React.FC<LiveSimulationDashboardV2Props> = ({
  sessionId,
  strategyName,
  simulationDate,
  onBack
}) => {
  const {
    connectionStatus,
    error,
    sessionStatus,
    currentTime,
    progress,
    activeNodes,
    pendingNodes,
    completedNodesThisTick,
    openPositions,
    pnlSummary,
    trades,
    totalPnl,
    realizedPnl,
    unrealizedPnl,
    winRate,
    progressPercentage,
    stopSimulation,
    disconnect
  } = useLiveSimulationStream({
    sessionId,
    autoConnect: true
  });

  const handleStop = async () => {
    try {
      await stopSimulation();
      toast.success('Simulation stopped');
      onBack();
    } catch (err) {
      toast.error('Failed to stop simulation');
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'reconnecting': return 'bg-orange-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{strategyName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>Session: {sessionId.slice(0, 16)}...</span>
              {simulationDate && <span>• Date: {simulationDate}</span>}
              <span className="flex items-center gap-1">
                <Circle className={cn("w-2 h-2", getConnectionStatusColor())} />
                {connectionStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <Badge variant="destructive">{error}</Badge>
          )}
          <Button 
            variant="destructive" 
            onClick={handleStop}
            disabled={sessionStatus === 'stopped'}
          >
            Stop Simulation
          </Button>
        </div>
      </div>

      {/* Progress & Time */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-lg">{currentTime || '--:--:--'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {progress.ticks_processed.toLocaleString()} / {progress.total_ticks.toLocaleString()} ticks
              </span>
              <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* PnL Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p className={cn(
              "text-2xl font-bold",
              totalPnl >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Realized</p>
            <p className={cn(
              "text-2xl font-bold",
              realizedPnl >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {realizedPnl >= 0 ? '+' : ''}{realizedPnl.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Unrealized</p>
            <p className={cn(
              "text-2xl font-bold",
              unrealizedPnl >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Nodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5" />
            Active Nodes ({activeNodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeNodes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active nodes</p>
          ) : (
            <div className="grid gap-2">
              {activeNodes.map((node) => (
                <div 
                  key={node.execution_id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{node.node_name}</p>
                    <p className="text-xs text-muted-foreground">{node.node_type}</p>
                  </div>
                  <Badge variant={node.signal_emitted ? "default" : "secondary"}>
                    {node.signal_emitted ? 'Signal Emitted' : 'Monitoring'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Open Positions ({openPositions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openPositions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No open positions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Side</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Entry</th>
                    <th className="p-2">LTP</th>
                    <th className="p-2">P&L</th>
                    <th className="p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {openPositions.map((pos) => {
                    const pnl = parseFloat(pos.unrealized_pnl);
                    const pnlPercent = parseFloat(pos.unrealized_pnl_percent);
                    return (
                      <tr key={pos.position_id} className="border-b">
                        <td className="p-2 font-mono text-xs">{pos.symbol}</td>
                        <td className="p-2">
                          <Badge variant={pos.side === 'buy' ? 'default' : 'destructive'}>
                            {pos.side.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-2">{pos.quantity}</td>
                        <td className="p-2">{pos.entry_price}</td>
                        <td className="p-2">{pos.current_ltp}</td>
                        <td className={cn("p-2 font-medium", pnl >= 0 ? "text-green-500" : "text-red-500")}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                        </td>
                        <td className="p-2 text-muted-foreground">{pos.duration_minutes}m</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trades & Diagnostics Tabs */}
      <Tabs defaultValue="trades">
        <TabsList>
          <TabsTrigger value="trades" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Completed Trades ({trades.length})
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Diagnostics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trades" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              {trades.length === 0 ? (
                <p className="text-muted-foreground text-sm">No completed trades yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-2">Symbol</th>
                        <th className="p-2">Side</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Entry</th>
                        <th className="p-2">Exit</th>
                        <th className="p-2">P&L</th>
                        <th className="p-2">Exit Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => {
                        const pnl = parseFloat(trade.pnl);
                        const pnlPercent = parseFloat(trade.pnl_percent);
                        return (
                          <tr key={trade.trade_id} className="border-b">
                            <td className="p-2 font-mono text-xs">{trade.symbol}</td>
                            <td className="p-2">
                              <Badge variant={trade.side === 'BUY' ? 'default' : 'destructive'}>
                                {trade.side}
                              </Badge>
                            </td>
                            <td className="p-2">{trade.quantity}</td>
                            <td className="p-2">{trade.entry_price}</td>
                            <td className="p-2">{trade.exit_price}</td>
                            <td className={cn("p-2 font-medium", pnl >= 0 ? "text-green-500" : "text-red-500")}>
                              <div className="flex items-center gap-1">
                                {pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                              </div>
                            </td>
                            <td className="p-2 text-muted-foreground">{trade.exit_reason}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Closed Trades</p>
                  <p className="text-2xl font-bold">{pnlSummary.closed_trades}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Winning</p>
                  <p className="text-2xl font-bold text-green-500">{pnlSummary.winning_trades}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Losing</p>
                  <p className="text-2xl font-bold text-red-500">{pnlSummary.losing_trades}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Open Trades</p>
                  <p className="text-2xl font-bold">{pnlSummary.open_trades}</p>
                </div>
              </div>

              {/* Completed nodes this tick */}
              {completedNodesThisTick.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Events This Tick</h4>
                  <div className="space-y-2">
                    {completedNodesThisTick.map((node, idx) => (
                      <div key={idx} className="p-2 rounded bg-muted/30 text-sm">
                        <span className="font-medium">{node.node_name}</span>
                        <span className="text-muted-foreground ml-2">→ {node.result}</span>
                        {node.pnl && (
                          <span className={cn("ml-2", parseFloat(node.pnl) >= 0 ? "text-green-500" : "text-red-500")}>
                            P&L: {node.pnl}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending nodes */}
              {pendingNodes.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Pending Nodes ({pendingNodes.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {pendingNodes.map((node) => (
                      <Badge key={node.node_id} variant="outline">
                        {node.node_name} (waiting: {node.waiting_for})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveSimulationDashboardV2;
