import React from 'react';
import { 
  Expression
} from '../../utils/conditions';
import MathExpressionBuilder from './MathExpressionBuilder';

interface ExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  currentNodeId?: string;
  currentVariableId?: string;
  restrictToConstant?: boolean;
}

/**
 * ExpressionEditor is now a wrapper around MathExpressionBuilder.
 * It allows building single expressions that can be extended with math operations.
 * - Single expression: uses the original expression format
 * - Multiple expressions with operators: uses math_expression format
 */
const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
  expression,
  updateExpression,
  currentNodeId,
  currentVariableId,
  restrictToConstant = false
}) => {
  return (
    <MathExpressionBuilder
      expression={expression}
      updateExpression={updateExpression}
      currentNodeId={currentNodeId}
      currentVariableId={currentVariableId}
      restrictToConstant={restrictToConstant}
    />
  );
};

export default ExpressionEditor;
