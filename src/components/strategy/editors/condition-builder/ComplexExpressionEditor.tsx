
import React from 'react';
import { 
  Expression, 
  ComplexExpression
} from '../../utils/conditions';
import OperationSelector from './components/OperationSelector';
import ExpressionEditorDialogTrigger from './ExpressionEditorDialogTrigger';
import { cn } from '@/lib/utils';

interface ComplexExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
  currentNodeId?: string;
}

const ComplexExpressionEditor: React.FC<ComplexExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false,
  currentNodeId
}) => {
  if (expression.type !== 'expression') {
    return null;
  }

  const complexExpr = expression as ComplexExpression;
  
  // Ensure we have valid default expressions
  const getDefaultExpression = (): Expression => ({
    type: 'constant',
    valueType: 'number',
    numberValue: 0,
    value: 0
  });
  
  // Ensure left and right expressions are properly initialized
  const leftExpression = complexExpr.left || getDefaultExpression();
  const rightExpression = complexExpr.right || getDefaultExpression();
  
  // Update the operation (+, -, *, /, %, +%, -%)
  const updateOperation = (value: string) => {
    updateExpression({
      ...complexExpr,
      operation: value as '+' | '-' | '*' | '/' | '%' | '+%' | '-%'
    });
  };
  
  // Update the left expression
  const updateLeft = (expr: Expression) => {
    updateExpression({
      ...complexExpr,
      left: expr
    });
  };
  
  // Update the right expression
  const updateRight = (expr: Expression) => {
    updateExpression({
      ...complexExpr,
      right: expr
    });
  };

  // For percentage operations, force RHS to be constant
  const updateRightForPercentage = (expr: Expression) => {
    if (expr.type !== 'constant') {
      // If trying to set non-constant for percentage operations, convert to constant
      const defaultConstant = getDefaultExpression();
      updateExpression({
        ...complexExpr,
        right: defaultConstant
      });
    } else {
      updateExpression({
        ...complexExpr,
        right: expr
      });
    }
  };

  const isPercentageOperation = complexExpr.operation === '+%' || complexExpr.operation === '-%';
  
  // Get labels based on operation type
  const getLeftLabel = () => {
    if (complexExpr.operation === '+%') return "Value to Increase";
    if (complexExpr.operation === '-%') return "Value to Decrease";
    return "Left Expression";
  };

  const getRightLabel = () => {
    if (complexExpr.operation === '+%' || complexExpr.operation === '-%') return "Percentage (%)";
    return "Right Expression";
  };
  
  return (
    <div className={cn(
      "space-y-4 border border-border rounded-md p-4 mt-2 overflow-visible w-full",
      required && !complexExpr.operation && "border-red-300"
    )}>
      {/* Operation selector */}
      <OperationSelector 
        operation={complexExpr.operation}
        updateOperation={updateOperation}
        required={required}
      />
      
      {/* Left and right expressions using dialog editors with tooltips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpressionEditorDialogTrigger
          label={getLeftLabel()}
          expression={leftExpression}
          updateExpression={updateLeft}
          required={required}
          currentNodeId={currentNodeId}
        />
        
        <ExpressionEditorDialogTrigger
          label={getRightLabel()}
          expression={rightExpression}
          updateExpression={isPercentageOperation ? updateRightForPercentage : updateRight}
          required={required}
          currentNodeId={currentNodeId}
          restrictToConstant={isPercentageOperation}
        />
      </div>
    </div>
  );
};

export default ComplexExpressionEditor;
