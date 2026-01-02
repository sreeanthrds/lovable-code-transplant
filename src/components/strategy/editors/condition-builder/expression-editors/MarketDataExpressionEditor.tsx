
import React from 'react';
import { 
  Expression, 
  MarketDataExpression
} from '../../../utils/conditions';
import MarketDataSelector from '../MarketDataSelector';

interface MarketDataExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const MarketDataExpressionEditor: React.FC<MarketDataExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  if (expression.type !== 'candle_data') {
    return null;
  }

  return (
    <MarketDataSelector
      expression={expression}
      updateExpression={updateExpression}
    />
  );
};

export default MarketDataExpressionEditor;
