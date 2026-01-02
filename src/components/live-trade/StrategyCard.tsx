import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Strategy } from '@/types/live-trading-websocket';
import { Package, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PnLDisplay } from './PnLDisplay';

interface StrategyCardProps {
  strategy: Strategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const navigate = useNavigate();
  
  const getStatusConfig = () => {
    switch (strategy.status) {
      case 'running':
        return {
          variant: 'default' as const,
          className: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      case 'paused':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };
      case 'stopped':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
      onClick={() => navigate(`/app/live-trading/${strategy.strategy_id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{strategy.strategy_name}</CardTitle>
          <Badge variant={statusConfig.variant} className={statusConfig.className}>
            {strategy.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* P&L Display */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
          <span className="text-sm text-muted-foreground">Total P&L</span>
          <PnLDisplay value={strategy.total_pnl} size="lg" />
        </div>

        {/* Realized & Unrealized P&L */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-card/50 border">
            <p className="text-xs text-muted-foreground">Realized</p>
            <PnLDisplay value={strategy.realized_pnl} size="sm" showIcon={false} />
          </div>
          <div className="p-2 rounded bg-card/50 border">
            <p className="text-xs text-muted-foreground">Unrealized</p>
            <PnLDisplay value={strategy.unrealized_pnl} size="sm" showIcon={false} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>{strategy.positions.length} Positions</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-xs">
              {formatDistanceToNow(new Date(strategy.started_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
