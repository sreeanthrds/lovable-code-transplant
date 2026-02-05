 import React from 'react';
 import { Expression, TimeOffsetExpression } from '../../../utils/conditions';
 import { RadioGroupField } from '../../shared';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import ExpressionEditorDialogTrigger from '../ExpressionEditorDialogTrigger';
 
 interface TimeOffsetExpressionEditorProps {
   expression: Expression;
   updateExpression: (expr: Expression) => void;
   currentNodeId?: string;
   required?: boolean;
 }
 
 const TimeOffsetExpressionEditor: React.FC<TimeOffsetExpressionEditorProps> = ({
   expression,
   updateExpression,
   currentNodeId,
   required = false
 }) => {
   if (expression.type !== 'time_offset') {
     return null;
   }
 
   const timeOffsetExpr = expression as TimeOffsetExpression;
 
   const offsetTypeOptions = [
     { value: 'days', label: 'Days' },
     { value: 'hours', label: 'Hours' },
     { value: 'minutes', label: 'Minutes' },
     { value: 'seconds', label: 'Seconds' },
     { value: 'candles', label: 'Candles' }
   ];
 
   const directionOptions = [
     { value: 'before', label: 'Before' },
     { value: 'after', label: 'After' }
   ];
 
   const updateBaseTime = (baseTime: Expression) => {
     updateExpression({
       ...timeOffsetExpr,
       baseTime
     });
   };
 
   const updateOffsetType = (value: string) => {
     updateExpression({
       ...timeOffsetExpr,
       offsetType: value as 'days' | 'hours' | 'minutes' | 'seconds' | 'candles'
     });
   };
 
   const updateOffsetValue = (value: number) => {
     updateExpression({
       ...timeOffsetExpr,
       offsetValue: value
     });
   };
 
   const updateDirection = (value: string) => {
     updateExpression({
       ...timeOffsetExpr,
       direction: value as 'before' | 'after'
     });
   };
 
   return (
     <div className="space-y-3">
       {/* Base Time Selection */}
       <div className="p-3 border border-blue-200 rounded-lg bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
         <Label className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 block">
           Reference Time
         </Label>
         <ExpressionEditorDialogTrigger
           expression={timeOffsetExpr.baseTime}
           updateExpression={updateBaseTime}
           required={required}
           currentNodeId={currentNodeId}
         />
       </div>
 
       {/* Offset Configuration */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
         {/* Offset Value */}
         <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
           <Label className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 block">
             Offset Value
           </Label>
           <Input
             type="number"
             value={timeOffsetExpr.offsetValue || 0}
             onChange={(e) => updateOffsetValue(parseInt(e.target.value) || 0)}
             className="w-full"
             min={0}
           />
         </div>
 
         {/* Offset Type */}
         <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
           <RadioGroupField
             label="Unit"
             value={timeOffsetExpr.offsetType || 'minutes'}
             onChange={updateOffsetType}
             options={offsetTypeOptions}
             layout="vertical"
           />
         </div>
 
         {/* Direction */}
         <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
           <RadioGroupField
             label="Direction"
             value={timeOffsetExpr.direction || 'after'}
             onChange={updateDirection}
             options={directionOptions}
             layout="vertical"
           />
         </div>
       </div>
     </div>
   );
 };
 
 export default TimeOffsetExpressionEditor;