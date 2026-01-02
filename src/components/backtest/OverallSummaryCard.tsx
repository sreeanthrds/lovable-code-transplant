import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { OverallSummary } from '@/types/backtest-session';
import { cn } from '@/lib/utils';

interface OverallSummaryCardProps {
  summary: OverallSummary;
}

const OverallSummaryCard: React.FC<OverallSummaryCardProps> = ({ summary }) => {
  const totalPnl = parseFloat(summary.total_pnl);
  const isProfitable = totalPnl >= 0;

  const metrics = [
    {
      label: 'Total P&L',
      value: isProfitable ? `+${totalPnl.toFixed(2)}` : totalPnl.toFixed(2),
      icon: isProfitable ? TrendingUp : TrendingDown,
      color: isProfitable ? 'text-green-500' : 'text-red-500',
      bgColor: isProfitable ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      label: 'Win Rate',
      value: `${summary.win_rate}%`,
      icon: Target,
      color: parseFloat(summary.win_rate) >= 50 ? 'text-green-500' : 'text-amber-500',
      bgColor: parseFloat(summary.win_rate) >= 50 ? 'bg-green-500/10' : 'bg-amber-500/10',
    },
    {
      label: 'Total Trades',
      value: summary.total_trades.toString(),
      icon: BarChart3,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Days Tested',
      value: summary.total_days.toString(),
      icon: Trophy,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Largest Win',
      value: `+${parseFloat(summary.largest_win).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Largest Loss',
      value: parseFloat(summary.largest_loss).toFixed(2),
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Overall Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={cn(
                "rounded-lg p-3 text-center",
                metric.bgColor
              )}
            >
              <metric.icon className={cn("h-5 w-5 mx-auto mb-1", metric.color)} />
              <p className={cn("text-lg font-bold", metric.color)}>
                {metric.value}
              </p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallSummaryCard;
