
import React from 'react';
import { Expression } from '../../../utils/conditionTypes';
import ComplexExpressionEditor from '../ComplexExpressionEditor';

interface ComplexExpressionEditorWrapperProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
  currentNodeId?: string;
}

const ComplexExpressionEditorWrapper: React.FC<ComplexExpressionEditorWrapperProps> = ({
  expression,
  updateExpression,
  required = false,
  currentNodeId
}) => {
  return (
    <ComplexExpressionEditor
      expression={expression}
      updateExpression={updateExpression}
      required={required}
      currentNodeId={currentNodeId}
    />
  );
};

export default ComplexExpressionEditorWrapper;
