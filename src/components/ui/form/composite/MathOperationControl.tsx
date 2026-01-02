
import React from 'react';
import EnhancedOperationSelector from '../enhanced/EnhancedOperationSelector';
import type { MathOperation } from '../OperationSelector';
import { cn } from '@/lib/utils';

interface MathOperationControlProps {
  label: string;
  value: MathOperation;
  onChange: (value: MathOperation) => void;
  id?: string;
  required?: boolean;
  error?: string;
  className?: string;
  description?: string;
  isLoading?: boolean;
}

const MathOperationControl: React.FC<MathOperationControlProps> = ({
  label,
  value,
  onChange,
  id,
  required = false,
  error,
  className,
  description,
  isLoading = false
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      <EnhancedOperationSelector
        id={id}
        label={label}
        value={value}
        onValueChange={onChange}
        isRequired={required}
        error={error}
        description={description}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MathOperationControl;
