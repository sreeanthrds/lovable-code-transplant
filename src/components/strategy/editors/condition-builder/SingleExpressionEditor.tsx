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
   FunctionExpressionEditor,
   PositionDataExpressionEditor,
   ExternalTriggerExpressionEditor,
   NodeVariableExpressionEditor,
 } from './expression-editors';
 import PnLExpressionEditor from './expression-editors/PnLExpressionEditor';
 import UnderlyingPnLExpressionEditor from './expression-editors/UnderlyingPnLExpressionEditor';
 import CurrentTimeExpressionEditor from './expression-editors/CurrentTimeExpressionEditor';
 import TrailingVariableExpressionEditor from './expression-editors/TrailingVariableExpressionEditor';
 
 interface SingleExpressionEditorProps {
   expression: Expression;
   updateExpression: (expr: Expression) => void;
   currentNodeId?: string;
   currentVariableId?: string;
   restrictToConstant?: boolean;
 }
 
 /**
  * SingleExpressionEditor handles editing of a single expression (not nested/math).
  * It shows the type selector and the appropriate editor for the selected type.
  * This is used within the MathExpressionBuilder for each expression item.
  */
 const SingleExpressionEditor: React.FC<SingleExpressionEditorProps> = ({
   expression,
   updateExpression,
   currentNodeId,
   currentVariableId,
   restrictToConstant = false
 }) => {
   // Ensure we have a valid expression object
   if (!expression || !expression.type) {
     console.warn('SingleExpressionEditor: Invalid or missing expression object', expression);
     
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
         console.warn('SingleExpressionEditor: Expression missing type property', expression);
         return (
           <div className="text-xs text-destructive p-2 border border-destructive/30 rounded">
             Invalid expression type
           </div>
         );
       }
 
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
         default:
           console.warn('SingleExpressionEditor: Unknown expression type:', expressionType);
           return (
             <div className="text-xs text-destructive p-2 border border-destructive/30 rounded">
               Unknown expression type: {expressionType}
             </div>
           );
       }
     } catch (error) {
       console.error('SingleExpressionEditor: Error rendering expression editor:', error);
       return (
         <div className="text-xs text-destructive p-2 border border-destructive/30 rounded">
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
 
 export default SingleExpressionEditor;