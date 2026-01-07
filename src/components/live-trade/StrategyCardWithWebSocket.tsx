import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Copy, AlertCircle, FileText, ListChecks, Info } from 'lucide-react';
import { LiveStrategy } from '@/hooks/use-live-trade-store';
import { formatDistanceToNow } from 'date-fns';

interface LiveTickData {
  timestamp: string;
  progress?: {
    ticks_processed: number;
    total_ticks: number;
    progress_percentage: number;
  };
  open_positions?: Array<{
    symbol: string;
    quantity: number;
    unrealized_pnl: number;
  }>;
  pnl_summary?: {
    realized_pnl: string;
    unrealized_pnl: string;
    total_pnl: string;
    closed_trades: number;
    open_trades: number;
  };
  ltp_store?: Record<string, any>;
  last_update?: string;
}

interface StrategyCardWithWebSocketProps {
  strategy: LiveStrategy;
  connectionId?: string;
  connectionStatus: string;
  getConnectionName: (id: string) => string;
  handleConnectionChange: (strategyId: string, connectionId: string) => void;
  handleStartStrategy: (strategy: LiveStrategy, connectionId?: string) => void;
  handleStopStrategy: (strategy: LiveStrategy) => void;
  handleRemoveStrategy: (strategy: LiveStrategy) => void;
  brokerConnections: any[];
  loading: boolean;
  hideStartStopButtons?: boolean;
  liveTickData?: LiveTickData | null;
  onViewTrades?: (strategyId: string) => void;
  isQueued?: boolean;
  onQueueToggle?: (strategyId: string, shouldQueue: boolean) => void;
  canQueue?: boolean;
  scale?: number;
  onScaleChange?: (strategyId: string, scale: number) => void;
  onClone?: () => void;
  isTemporaryClone?: boolean;
}

export const StrategyCardWithWebSocket: React.FC<StrategyCardWithWebSocketProps> = ({
  strategy,
  connectionId,
  connectionStatus,
  getConnectionName,
  handleConnectionChange,
  handleRemoveStrategy,
  brokerConnections,
  loading,
  hideStartStopButtons = false,
  liveTickData,
  onViewTrades,
  isQueued = false,
  onQueueToggle,
  canQueue = false,
  scale = 1,
  onScaleChange,
  onClone,
  isTemporaryClone = false
}) => {
  // Use live tick data from user-level SSE
  const pnlData = liveTickData?.pnl_summary;
  const positions = liveTickData?.open_positions || [];
  const progress = liveTickData?.progress;
  const ltpStore = liveTickData?.ltp_store || {};
  const ltpCount = Object.keys(ltpStore).length;
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

  return (
    <Card 
      key={strategy.id} 
      className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-3"
      style={{
        background: 'rgba(255, 255, 255, 0.003)',
        backdropFilter: 'blur(4px) saturate(120%)',
        WebkitBackdropFilter: 'blur(4px) saturate(120%)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(65, 170, 165, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.borderColor = 'rgba(65, 170, 165, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      }}
    >

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg font-bold group-hover:text-primary transition-all duration-300 truncate">
            {strategy.name}
          </CardTitle>
          {strategy.description && (
            <div className="relative group/tooltip flex-shrink-0">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute right-0 top-6 w-64 p-2 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                <p className="text-xs text-popover-foreground">{strategy.description}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Scale, Queue Toggle, Status in one line */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Scale Input */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium whitespace-nowrap">Scale:</label>
            <input
              type="number"
              min="0.1"
              max="999"
              step="0.1"
              value={scale}
              onChange={(e) => onScaleChange?.(strategy.strategyId, parseFloat(e.target.value) || 1)}
              disabled={strategy.isLive}
              className="w-16 px-1.5 py-0.5 text-xs border border-border rounded bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed text-center"
            />
          </div>
          
          {/* Queue Toggle */}
          {canQueue && !strategy.isLive && connectionId && !strategy.error && onQueueToggle && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isQueued}
                onChange={(e) => onQueueToggle(strategy.strategyId, e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-medium flex items-center gap-1">
                <ListChecks className="h-3.5 w-3.5" />
                {isQueued ? 'Queued' : 'Queue'}
              </span>
            </label>
          )}
          
          {/* Status Badge */}
          <Badge 
            variant="outline"
            className={`text-xs ${
              strategy.error
                ? 'border-red-500 text-red-500'
                : !connectionId
                  ? 'border-orange-500 text-orange-500'
                  : strategy.isLive
                    ? 'border-success text-success' 
                    : strategy.status === 'starting' 
                      ? 'border-warning text-warning'
                      : 'border-muted-foreground text-muted-foreground'
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-1.5 ${
              strategy.error
                ? 'bg-red-500'
                : !connectionId
                  ? 'bg-orange-500'
                  : strategy.isLive 
                    ? 'bg-success animate-pulse' 
                    : 'bg-gray-200'
            }`}></div>
            {strategy.error ? 'INVALID' : !connectionId ? 'NOT READY' : strategy.isLive ? 'LIVE' : strategy.status === 'starting' ? 'STARTING' : 'READY'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert - Per Strategy */}
        {strategy.error && (
          <div className="bg-transparent border-2 border-red-500/60 rounded-lg p-3 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-red-300">Connection Error</p>
                <p className="text-xs text-red-400 break-words">{strategy.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Last Update Indicator */}
        {strategy.isLive && timeAgo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${
              isRecent ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span>Last Update: {timeAgo}</span>
          </div>
        )}

        {/* Performance Summary - Use live tick data */}
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total P&L</span>
              <p className={`font-bold text-lg transition-all duration-300 ${
                parseFloat(pnlData?.total_pnl || '0') >= 0 
                  ? 'text-success' 
                  : 'text-destructive'
              }`}>
                {pnlData ? (
                  <>
                    {parseFloat(pnlData.total_pnl) >= 0 ? '+' : ''}
                    ₹{parseFloat(pnlData.total_pnl).toFixed(2)}
                  </>
                ) : strategy.isLive ? 'Waiting...' : '--'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Trades</span>
              <p className="font-bold text-lg">
                {pnlData ? pnlData.closed_trades : strategy.isLive ? '0' : '--'}
              </p>
            </div>
          </div>
          {/* LTP Updates and Positions breakdown */}
          <div className="grid grid-cols-2 gap-4 text-xs mt-2 pt-2 border-t border-primary/20">
            <div>
              <span className="text-muted-foreground">LTP Updates</span>
              <p className="font-medium text-cyan-400">
                {ltpCount} symbols
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Positions</span>
              <p className="font-medium text-orange-400">
                {positions.length} active
              </p>
            </div>
          </div>
        </div>

        {/* Broker Connection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Broker Connection</label>
          <Select
            value={connectionId}
            onValueChange={(value) => handleConnectionChange(strategy.id, value)}
            disabled={strategy.isLive}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select broker connection" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50">
              {brokerConnections.length === 0 ? (
                <SelectItem value="none" disabled>
                  No broker connections available
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
        </div>

      </CardContent>

      <CardFooter className="flex gap-2 justify-between pt-4">
        <div className="flex gap-2 flex-wrap items-center">
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
          
          {/* View Trades button - Only for non-temporary strategies */}
          {onViewTrades && !isTemporaryClone && (
            <Button
              onClick={() => onViewTrades(strategy.id)}
              size="sm"
              variant="default"
              className="bg-primary hover:bg-primary/90"
            >
              <FileText className="h-4 w-4 mr-1" />
              View Trades
            </Button>
          )}
        </div>

        <Button
          onClick={() => handleRemoveStrategy(strategy)}
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
