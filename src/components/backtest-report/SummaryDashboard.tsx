import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Award,
  BarChart3
} from 'lucide-react';
import type { DailySummary } from '@/types/backtest';
import { cn } from '@/lib/utils';

interface SummaryDashboardProps {
  summary: DailySummary;
  date: string;
  currentTime?: string; // Optional current backtest time
}

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ summary, date, currentTime }) => {
  const totalPnl = typeof summary.total_pnl === 'number' ? summary.total_pnl : parseFloat(String(summary.total_pnl));
  const isProfitable = totalPnl >= 0;
  const winRate = typeof summary.win_rate === 'number' ? summary.win_rate : parseFloat(String(summary.win_rate));

  const formatPnl = (value: number) => {
    const formatted = Math.abs(value).toFixed(2);
    return value >= 0 ? `+₹${formatted}` : `-₹${formatted}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrentTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Summary</h2>
          <p className="text-muted-foreground">{formatDate(date)}</p>
          {currentTime && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Current Time: {formatCurrentTime(currentTime)}
            </p>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-lg",
          isProfitable 
            ? "bg-green-500/10 text-green-600 dark:text-green-400" 
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        )}>
          {isProfitable ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          {formatPnl(totalPnl)}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total PNL Card */}
        <Card className={cn(
          "border-l-4",
          isProfitable ? "border-l-green-500" : "border-l-red-500"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total P&L
            </CardTitle>
            {isProfitable ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              isProfitable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {formatPnl(totalPnl)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isProfitable ? 'Profitable day' : 'Loss day'}
            </p>
          </CardContent>
        </Card>

        {/* Win Rate Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.winning_trades} of {summary.total_trades} trades
            </p>
          </CardContent>
        </Card>

        {/* Realized P&L Card */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Realized P&L
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {(() => {
              const realizedPnl = parseFloat(summary.realized_pnl || '0');
              const isProfit = realizedPnl >= 0;
              return (
                <>
                  <div className={cn("text-2xl font-bold", isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {isProfit ? '+' : ''}₹{realizedPnl.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From closed trades
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Unrealized P&L Card */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unrealized P&L
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {(() => {
              const unrealizedPnl = parseFloat(summary.unrealized_pnl || '0');
              const isProfit = unrealizedPnl >= 0;
              return (
                <>
                  <div className={cn("text-2xl font-bold", isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {isProfit ? '+' : ''}₹{unrealizedPnl.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From open positions
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Win/Loss Ratio Visual */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Win/Loss Distribution</span>
                <span className="font-medium">{summary.total_trades} trades</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-muted flex">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${winRate}%` }}
                />
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                  style={{ width: `${100 - winRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-green-600 dark:text-green-400">
                  {summary.winning_trades} wins ({winRate.toFixed(1)}%)
                </span>
                <span className="text-red-600 dark:text-red-400">
                  {summary.losing_trades} losses ({(100 - winRate).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryDashboard;
