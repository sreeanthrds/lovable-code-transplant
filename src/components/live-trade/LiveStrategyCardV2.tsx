import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Trash2, FileText, CheckCircle2, XCircle, Loader2, Copy } from 'lucide-react';
import { LiveStrategy } from '@/hooks/use-live-trade-store';
import { useReadyValidation } from '@/hooks/use-ready-validation';

interface LiveTickData {
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
  ltp_store?: Record<string, any>;
  open_positions?: Array<any>;
  last_update?: string;
  timestamp?: string;
}

interface LiveStrategyCardV2Props {
  strategy: LiveStrategy;
  connectionId?: string;
  brokerConnections: any[];
  existingCombinations: [string, string][]; // All strategy+broker combos in grid
  userId: string | null;
  apiBaseUrl: string | null;
  liveTickData?: LiveTickData | null;
  isQueued: boolean;
  canQueue: boolean;
  scale: number;
  mode?: 'live' | 'backtest'; // Skip validation in backtest mode
  onConnectionChange: (strategyId: string, connectionId: string) => void;
  onQueueToggle: (strategyId: string, shouldQueue: boolean) => void;
  onScaleChange: (strategyId: string, scale: number) => void;
  onViewTrades: (strategyId: string) => void;
  onRemove: (strategyId: string) => void;
  onClone?: () => void;
  isTemporaryClone?: boolean;
}

