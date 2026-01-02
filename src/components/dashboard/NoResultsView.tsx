
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NoResultsView = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">No Backtest Results</h1>
        <p className="text-foreground/70 mb-8">
          You need to run a backtest to see results here.
        </p>
        <Button onClick={() => navigate('/app/backtesting')}>
          Go to Backtesting
        </Button>
      </div>
    </div>
  );
};

export default NoResultsView;
