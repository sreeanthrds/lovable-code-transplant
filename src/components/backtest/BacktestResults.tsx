import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';

interface BacktestResults {
  status: string;
  strategy_id: string;
  start_date: string;
  end_date: string;
  user_id: string;
  performance: {
    total_return: number;
    win_rate: number;
    sharpe_ratio: number;
    max_drawdown: number;
    total_trades: number;
    profit_factor: number;
  };
  trades: Array<{
    id: number;
    symbol: string;
    entry: number;
    exit: number;
    pnl: number;
    date: string;
  }>;
  equity_curve: Array<{
    date: string;
    value: number;
  }>;
}

interface BacktestResultsProps {
  results: BacktestResults;
}

const BacktestResults: React.FC<BacktestResultsProps> = ({ results }) => {
  const { performance, trades, equity_curve } = results;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getReturnColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getReturnIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            {React.createElement(getReturnIcon(performance.total_return), {
              className: `h-4 w-4 ${getReturnColor(performance.total_return)}`
            })}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getReturnColor(performance.total_return)}`}>
              {formatPercentage(performance.total_return)}
            </div>
            <p className="text-xs text-muted-foreground">
              Since {results.start_date}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(performance.win_rate)}
            </div>
            <Progress value={performance.win_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.sharpe_ratio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatPercentage(performance.max_drawdown)}
            </div>
            <p className="text-xs text-muted-foreground">
              Worst losing streak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.total_trades}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.profit_factor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross profit / Gross loss
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {results.start_date} to {results.end_date}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((new Date(results.end_date).getTime() - new Date(results.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trades.slice(0, 10).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{trade.symbol}</Badge>
                  <div className="text-sm">
                    <p className="font-medium">
                      {formatCurrency(trade.entry)} → {formatCurrency(trade.exit)}
                    </p>
                    <p className="text-muted-foreground">{trade.date}</p>
                  </div>
                </div>
                <div className={`text-right ${getReturnColor(trade.pnl)}`}>
                  <p className="font-bold">{formatCurrency(trade.pnl)}</p>
                  <p className="text-xs">
                    {formatPercentage(((trade.exit - trade.entry) / trade.entry) * 100)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equity Curve Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {equity_curve.map((point, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{point.date}</span>
                <span className="font-mono">{formatCurrency(point.value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BacktestResults;