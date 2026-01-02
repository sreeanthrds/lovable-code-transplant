import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign } from 'lucide-react';

interface SessionTickData {
  pnl_summary?: {
    realized_pnl: string;
    unrealized_pnl: string;
    total_pnl: string;
    closed_trades: number;
    open_trades: number;
  };
  ltp_store?: Record<string, any>;
  open_positions?: Array<any>;
}

interface AggregatedPnLDisplayProps {
  sessionTicks: Record<string, SessionTickData>;
  activeSessionCount: number;
}

export const AggregatedPnLDisplay: React.FC<AggregatedPnLDisplayProps> = ({
  sessionTicks,
  activeSessionCount
}) => {
  const aggregated = useMemo(() => {
    let totalPnl = 0;
    let realizedPnl = 0;
    let unrealizedPnl = 0;
    let ltpCount = 0;
    let positionCount = 0;

    Object.values(sessionTicks).forEach(data => {
      if (data.pnl_summary) {
        totalPnl += parseFloat(data.pnl_summary.total_pnl || '0');
        realizedPnl += parseFloat(data.pnl_summary.realized_pnl || '0');
        unrealizedPnl += parseFloat(data.pnl_summary.unrealized_pnl || '0');
      }
      if (data.ltp_store) {
        ltpCount += Object.keys(data.ltp_store).length;
      }
      if (data.open_positions) {
        positionCount += data.open_positions.length;
      }
    });

    return {
      totalPnl,
      realizedPnl,
      unrealizedPnl,
      ltpCount,
      positionCount
    };
  }, [sessionTicks]);

  const cards = [
    {
      title: 'Total P&L',
      value: aggregated.totalPnl,
      format: 'currency',
      icon: DollarSign,
      color: aggregated.totalPnl >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: aggregated.totalPnl >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
    },
    {
      title: 'Realized P&L',
      value: aggregated.realizedPnl,
      format: 'currency',
      icon: TrendingUp,
      color: aggregated.realizedPnl >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Unrealized P&L',
      value: aggregated.unrealizedPnl,
      format: 'currency',
      icon: TrendingDown,
      color: aggregated.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Active Strategies',
      value: activeSessionCount,
      format: 'number',
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'LTP Updates',
      value: aggregated.ltpCount,
      format: 'number',
      icon: Activity,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20'
    },
    {
      title: 'Position Store',
      value: aggregated.positionCount,
      format: 'number',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const displayValue = card.format === 'currency' 
          ? `${card.value >= 0 ? '+' : ''}₹${card.value.toFixed(2)}`
          : card.value.toString();

        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${card.format === 'currency' ? card.color : 'text-foreground'}`}>
                {displayValue}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
