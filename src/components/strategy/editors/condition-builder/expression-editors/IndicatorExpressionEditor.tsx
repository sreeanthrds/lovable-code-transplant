
import React from 'react';
import { Expression, IndicatorExpression } from '../../../utils/conditions';
import IndicatorSelector from '../IndicatorSelector';
import CandleOffsetSelector from '../components/CandleOffsetSelector';

interface IndicatorExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
  conditionContext?: 'entry' | 'exit';
}

const IndicatorExpressionEditor: React.FC<IndicatorExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false,
  conditionContext = 'entry'
}) => {
  if (expression.type !== 'indicator') {
    return null;
  }

  const indicatorExpr = expression as IndicatorExpression;
  
  // Update the time offset (current, previous, etc.)
  const updateOffset = (value: number) => {
    updateExpression({
      ...indicatorExpr,
      offset: value
    });
  };

  return (
    <div className="space-y-2">
      <IndicatorSelector
        expression={expression}
        updateExpression={updateExpression}
        required={required}
        conditionContext={conditionContext}
      />
      
      {/* Only show offset selector if an indicator is selected */}
      {indicatorExpr.name && (
        <CandleOffsetSelector 
          offset={indicatorExpr.offset || 0}
          onOffsetChange={updateOffset}
          label="Look back:"
        />
      )}
    </div>
  );
};

export default IndicatorExpressionEditor;
