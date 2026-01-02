
import React from 'react';
import UIOperationSelector from '@/components/ui/form/OperationSelector';
import type { MathOperation } from '@/components/ui/form/OperationSelector';

interface OperationSelectorProps {
  operation: MathOperation;
  updateOperation: (value: string) => void;
  required?: boolean;
}

const OperationSelector: React.FC<OperationSelectorProps> = ({ 
  operation, 
  updateOperation,
  required = false
}) => {
  return (
    <div>
      <UIOperationSelector
        value={operation}
        onValueChange={updateOperation}
        required={required}
      />
    </div>
  );
};

export default OperationSelector;
