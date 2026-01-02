
import React from 'react';
import { 
  Expression, 
  TimeExpression
} from '../../utils/conditions';
import { cn } from '@/lib/utils';
import ComparisonOperatorSelector from '@/components/ui/form/ComparisonOperatorSelector';
import type { ComparisonOperator } from '@/components/ui/form/ComparisonOperatorSelector';
import FieldTooltip from '../shared/FieldTooltip';

interface TimeSelectorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  if (expression.type !== 'time_function') {
    return null;
  }

  const timeExpr = expression as TimeExpression;
  
  // Update the time value
  const updateTimeValue = (value: string) => {
    updateExpression({
      ...timeExpr,
      timeValue: value
    });
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Time
        </span>
        <FieldTooltip content="Select specific time to compare with current time" />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={timeExpr.timeValue || '09:00'}
          onChange={(e) => updateTimeValue(e.target.value)}
          className={cn(
            "px-3 py-1 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            required && !timeExpr.timeValue && "border-red-300 focus:ring-red-200"
          )}
        />
      </div>
    </div>
  );
};

export default TimeSelector;
