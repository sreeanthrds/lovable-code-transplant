
import React, { memo } from 'react';
import { ComparisonExpressionRow } from '../composite';
import { ComparisonOperator } from '../ComparisonOperatorSelector';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConditionBuilderRowProps {
  operator: ComparisonOperator;
  onOperatorChange: (value: ComparisonOperator) => void;
  leftComponent: React.ReactNode;
  rightComponent: React.ReactNode;
  onSwap?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  className?: string;
  required?: boolean;
}

const ConditionBuilderRow: React.FC<ConditionBuilderRowProps> = ({
  operator,
  onOperatorChange,
  leftComponent,
  rightComponent,
  onSwap,
  onDelete,
  canDelete = true,
  className,
  required = false
}) => {
  return (
    <div className={cn("relative group min-w-fit", className)}>
      <ComparisonExpressionRow
        operator={operator}
        onOperatorChange={onOperatorChange}
        leftComponent={leftComponent}
        rightComponent={rightComponent}
        onSwap={onSwap}
        required={required}
      />
      
      {canDelete && onDelete && (
        <div className="absolute -right-10 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ConditionBuilderRow);
