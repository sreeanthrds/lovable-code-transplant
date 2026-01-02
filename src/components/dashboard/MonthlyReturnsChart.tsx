
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface MonthlyReturnsChartProps {
  monthlyReturns?: Array<{ month: string; return: number }>;
}

// CustomBar component to apply conditional colors based on value
const CustomBar = (props: any) => {
  const { fill, x, y, width, height, value } = props;
  const barColor = value >= 0 ? "#4ade80" : "#f87171";
  
  // Using rx and ry attributes instead of radius array
  return <rect x={x} y={y} width={width} height={height} fill={barColor} rx={4} ry={4} />;
};

const MonthlyReturnsChart = ({ monthlyReturns }: MonthlyReturnsChartProps) => {
  // Generate mock data if no data is provided
  const chartData = monthlyReturns || Array.from({ length: 6 }, (_, i) => ({
    month: new Date(Date.now() - (5-i) * 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' }),
    return: (Math.random() * 10 - 2) // Mock data
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Returns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                formatter={(value: any) => {
                  return typeof value === 'number' ? [`${value.toFixed(2)}%`, 'Return'] : [value, 'Return'];
                }} 
              />
              <Bar 
                dataKey="return" 
                shape={<CustomBar />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyReturnsChart;
