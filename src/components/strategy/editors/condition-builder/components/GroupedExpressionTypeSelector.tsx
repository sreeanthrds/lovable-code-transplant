import React from 'react';
import { Expression } from '../../../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import TabbedExpressionTypeSelector from './TabbedExpressionTypeSelector';

interface GroupedExpressionTypeSelectorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  restrictToConstant?: boolean;
}

const GroupedExpressionTypeSelector: React.FC<GroupedExpressionTypeSelectorProps> = ({
  expression,
  updateExpression,
  restrictToConstant = false
}) => {
  return (
    <TabbedExpressionTypeSelector
      expression={expression}
      updateExpression={updateExpression}
      restrictToConstant={restrictToConstant}
    />
  );
};

export default GroupedExpressionTypeSelector;