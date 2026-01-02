
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ToolbarButton from './ToolbarButton';

const ResetButton: React.FC = () => {
  const [searchParams] = useSearchParams();
  const hasStrategyId = Boolean(searchParams.get('id'));

  const handleReset = () => {
    // Implementation would depend on your reset logic
    console.log('Reset strategy clicked');
  };

  return (
    <ToolbarButton
      icon={RefreshCw}
      label="Reset"
      onClick={handleReset}
      disabled={!hasStrategyId}
      tooltip="Reset the strategy to its initial state"
    />
  );
};

export default ResetButton;
