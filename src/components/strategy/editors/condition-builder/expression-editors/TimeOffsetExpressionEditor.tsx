 import React from 'react';
 import { Expression, TimeOffsetExpression } from '../../../utils/conditions';
 import { RadioGroupField } from '../../shared';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import ExpressionEditorDialogTrigger from '../ExpressionEditorDialogTrigger';
 import { useStrategyStore } from '@/hooks/use-strategy-store';
 import { Info } from 'lucide-react';
 
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
   const strategyStore = useStrategyStore();

   const isCandles = timeOffsetExpr.offsetType === 'candles';

   // Get available timeframes and instruments from start node
   const getAvailableTimeframesAndInstruments = () => {
     const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
     if (!startNode?.data) return { timeframes: [] as string[], instruments: [] as string[] };

     const data = startNode.data as any;
     const timeframes: string[] = [];
     const instruments: string[] = [];

     if (data.tradingInstrumentConfig?.timeframes?.length) {
       instruments.push(data.tradingInstrumentConfig.exchange && data.tradingInstrumentConfig.symbol
         ? `${data.tradingInstrumentConfig.exchange}:${data.tradingInstrumentConfig.symbol}`
         : 'Trading Instrument');
       data.tradingInstrumentConfig.timeframes.forEach((tf: any) => {
         const tfStr = tf.timeframe || tf.id || '';
         if (tfStr && !timeframes.includes(tfStr)) timeframes.push(tfStr);
       });
     }

     if (data.supportingInstrumentConfig?.enabled && data.supportingInstrumentConfig?.timeframes?.length) {
       instruments.push(data.supportingInstrumentConfig.exchange && data.supportingInstrumentConfig.symbol
         ? `${data.supportingInstrumentConfig.exchange}:${data.supportingInstrumentConfig.symbol}`
         : 'Supporting Instrument');
       data.supportingInstrumentConfig.timeframes.forEach((tf: any) => {
         const tfStr = tf.timeframe || tf.id || '';
         if (tfStr && !timeframes.includes(tfStr)) timeframes.push(tfStr);
       });
     }

     return { timeframes, instruments };
   };

   const { timeframes, instruments } = isCandles ? getAvailableTimeframesAndInstruments() : { timeframes: [], instruments: [] };

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

   const offsetVal = timeOffsetExpr.offsetValue || 0;
   const direction = timeOffsetExpr.direction || 'after';

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

       {/* Candle Explanation - shown only when "candles" is selected */}
       {isCandles && (
         <div className="p-3 border border-amber-200 rounded-lg bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 space-y-2">
           <div className="flex items-center gap-1.5">
             <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
             <Label className="text-sm font-medium text-amber-700 dark:text-amber-400">
               Candle Offset Info
             </Label>
           </div>
           <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
             The <strong>current candle is excluded</strong> from the offset count.
             For example, if the timeframe is <strong>1m</strong> and current time is <strong>10:00</strong>:
           </p>
           <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 ml-4 list-disc">
             <li>
               <strong>{offsetVal} candle{offsetVal !== 1 ? 's' : ''} before</strong> → returns candle at <strong>
               {`${10}:${String(60 - offsetVal).padStart(2, '0')}`}</strong> (i.e. 10:00 excluded, count {offsetVal} back)
             </li>
             <li>
               <strong>{offsetVal} candle{offsetVal !== 1 ? 's' : ''} after</strong> → returns candle at <strong>
               {`10:${String(offsetVal).padStart(2, '0')}`}</strong> (i.e. 10:00 excluded, count {offsetVal} forward)
             </li>
           </ul>

           {/* Available Timeframes & Instruments */}
           {(timeframes.length > 0 || instruments.length > 0) && (
             <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800 space-y-1.5">
               {timeframes.length > 0 && (
                 <div className="flex items-center gap-2 flex-wrap">
                   <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Available Timeframes:</span>
                   {timeframes.map(tf => (
                     <span key={tf} className="text-xs px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200 font-mono">
                       {tf}
                     </span>
                   ))}
                 </div>
               )}
               {instruments.length > 0 && (
                 <div className="flex items-center gap-2 flex-wrap">
                   <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Instruments:</span>
                   {instruments.map(inst => (
                     <span key={inst} className="text-xs px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200">
                       {inst}
                     </span>
                   ))}
                 </div>
               )}
             </div>
           )}
         </div>
       )}
     </div>
   );
 };
 
 export default TimeOffsetExpressionEditor;