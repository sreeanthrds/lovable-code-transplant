
import React from 'react';
import { Condition, Expression, createConstantExpression } from '../../utils/conditions';
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
  const upperExpression = condition.rhsUpper || getDefaultExpression();

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

  const updateRhsUpper = (expr: Expression) => {
    updateCondition({
      ...condition,
      rhsUpper: expr
    });
  };

  const updateOperator = (operator: ComparisonOperator) => {
    // When switching to 'between', initialize rhsUpper if not present
    const needsUpper = operator === 'between' || operator === 'not_between';
    // When switching to 'in'/'not_in', set RHS to list expression if not already
    const needsList = operator === 'in' || operator === 'not_in';
    const newRhs = needsList && condition.rhs?.type !== 'list' 
      ? { type: 'list' as const, items: [createConstantExpression('number', 0)], aggregationType: 'none' as const }
      : condition.rhs;
    
    updateCondition({
      ...condition,
      operator,
      rhs: newRhs,
      rhsUpper: needsUpper && !condition.rhsUpper ? createConstantExpression('number', 0) : condition.rhsUpper
    });
  };

  const handleSwap = () => {
    updateCondition({
      ...condition,
      lhs: rightExpression,
      rhs: leftExpression
    });
  };

  const isBetweenOperator = condition.operator === 'between' || condition.operator === 'not_between';
  const isInOperator = condition.operator === 'in' || condition.operator === 'not_in';
  const allOperators: ComparisonOperator[] = ['>', '<', '>=', '<=', '==', '!=', 'crosses_above', 'crosses_below', 'between', 'not_between', 'in', 'not_in'];

  return (
    <div className={cn(
      "gap-4 items-center min-w-fit",
      isBetweenOperator 
        ? "grid grid-cols-[1fr_auto_1fr_auto_1fr]" 
        : "grid grid-cols-[1fr_auto_1fr]"
    )}>
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
          operators={allOperators}
        />
        {!isBetweenOperator && !isInOperator && (
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
        )}
      </div>

      {/* Right Expression (Lower bound for between) */}
      <div className="min-w-0">
        <ExpressionEditorDialogTrigger
          expression={rightExpression}
          updateExpression={updateRight}
          required={required}
          currentNodeId={currentNodeId}
          className="w-full"
        />
      </div>

      {/* Between: AND label and Upper bound */}
      {isBetweenOperator && (
        <>
          <div className="flex items-center justify-center px-2">
            <span className="text-sm font-medium text-muted-foreground">AND</span>
          </div>
          <div className="min-w-0">
            <ExpressionEditorDialogTrigger
              expression={upperExpression}
              updateExpression={updateRhsUpper}
              required={required}
              currentNodeId={currentNodeId}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SingleConditionEditor;
