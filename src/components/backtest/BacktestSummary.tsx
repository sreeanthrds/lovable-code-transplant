import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Target, Award, XCircle } from 'lucide-react';
import { OverallSummary } from '@/lib/api/backtest-api';
import { cn } from '@/lib/utils';

interface BacktestSummaryProps {
  summary: OverallSummary;
  startDate: string;
  endDate: string;
}

const BacktestSummary: React.FC<BacktestSummaryProps> = ({ summary, startDate, endDate }) => {
  const isProfitable = summary.total_pnl >= 0;

  const metrics = [
    {
      label: 'Total PNL',
      value: `₹${summary.total_pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: isProfitable ? TrendingUp : TrendingDown,
      color: isProfitable ? 'text-green-500' : 'text-red-500',
      bgColor: isProfitable ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      label: 'Win Rate',
      value: `${summary.win_rate.toFixed(1)}%`,
      icon: Target,
      color: summary.win_rate >= 50 ? 'text-green-500' : 'text-amber-500',
      bgColor: summary.win_rate >= 50 ? 'bg-green-500/10' : 'bg-amber-500/10',
    },
    {
      label: 'Total Trades',
      value: summary.total_positions.toString(),
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Winning Trades',
      value: summary.total_winning_trades.toString(),
      icon: Award,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Losing Trades',
      value: summary.total_losing_trades.toString(),
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Overall Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            {startDate} to {endDate}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className={cn(
                  'p-4 rounded-lg border',
                  metric.bgColor
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={cn('w-4 h-4', metric.color)} />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <p className={cn('text-xl font-bold', metric.color)}>{metric.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BacktestSummary;
