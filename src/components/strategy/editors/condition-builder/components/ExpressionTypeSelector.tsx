
import React from 'react';
import { Expression } from '../../../utils/conditions';
import GroupedExpressionTypeSelector from './GroupedExpressionTypeSelector';

interface ExpressionTypeSelectorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  restrictToConstant?: boolean;
}

const ExpressionTypeSelector: React.FC<ExpressionTypeSelectorProps> = (props) => {
  return <GroupedExpressionTypeSelector {...props} />;
};

export default ExpressionTypeSelector;
