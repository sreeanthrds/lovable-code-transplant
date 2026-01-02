
import React from 'react';
import ComparisonOperatorSelector from '@/components/ui/form/ComparisonOperatorSelector';
import type { ComparisonOperator } from '@/components/ui/form/ComparisonOperatorSelector';

interface OperatorSelectorProps {
  operator: ComparisonOperator;
  updateOperator: (value: string) => void;
}

const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  operator,
  updateOperator
}) => {
  return (
    <ComparisonOperatorSelector
      value={operator}
      onValueChange={updateOperator}
    />
  );
};

export default OperatorSelector;
