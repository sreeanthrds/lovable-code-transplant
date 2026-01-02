
import React from 'react';
import { BacktestResult } from '@/components/strategy/backtesting/types';
import PerformanceMetrics from './PerformanceMetrics';
import MonthlyReturnsChart from './MonthlyReturnsChart';
import TransactionsTable from './TransactionsTable';

interface ReportsGridProps {
  results: BacktestResult;
}

const ReportsGrid = ({ results }: ReportsGridProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PerformanceMetrics results={results} />
        <MonthlyReturnsChart monthlyReturns={results.monthlyReturns} />
      </div>
      <TransactionsTable transactions={results.transactions || []} />
    </>
  );
};

export default ReportsGrid;
