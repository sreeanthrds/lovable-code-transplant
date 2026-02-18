
import React from 'react';
import { 
  Expression
} from '../../utils/conditions';
import ExpressionTypeSelector from './components/ExpressionTypeSelector';
import {
  IndicatorExpressionEditor,
  MarketDataExpressionEditor,
  LiveDataExpressionEditor,
  ConstantExpressionEditor,
  TimeExpressionEditor,
  ComplexExpressionEditorWrapper,
  FunctionExpressionEditor,
  PositionDataExpressionEditor,
  ExternalTriggerExpressionEditor,
  NodeVariableExpressionEditor,
  MathExpressionEditor,
  PositionTimeExpressionEditor,
  TimeOffsetExpressionEditor,
  CandleRangeExpressionEditor,
  ListExpressionEditor
} from './expression-editors';
import PnLExpressionEditor from './expression-editors/PnLExpressionEditor';
import UnderlyingPnLExpressionEditor from './expression-editors/UnderlyingPnLExpressionEditor';
import CurrentTimeExpressionEditor from './expression-editors/CurrentTimeExpressionEditor';
import TrailingVariableExpressionEditor from './expression-editors/TrailingVariableExpressionEditor';
import GlobalVariableExpressionEditor from './expression-editors/GlobalVariableExpressionEditor';

interface ExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  currentNodeId?: string;
  currentVariableId?: string;
  restrictToConstant?: boolean;
}

const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
  expression,
  updateExpression,
  currentNodeId,
  currentVariableId,
  restrictToConstant = false
}) => {
  // Ensure we have a valid expression object
  if (!expression || !expression.type) {
    console.warn('ExpressionEditor: Invalid or missing expression object', expression);
    
    // Create a default constant expression if none provided
    const defaultExpression: Expression = {
      type: 'constant',
      valueType: 'number',
      numberValue: 0,
      value: 0
    };
    
    updateExpression(defaultExpression);
    return null;
  }

  // Render the appropriate editor based on expression type
  const renderExpressionEditor = () => {
    try {
      // Type guard to ensure expression has a type property
      if (!expression || typeof expression.type !== 'string') {
        console.warn('ExpressionEditor: Expression missing type property', expression);
        return (
          <div className="text-xs text-red-500 p-2 border border-red-300 rounded">
            Invalid expression type
          </div>
        );
      }

      // Use the expression directly since we've validated it has a type
      const expressionType = expression.type;

      switch (expressionType) {
        case 'indicator':
          return (
            <IndicatorExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'candle_data':
          return (
            <MarketDataExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'live_data':
          return (
            <LiveDataExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'constant':
          return (
            <ConstantExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'time_function':
          return (
            <TimeExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'current_time':
          return (
            <CurrentTimeExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'position_data':
          return (
            <PositionDataExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'external_trigger':
          return (
            <ExternalTriggerExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'expression':
          return (
            <ComplexExpressionEditorWrapper
              expression={expression}
              updateExpression={updateExpression}
              currentNodeId={currentNodeId}
            />
          );
        case 'function':
          return (
            <FunctionExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
              currentNodeId={currentNodeId}
            />
          );
        case 'node_variable':
          return (
            <NodeVariableExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
              currentNodeId={currentNodeId}
              currentVariableId={currentVariableId}
            />
          );
        case 'global_variable':
          return (
            <GlobalVariableExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'pnl_data':
          return (
            <PnLExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'underlying_pnl':
          return (
            <UnderlyingPnLExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'trailing_variable':
          return (
            <TrailingVariableExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
              required={false}
            />
          );
        case 'math_expression':
          return (
            <MathExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
              currentNodeId={currentNodeId}
            />
          );
        case 'position_time':
          return (
            <PositionTimeExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'time_offset':
          return (
            <TimeOffsetExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
              currentNodeId={currentNodeId}
            />
          );
        case 'candle_range':
          return (
            <CandleRangeExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
            />
          );
        case 'list':
          return (
            <ListExpressionEditor
              expression={expression}
              updateExpression={updateExpression}
              currentNodeId={currentNodeId}
            />
          );
        default:
          console.warn('ExpressionEditor: Unknown expression type:', expressionType);
          return (
            <div className="text-xs text-red-500 p-2 border border-red-300 rounded">
              Unknown expression type: {expressionType}
            </div>
          );
      }
    } catch (error) {
      console.error('ExpressionEditor: Error rendering expression editor:', error);
      return (
        <div className="text-xs text-red-500 p-2 border border-red-300 rounded">
          Error loading expression editor
        </div>
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ExpressionTypeSelector
          expression={expression}
          updateExpression={updateExpression}
          restrictToConstant={restrictToConstant}
        />
      </div>
      
      {renderExpressionEditor()}
    </div>
  );
};

export default ExpressionEditor;
