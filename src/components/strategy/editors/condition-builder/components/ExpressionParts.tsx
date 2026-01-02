
import React from 'react';
import { Expression } from '../../../utils/conditions';
import ExpressionEditor from '../ExpressionEditor';
import { cn } from '@/lib/utils';

interface ExpressionPartsProps {
  leftExpression: Expression;
  rightExpression: Expression;
  updateLeft: (expr: Expression) => void;
  updateRight: (expr: Expression) => void;
  required?: boolean;
  showLabels?: boolean;
}

const ExpressionParts: React.FC<ExpressionPartsProps> = ({
  leftExpression,
  rightExpression,
  updateLeft,
  updateRight,
  required = false,
  showLabels = true
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {showLabels && (
          <label className="text-xs font-medium text-muted-foreground">
            Left Expression
          </label>
        )}
        <div className={cn(
          "min-h-[60px]",
          required && (!leftExpression || !leftExpression.type) && "border border-red-300 rounded-md p-2"
        )}>
          <ExpressionEditor
            expression={leftExpression}
            updateExpression={updateLeft}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        {showLabels && (
          <label className="text-xs font-medium text-muted-foreground">
            Right Expression
          </label>
        )}
        <div className={cn(
          "min-h-[60px]",
          required && (!rightExpression || !rightExpression.type) && "border border-red-300 rounded-md p-2"
        )}>
          <ExpressionEditor
            expression={rightExpression}
            updateExpression={updateRight}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpressionParts;
