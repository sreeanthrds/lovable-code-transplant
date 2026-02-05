 import React from 'react';
 import { Expression, AggregationExpression, createConstantExpression, createCandleRangeExpression } from '../../../utils/conditions';
 import { RadioGroupField } from '../../shared';
 import { Button } from '@/components/ui/button';
 import { Plus, X } from 'lucide-react';
 import ExpressionEditorDialogTrigger from '../ExpressionEditorDialogTrigger';
 import CandleRangeExpressionEditor from './CandleRangeExpressionEditor';
 
 interface AggregationExpressionEditorProps {
   expression: Expression;
   updateExpression: (expr: Expression) => void;
   currentNodeId?: string;
   required?: boolean;
 }
 
 const AggregationExpressionEditor: React.FC<AggregationExpressionEditorProps> = ({
   expression,
   updateExpression,
   currentNodeId,
   required = false
 }) => {
   if (expression.type !== 'aggregation') {
     return null;
   }
 
   const aggExpr = expression as AggregationExpression;
 
   const aggregationTypeOptions = [
     { value: 'min', label: 'Min' },
     { value: 'max', label: 'Max' },
     { value: 'avg', label: 'Average' },
     { value: 'sum', label: 'Sum' },
     { value: 'first', label: 'First' },
     { value: 'last', label: 'Last' },
     { value: 'count', label: 'Count' }
   ];
 
   const sourceTypeOptions = [
     { value: 'candle_range', label: 'Candle Range' },
     { value: 'expression_list', label: 'List of Expressions' }
   ];
 
   const ohlcvOptions = [
     { value: 'open', label: 'Open' },
     { value: 'high', label: 'High' },
     { value: 'low', label: 'Low' },
     { value: 'close', label: 'Close' },
     { value: 'volume', label: 'Volume' }
   ];
 
   const updateField = (field: string, value: any) => {
     updateExpression({ ...aggExpr, [field]: value });
   };
 
   const updateCandleRange = (range: Expression) => {
     if (range.type === 'candle_range') {
       updateExpression({ ...aggExpr, candleRange: range });
     }
   };
 
   const addExpressionItem = () => {
     const newExpressions = [...(aggExpr.expressions || []), createConstantExpression('number', 0)];
     updateExpression({ ...aggExpr, expressions: newExpressions });
   };
 
   const removeExpressionItem = (index: number) => {
     const newExpressions = [...(aggExpr.expressions || [])];
     newExpressions.splice(index, 1);
     updateExpression({ ...aggExpr, expressions: newExpressions.length > 0 ? newExpressions : [createConstantExpression('number', 0)] });
   };
 
   const updateExpressionItem = (index: number, newExpr: Expression) => {
     const newExpressions = [...(aggExpr.expressions || [])];
     newExpressions[index] = newExpr;
     updateExpression({ ...aggExpr, expressions: newExpressions });
   };
 
   return (
     <div className="space-y-3">
       {/* Aggregation Type */}
       <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
         <RadioGroupField
           label="Aggregation Function"
           value={aggExpr.aggregationType || 'max'}
           onChange={(v) => updateField('aggregationType', v)}
           options={aggregationTypeOptions}
           layout="horizontal"
         />
       </div>
 
       {/* Source Type */}
       <div className="p-3 border border-blue-200 rounded-lg bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
         <RadioGroupField
           label="Data Source"
           value={aggExpr.sourceType || 'candle_range'}
           onChange={(v) => {
             updateExpression({
               ...aggExpr,
               sourceType: v as 'candle_range' | 'expression_list',
               candleRange: v === 'candle_range' ? (aggExpr.candleRange || createCandleRangeExpression()) : undefined,
               expressions: v === 'expression_list' ? (aggExpr.expressions || [createConstantExpression('number', 0)]) : undefined
             });
           }}
           options={sourceTypeOptions}
           layout="horizontal"
         />
       </div>
 
       {/* Candle Range Configuration */}
       {aggExpr.sourceType === 'candle_range' && (
         <>
           {/* OHLCV Field for aggregation */}
           <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
             <RadioGroupField
               label="OHLCV Field"
               value={aggExpr.ohlcvField || 'close'}
               onChange={(v) => updateField('ohlcvField', v)}
               options={ohlcvOptions}
               layout="horizontal"
             />
           </div>
 
           {/* Candle Range */}
           <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
             <div className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">
               Candle Range
             </div>
             <CandleRangeExpressionEditor
               expression={aggExpr.candleRange || createCandleRangeExpression()}
               updateExpression={updateCandleRange}
               required={required}
             />
           </div>
         </>
       )}
 
       {/* Expression List Configuration */}
       {aggExpr.sourceType === 'expression_list' && (
         <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
           <div className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">
             Expressions
           </div>
           <div className="space-y-2">
             {(aggExpr.expressions || []).map((expr, index) => (
               <div key={index} className="flex items-center gap-2">
                 <div className="flex-1">
                   <ExpressionEditorDialogTrigger
                     expression={expr}
                     updateExpression={(newExpr) => updateExpressionItem(index, newExpr)}
                     currentNodeId={currentNodeId}
                   />
                 </div>
                 {(aggExpr.expressions?.length || 0) > 1 && (
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => removeExpressionItem(index)}
                     className="h-8 w-8 text-destructive hover:text-destructive"
                   >
                     <X className="h-4 w-4" />
                   </Button>
                 )}
               </div>
             ))}
             <Button
               variant="outline"
               size="sm"
               onClick={addExpressionItem}
               className="w-full mt-2"
             >
               <Plus className="h-4 w-4 mr-1" /> Add Expression
             </Button>
           </div>
         </div>
       )}
     </div>
   );
 };
 
 export default AggregationExpressionEditor;