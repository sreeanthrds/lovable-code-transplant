
import React from 'react';
import { Expression } from '../../../utils/conditions';
import ConstantValueEditor from '../components/ConstantValueEditor';

interface ConstantExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const ConstantExpressionEditor: React.FC<ConstantExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  return (
    <ConstantValueEditor
      expression={expression}
      updateExpression={updateExpression}
      required={required}
    />
  );
};

export default ConstantExpressionEditor;
