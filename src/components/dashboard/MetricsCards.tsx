
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BacktestResult } from '@/components/strategy/backtesting/types';

interface MetricsCardsProps {
  results: BacktestResult;
}

const MetricsCards = ({ results }: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-success">+{results.totalReturn.toFixed(2)}%</CardTitle>
          <CardDescription>Total Return</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-info">{results.winRate.toFixed(1)}%</CardTitle>
          <CardDescription>Win Rate</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-destructive">-{results.maxDrawdown.toFixed(2)}%</CardTitle>
          <CardDescription>Max Drawdown</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default MetricsCards;
