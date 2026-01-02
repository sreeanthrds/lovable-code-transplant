import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onClearResults: () => void;
}

const DashboardHeader = ({ onClearResults }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6 pt-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Results Dashboard</h1>
        <p className="text-foreground/70">
          Analysis and performance metrics from your backtest
        </p>
      </div>
      <div className="space-x-2">
        <Button variant="outline" onClick={onClearResults}>Clear Results</Button>
        <Button onClick={() => navigate('/app/backtesting')}>New Backtest</Button>
        <Link to="/documentation" className="text-sm font-medium">
          Documentation
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
