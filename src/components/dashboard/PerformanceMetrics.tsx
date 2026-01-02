
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { BacktestResult } from '@/components/strategy/backtesting/types';

interface PerformanceMetricsProps {
  results: BacktestResult;
}

const PerformanceMetrics = ({ results }: PerformanceMetricsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Sharpe Ratio</TableCell>
              <TableCell className="text-right">{results.sharpeRatio.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Profit Factor</TableCell>
              <TableCell className="text-right">{results.profitFactor.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Trades</TableCell>
              <TableCell className="text-right">{results.tradesCount}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
