import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActiveNode, LivePnL, LivePosition } from '@/types/live-simulation';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Zap
} from 'lucide-react';

interface ActiveNodesPanelProps {
  activeNodes: ActiveNode[];
  pnl: LivePnL;
  openPositions: LivePosition[];
  currentTime: string;
  progress: number;
  sessionStatus: 'running' | 'paused' | 'stopped' | 'completed';
  brokerType: string;
  simulationDate?: string;
  speedMultiplier?: number;
}

const ActiveNodesPanel: React.FC<ActiveNodesPanelProps> = ({
  activeNodes,
  pnl,
  openPositions,
  currentTime,
  progress,
  sessionStatus,
  brokerType,
  simulationDate,
  speedMultiplier = 1
}) => {
  const activeCount = activeNodes.filter(n => n.status === 'active').length;
  const pendingCount = activeNodes.filter(n => n.status === 'pending').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--:--';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              sessionStatus === 'running' ? 'bg-green-500 animate-pulse' : 
              sessionStatus === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
            )} />
            <CardTitle className="text-lg font-bold">Live Trading Active</CardTitle>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Broker:</span>
              <Badge variant="outline" className="font-medium">
                {brokerType === 'clickhouse' ? 'ClickHouse Simulation' : brokerType}
              </Badge>
            </div>
            {simulationDate && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">📅</span>
                <span>{simulationDate}</span>
              </div>
            )}
            {brokerType === 'clickhouse' && speedMultiplier > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">⚡</span>
                <span>{speedMultiplier}x Speed</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">💰 P&L:</span>
            <span className={cn(
              "font-bold text-lg",
              pnl.total > 0 ? 'text-green-500' : pnl.total < 0 ? 'text-red-500' : 'text-foreground'
            )}>
              ₹{pnl.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-muted-foreground">
              (Open: ₹{pnl.unrealized.toFixed(0)} | Closed: ₹{pnl.realized.toFixed(0)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>
          {brokerType === 'clickhouse' && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Progress:</span>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm">{progress.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Nodes Section */}
        {(activeCount > 0 || pendingCount > 0) && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Active Nodes ({activeCount} active, {pendingCount} pending)
            </h4>
            <div className="space-y-3">
              {activeNodes
                .filter(node => node.status !== 'inactive')
                .map((node) => (
                  <div 
                    key={node.node_id}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      node.status === 'active' 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-yellow-500/30 bg-yellow-500/5'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(node.status)}
                        <span className="font-semibold">{node.node_id}</span>
                        <Badge variant="outline" className="text-xs">
                          {node.node_type}
                        </Badge>
                      </div>
                      {getStatusBadge(node.status)}
                    </div>
                    
                    {node.last_action && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {node.last_action}
                      </p>
                    )}
                    
                    {/* Conditions */}
                    {node.conditions_evaluated && Object.keys(node.conditions_evaluated).length > 0 && (
                      <div className="space-y-1 mb-2">
                        {Object.entries(node.conditions_evaluated).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            {value ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                            )}
                            <span className="font-mono text-xs">{key}:</span>
                            <span className={value ? 'text-green-500' : 'text-red-500'}>
                              {value ? 'true' : 'false'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Order Info */}
                    {node.order_info && (
                      <div className="flex items-center gap-2 text-sm bg-background/50 rounded px-2 py-1">
                        <span className="text-muted-foreground">Order:</span>
                        <Badge variant={node.order_info.side === 'BUY' ? 'default' : 'secondary'}>
                          {node.order_info.side}
                        </Badge>
                        <span>{node.order_info.quantity} {node.order_info.symbol}</span>
                        {node.order_info.price && (
                          <span>@ ₹{node.order_info.price.toFixed(2)}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Target/SL Info */}
                    <div className="flex gap-4 mt-2">
                      {node.target_info && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-3.5 h-3.5 text-green-500" />
                          <span>Target: {node.target_info.target_price.toFixed(2)}</span>
                          <span className="text-muted-foreground">
                            (+{node.target_info.points_to_go.toFixed(0)} pts)
                          </span>
                        </div>
                      )}
                      {node.sl_info && (
                        <div className="flex items-center gap-2 text-sm">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                          <span>SL: {node.sl_info.sl_price.toFixed(2)}</span>
                          <span className="text-muted-foreground">
                            (-{node.sl_info.points_away.toFixed(0)} pts)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* Open Positions Section */}
        {openPositions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Open Positions ({openPositions.length})
            </h4>
            <div className="space-y-2">
              {openPositions.map((position) => (
                <div 
                  key={position.position_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-background/50"
                >
                  <div className="flex items-center gap-3">
                    {position.unrealized_pnl >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">{position.symbol}</span>
                    <Badge variant={position.side === 'BUY' ? 'default' : 'secondary'}>
                      {position.side} {position.quantity}
                    </Badge>
                    <span className="text-muted-foreground">
                      @ {position.entry_price.toFixed(2)} → {position.current_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "font-bold",
                      position.unrealized_pnl > 0 ? 'text-green-500' : 
                      position.unrealized_pnl < 0 ? 'text-red-500' : ''
                    )}>
                      {position.unrealized_pnl >= 0 ? '+' : ''}₹{position.unrealized_pnl.toFixed(2)}
                    </span>
                    <span className={cn(
                      "text-sm ml-2",
                      position.pnl_percentage > 0 ? 'text-green-500' : 
                      position.pnl_percentage < 0 ? 'text-red-500' : ''
                    )}>
                      ({position.pnl_percentage >= 0 ? '+' : ''}{position.pnl_percentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {activeNodes.filter(n => n.status !== 'inactive').length === 0 && openPositions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active nodes or positions</p>
            <p className="text-sm">Waiting for conditions to trigger...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveNodesPanel;