export const LiveStrategyCardV2: React.FC<LiveStrategyCardV2Props> = ({
  strategy,
  connectionId,
  brokerConnections,
  existingCombinations,
  userId,
  apiBaseUrl,
  liveTickData,
  isQueued,
  canQueue,
  scale,
  mode = 'live',
  onConnectionChange,
  onQueueToggle,
  onScaleChange,
  onViewTrades,
  onRemove,
  onClone,
  isTemporaryClone = false
}) => {
  // Validate READY state - use UI-side validation in backtest mode
  const readyValidation = useReadyValidation(
    mode === 'backtest' ? null : userId,
    strategy.strategyId,
    connectionId,
    existingCombinations,
    mode === 'backtest' ? null : apiBaseUrl,
    mode === 'backtest' ? brokerConnections : undefined // Pass connections for UI-side validation in backtest mode
  );

  const pnl = liveTickData?.pnl_summary;
  const progress = liveTickData?.progress;
  const ltpCount = liveTickData?.ltp_store ? Object.keys(liveTickData.ltp_store).length : 0;
  const positions = liveTickData?.open_positions || [];
  const lastUpdate = liveTickData?.last_update || liveTickData?.timestamp;
  
  // Calculate time ago
  const getTimeAgo = (timestamp: string | undefined) => {
    if (!timestamp) return null;
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  
  const timeAgo = getTimeAgo(lastUpdate);
  const isRecent = lastUpdate ? (Date.now() - new Date(lastUpdate).getTime()) < 5000 : false;

  // Status badge with 4 states: NOT READY, READY, RUNNING, COMPLETED
  const statusBadge = useMemo(() => {
    // If strategy is currently live/running
    if (strategy.isLive) {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-white" />
          RUNNING
        </Badge>
      );
    }

    // If strategy has been executed and completed
    if (strategy.status === 'completed' || (strategy.backendSessionId && !strategy.isLive)) {
      return (
        <Badge className="bg-slate-600 hover:bg-slate-700 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          COMPLETED
        </Badge>
      );
    }

    // For queued or not-yet-executed strategies, check READY state
    if (readyValidation.loading) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking...
        </Badge>
      );
    }

    if (readyValidation.ready) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          READY
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        NOT READY
      </Badge>
    );
  }, [strategy.isLive, strategy.status, strategy.backendSessionId, readyValidation]);

  return (
    <Card className="group relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold truncate">
              {strategy.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              {strategy.description}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="flex-shrink-0">
            {statusBadge}
          </div>
        </div>

        {/* Status indicator */}
        {strategy.isLive && (
          <Badge variant="default" className="w-fit">
            🔴 LIVE
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Last Update Indicator */}
        {strategy.isLive && timeAgo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${
              isRecent ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span>Last Update: {timeAgo}</span>
          </div>
        )}

        {/* P&L Display */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
          <div>
            <span className="text-xs text-muted-foreground">Total P&L</span>
            <p className={`text-lg font-bold ${pnl ? (parseFloat(pnl.total_pnl) >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
              {pnl ? (
                <>
                  {parseFloat(pnl.total_pnl) >= 0 ? '+' : ''}
                  ₹{parseFloat(pnl.total_pnl).toFixed(2)}
                </>
              ) : strategy.isLive ? 'Waiting...' : '--'}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Trades</span>
            <p className="text-lg font-bold">
              {pnl ? pnl.closed_trades : strategy.isLive ? '0' : '--'}
            </p>
          </div>
        </div>
        
        {/* Realized/Unrealized P&L Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Realized P&L</span>
            <p className={`font-semibold ${pnl && parseFloat(pnl.realized_pnl || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {pnl ? `₹${parseFloat(pnl.realized_pnl || '0').toFixed(2)}` : '--'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Unrealized P&L</span>
            <p className={`font-semibold ${pnl && parseFloat(pnl.unrealized_pnl || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {pnl ? `₹${parseFloat(pnl.unrealized_pnl || '0').toFixed(2)}` : '--'}
            </p>
          </div>
        </div>

        {/* Progress (if running) */}
        {strategy.isLive && progress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing ticks</span>
              <span>{progress.ticks_processed} / {progress.total_ticks}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all" 
                style={{ width: `${(progress.ticks_processed / progress.total_ticks) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Broker Connection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Broker Connection</label>
          <Select
            value={connectionId}
            onValueChange={(value) => onConnectionChange(strategy.id, value)}
            disabled={mode === 'live' && (strategy.isLive || isQueued)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select broker" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {brokerConnections.length === 0 ? (
                <SelectItem value="none" disabled>
                  No brokers available
                </SelectItem>
              ) : (
                brokerConnections.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id}>
                    {conn.connection_name} ({conn.broker_type})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* READY status reason */}
          {!readyValidation.loading && !readyValidation.ready && (
            <p className="text-xs text-red-600">
              {readyValidation.reason}
            </p>
          )}
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scale</label>
          <Input
            type="number"
            min="1"
            max="10"
            value={scale}
            onChange={(e) => onScaleChange(strategy.id, parseInt(e.target.value) || 1)}
            disabled={mode === 'live' && (strategy.isLive || isQueued)}
            className="w-full"
          />
        </div>

        {/* Queue Checkbox */}
        {canQueue && !strategy.isLive && (
          <div className="flex items-center space-x-2 p-2 border rounded">
            <Checkbox
              id={`queue-${strategy.id}`}
              checked={isQueued}
              onCheckedChange={(checked) => onQueueToggle(strategy.id, checked as boolean)}
              disabled={!canQueue || !readyValidation.ready || strategy.isLive}
            />
            <span className="text-sm">Submit to queue</span>
            {/* Show validation reason if not ready and not running/completed */}
            {!strategy.isLive && strategy.status !== 'completed' && !readyValidation.ready && readyValidation.reason && (
              <p className="text-xs text-red-500 mt-1">{readyValidation.reason}</p>
            )}
            {/* Show status message for running/completed */}
            {strategy.isLive && (
              <p className="text-xs text-blue-600 mt-1">Strategy is currently executing</p>
            )}
            {strategy.status === 'completed' && !strategy.isLive && (
              <p className="text-xs text-slate-600 mt-1">Execution completed - View trades for results</p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 justify-between pt-4">
        <div className="flex gap-2">
          {/* Clone button - Only for non-temporary strategies */}
          {onClone && !isTemporaryClone && (
            <Button
              onClick={onClone}
              size="sm"
              variant="outline"
              disabled={strategy.isLive}
            >
              <Copy className="h-4 w-4 mr-1" />
              Clone
            </Button>
          )}
          
          {/* View Trades - Only for non-temporary strategies */}
          {!isTemporaryClone && (
            <Button
              onClick={() => onViewTrades(strategy.id)}
              size="sm"
              variant="default"
            >
              <FileText className="h-4 w-4 mr-1" />
              View Trades
            </Button>
          )}
        </div>

        {/* Remove */}
        <Button
          onClick={() => onRemove(strategy.id)}
          disabled={strategy.isLive}
          size="sm"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
