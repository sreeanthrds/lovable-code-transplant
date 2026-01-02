
import React from 'react';
import { Condition, Expression } from '../../utils/conditions';
import ExpressionEditorDialogTrigger from './ExpressionEditorDialogTrigger';
import ComparisonOperatorSelector from '@/components/ui/form/ComparisonOperatorSelector';
import type { ComparisonOperator } from '@/components/ui/form/ComparisonOperatorSelector';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SingleConditionEditorProps {
  condition: Condition;
  updateCondition: (condition: Condition) => void;
  currentNodeId?: string;
  required?: boolean;
  conditionContext?: 'entry' | 'exit';
}

const SingleConditionEditor: React.FC<SingleConditionEditorProps> = ({
  condition,
  updateCondition,
  currentNodeId,
  required = false,
  conditionContext = 'entry'
}) => {
  // Default expressions if none provided
  const getDefaultExpression = (): Expression => ({
    type: 'constant',
    valueType: 'number',
    numberValue: 0,
    value: 0
  });

  const leftExpression = condition.lhs || getDefaultExpression();
  const rightExpression = condition.rhs || getDefaultExpression();

  const updateLeft = (expr: Expression) => {
    updateCondition({
      ...condition,
      lhs: expr
    });
  };

  const updateRight = (expr: Expression) => {
    updateCondition({
      ...condition,
      rhs: expr
    });
  };

  const updateOperator = (operator: ComparisonOperator) => {
    updateCondition({
      ...condition,
      operator
    });
  };

  const handleSwap = () => {
    updateCondition({
      ...condition,
      lhs: rightExpression,
      rhs: leftExpression
    });
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center min-w-fit">
      {/* Left Expression */}
      <div className="min-w-0">
        <ExpressionEditorDialogTrigger
          expression={leftExpression}
          updateExpression={updateLeft}
          required={required}
          currentNodeId={currentNodeId}
          className="w-full"
        />
      </div>

      {/* Comparison Operator with Swap */}
      <div className="flex flex-col items-center gap-2 min-w-fit">
        <ComparisonOperatorSelector
          value={condition.operator}
          onValueChange={updateOperator}
          className="h-10 w-20"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSwap}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Swap left and right sides"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Expression */}
      <div className="min-w-0">
        <ExpressionEditorDialogTrigger
          expression={rightExpression}
          updateExpression={updateRight}
          required={required}
          currentNodeId={currentNodeId}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SingleConditionEditor;
