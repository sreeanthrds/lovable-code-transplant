import React from 'react';
import { Strategy } from '@/types/live-trading-websocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity,
  BarChart3,
  Wallet,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LiveDashboardMainProps {
  strategy: Strategy | null | undefined;
  isConnected: boolean;
  error: string | null;
}

export function LiveDashboardMain({ strategy, isConnected, error }: LiveDashboardMainProps) {
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">Connecting to live feed...</p>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Select a strategy to view report</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };

  const winningPositions = strategy.positions.filter(p => p.pnl > 0).length;
  const totalPositions = strategy.positions.length;
  const winRate = totalPositions > 0 ? (winningPositions / totalPositions) * 100 : 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{strategy.strategy_name}</h2>
            <p className="text-xs text-muted-foreground">
              Started: {new Date(strategy.started_at).toLocaleString()}
            </p>
          </div>
          <Badge 
            variant={strategy.status === 'running' ? 'default' : 'secondary'}
            className={strategy.status === 'running' ? 'bg-success/20 text-success border-success/30' : ''}
          >
            {strategy.status}
          </Badge>
        </div>

        {/* Summary Cards - Like Backtesting */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total P&L */}
          <Card className="bg-card/50 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total P&L</CardTitle>
              {strategy.total_pnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className={`text-xl font-bold ${strategy.total_pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                {strategy.total_pnl >= 0 ? '+' : ''}{formatCurrency(strategy.total_pnl)}
              </div>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card className="bg-card/50 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-bold text-foreground">{winRate.toFixed(1)}%</div>
              <Progress value={winRate} className="mt-1 h-1" />
            </CardContent>
          </Card>

          {/* Realized P&L */}
          <Card className="bg-card/50 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Realized</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className={`text-lg font-bold ${strategy.realized_pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                {strategy.realized_pnl >= 0 ? '+' : ''}{formatCurrency(strategy.realized_pnl)}
              </div>
            </CardContent>
          </Card>

          {/* Unrealized P&L */}
          <Card className="bg-card/50 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Unrealized</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className={`text-lg font-bold ${strategy.unrealized_pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                {strategy.unrealized_pnl >= 0 ? '+' : ''}{formatCurrency(strategy.unrealized_pnl)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Positions */}
        <Card className="bg-card/50 border-border/30">
          <CardHeader className="py-3 px-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Open Positions ({strategy.positions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {strategy.positions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No open positions
              </p>
            ) : (
              <div className="space-y-2">
                {strategy.positions.map((position, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/20"
                  >
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={position.side === 'BUY' ? 'text-success border-success/30' : 'text-destructive border-destructive/30'}
                      >
                        {position.side}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-foreground">{position.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {position.quantity} @ {formatCurrency(position.entry_price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${position.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        LTP: {formatCurrency(position.current_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
