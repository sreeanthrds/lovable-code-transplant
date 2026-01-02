
import React from 'react';
import OperationSelector from '../OperationSelector';
import type { MathOperation } from '../OperationSelector';
import ExpressionWrapper from '../ExpressionWrapper';
import { cn } from '@/lib/utils';

interface MathExpressionRowProps {
  leftLabel?: string;
  rightLabel?: string;
  operation: MathOperation;
  onOperationChange: (value: MathOperation) => void;
  leftComponent: React.ReactNode;
  rightComponent: React.ReactNode;
  className?: string;
  required?: boolean;
}

const MathExpressionRow: React.FC<MathExpressionRowProps> = ({
  leftLabel = "Left Expression",
  rightLabel = "Right Expression",
  operation,
  onOperationChange,
  leftComponent,
  rightComponent,
  className,
  required = false
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="mb-2">
        <OperationSelector 
          value={operation}
          onValueChange={onOperationChange}
          required={required}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <ExpressionWrapper
          label={leftLabel}
          required={required}
        >
          {leftComponent}
        </ExpressionWrapper>
        
        <ExpressionWrapper
          label={rightLabel}
          required={required}
        >
          {rightComponent}
        </ExpressionWrapper>
      </div>
    </div>
  );
};

export default MathExpressionRow;
