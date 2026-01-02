
import React from 'react';
import { Expression } from '../../../utils/conditions';
import ExpressionEditor from '../ExpressionEditor';
import { cn } from '@/lib/utils';

interface ExpressionWrapperProps {
  label: string;
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
  showLabels?: boolean;
  conditionContext?: 'entry' | 'exit';
  currentNodeId?: string;
  currentVariableId?: string;
}

const ExpressionWrapper: React.FC<ExpressionWrapperProps> = ({
  label,
  expression,
  updateExpression,
  required = false,
  showLabels = true,
  conditionContext = 'entry',
  currentNodeId,
  currentVariableId
}) => {
  console.log('ExpressionWrapper rendering with expression:', expression);

  // Safety check for expression
  if (!expression) {
    console.error('ExpressionWrapper: expression is null or undefined');
    return (
      <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
        Error: Invalid expression
      </div>
    );
  }

  const handleUpdateExpression = (expr: Expression) => {
    try {
      console.log('ExpressionWrapper updating expression:', expr);
      updateExpression(expr);
    } catch (error) {
      console.error('Error in ExpressionWrapper updateExpression:', error);
    }
  };

  return (
    <div className={cn("expression-wrapper", required && "required")}>
      {showLabels && label && (
        <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-0.5 flex-nowrap">
          {label}
          {required && <span className="text-red-500 flex-shrink-0">*</span>}
        </label>
      )}
      <div className="expression-content">
        <ExpressionEditor
          expression={expression}
          updateExpression={handleUpdateExpression}
          currentNodeId={currentNodeId}
          currentVariableId={currentVariableId}
        />
      </div>
    </div>
  );
};

export default ExpressionWrapper;
