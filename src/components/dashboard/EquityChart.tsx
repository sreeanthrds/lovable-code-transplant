
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BacktestResult } from '@/components/strategy/backtesting/types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface EquityChartProps {
  equityCurve: BacktestResult['equityCurve'];
}

const EquityChart = ({ equityCurve }: EquityChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equity Curve</CardTitle>
        <CardDescription>Growth of capital over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => {
                  return typeof value === 'number' ? [`$${value.toFixed(2)}`, 'Equity'] : [value, 'Equity'];
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="equity" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquityChart;
