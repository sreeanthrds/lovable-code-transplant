import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Square, 
  Zap,
  Wifi,
  WifiOff,
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target
} from 'lucide-react';
import { LiveSessionStats } from '@/types/live-simulation';
import { ConnectionStatus } from '@/hooks/use-live-simulation-sse';
import { cn } from '@/lib/utils';

interface SimulationControlsProps {
  sessionStatus: 'running' | 'paused' | 'stopped' | 'completed';
  connectionStatus: ConnectionStatus;
  stats: LiveSessionStats;
  speedMultiplier: number;
  brokerType: string;
  onStop: () => void;
  onChangeSpeed: (speed: number) => void;
  isLoading?: boolean;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  sessionStatus,
  connectionStatus,
  stats,
  speedMultiplier,
  brokerType,
  onStop,
  onChangeSpeed,
  isLoading = false
}) => {
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
      case 'reconnecting':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Connecting</Badge>;
      case 'reconnecting':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Reconnecting</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {getConnectionIcon()}
            Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {getConnectionBadge()}
            {brokerType === 'clickhouse' && sessionStatus === 'running' && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <Select 
                  value={speedMultiplier.toString()} 
                  onValueChange={(val) => onChangeSpeed(parseInt(val))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="4">4x</SelectItem>
                    <SelectItem value="10">10x</SelectItem>
                    <SelectItem value="50">50x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Total P&L */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {stats.total_pnl >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            Total P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            stats.total_pnl > 0 ? 'text-green-500' : 
            stats.total_pnl < 0 ? 'text-red-500' : ''
          )}>
            ₹{stats.total_pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Open: ₹{stats.unrealized_pnl.toFixed(0)} | Closed: ₹{stats.realized_pnl.toFixed(0)}
          </div>
        </CardContent>
      </Card>

      {/* Trade Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Trade Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-2xl font-bold">{stats.total_trades}</span>
              <span className="text-xs text-muted-foreground ml-1">trades</span>
            </div>
            <div className="text-sm">
              <span className="text-green-500">{stats.winning_trades}W</span>
              <span className="text-muted-foreground"> / </span>
              <span className="text-red-500">{stats.losing_trades}L</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Win Rate: {stats.win_rate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onStop}
              disabled={sessionStatus !== 'running' || isLoading}
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
            {sessionStatus === 'completed' && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Completed
              </Badge>
            )}
            {sessionStatus === 'stopped' && (
              <Badge variant="secondary">Stopped</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationControls;
