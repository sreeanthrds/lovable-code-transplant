
import React from 'react';
import { Expression } from '../../../utils/conditions';
import FieldTooltip from '../../shared/FieldTooltip';

interface CurrentTimeExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const CurrentTimeExpressionEditor: React.FC<CurrentTimeExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  if (expression.type !== 'current_time') {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-center">
          Current Time
        </div>
        <FieldTooltip content="Uses the current system time for comparison" />
      </div>
      
      <div className="p-3 bg-muted/50 rounded-md border">
        <div className="text-xs text-muted-foreground text-center">
          Current trade time
        </div>
      </div>
    </div>
  );
};

export default CurrentTimeExpressionEditor;
