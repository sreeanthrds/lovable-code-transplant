
import React from 'react';
import { Expression } from '../../../utils/conditions';
import ExpressionEditorDialogTrigger from '../ExpressionEditorDialogTrigger';

interface ExpressionWrapperDialogProps {
  label?: string;
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  currentNodeId?: string;
  required?: boolean;
  className?: string;
}

const ExpressionWrapperDialog: React.FC<ExpressionWrapperDialogProps> = ({
  label,
  expression,
  updateExpression,
  currentNodeId,
  required = false,
  className = ""
}) => {
  return (
    <ExpressionEditorDialogTrigger
      label={label}
      expression={expression}
      updateExpression={updateExpression}
      currentNodeId={currentNodeId}
      required={required}
      className={className}
    />
  );
};

export default ExpressionWrapperDialog;
