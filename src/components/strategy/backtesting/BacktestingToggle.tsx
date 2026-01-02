
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart } from 'lucide-react';
import { useBacktestingStore } from './useBacktestingStore';
import { Link } from 'react-router-dom';

interface BacktestingToggleProps {
  onToggle?: () => void;
  isOpen?: boolean;
  mode?: 'toggle' | 'link';
}

const BacktestingToggle = ({ 
  onToggle, 
  isOpen = false, 
  mode = 'toggle' 
}: BacktestingToggleProps) => {
  const { results } = useBacktestingStore();
  
  const handleToggle = () => {
    if (onToggle) {
      console.log("Backtest toggle clicked, current isOpen:", isOpen);
      onToggle();
    }
  };
  
  // If in link mode, show a button to navigate to the dashboard
  if (mode === 'link' && results) {
    return (
      <Link to="/app/dashboard">
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2 border-green-500"
        >
          <LineChart className="h-4 w-4" />
          <span className="hidden sm:inline">
            View Results
          </span>
        </Button>
      </Link>
    );
  }
  
  // Default toggle behavior
  return (
    <Button
      variant={results ? "default" : "outline"}
      size="sm"
      className={`flex items-center gap-2 ${isOpen ? 'bg-muted' : ''} ${results ? 'border-green-500' : ''}`}
      onClick={handleToggle}
    >
      <BarChart className="h-4 w-4" />
      <span className="hidden sm:inline">
        {results ? `Results: +${typeof results.totalReturn === 'number' ? results.totalReturn.toFixed(1) : '0'}%` : 'Backtest'}
      </span>
      {isOpen ? (
        <svg width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
          <path d="M0 0H6L3 4L0 0Z" fill="currentColor" />
        </svg>
      ) : (
        <svg width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
          <path d="M0 4H6L3 0L0 4Z" fill="currentColor" />
        </svg>
      )}
    </Button>
  );
};

export default BacktestingToggle;
