
import React from 'react';
import { Expression } from '../../../utils/conditions';
import TimeSelector from '../TimeSelector';

interface TimeExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const TimeExpressionEditor: React.FC<TimeExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  return (
    <TimeSelector
      expression={expression}
      updateExpression={updateExpression}
      required={required}
    />
  );
};

export default TimeExpressionEditor;
