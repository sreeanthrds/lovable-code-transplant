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
    const timeOffsetExpr = expression as TimeOffsetExpression;
    const strategyStore = useStrategyStore();
    const isCandles = expression.type === 'time_offset' && timeOffsetExpr.offsetType === 'candles';

    // Get available timeframes and instruments from start node
    const getAvailableTimeframesAndInstruments = () => {
      const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
      const data = startNode?.data as any;
      const timeframes: { value: string; label: string }[] = [];
      const instruments: { value: string; label: string }[] = [];

      const tradingTimeframes = data?.tradingInstrumentConfig?.timeframes || [];
      const supportingTimeframes = data?.supportingInstrumentConfig?.timeframes || [];

      if (tradingTimeframes.length > 0) {
        instruments.push({ value: 'TI', label: 'Trading Instrument' });
        tradingTimeframes.forEach((tf: any) => {
          const tfStr = tf.timeframe || tf.id || '';
          if (tfStr && !timeframes.some(t => t.value === tfStr)) {
            timeframes.push({ value: tfStr, label: tfStr });
          }
        });
      }

      if (data?.supportingInstrumentEnabled && supportingTimeframes.length > 0) {
        instruments.push({ value: 'SI', label: 'Supporting Instrument' });
        supportingTimeframes.forEach((tf: any) => {
          const tfStr = tf.timeframe || tf.id || '';
          if (tfStr && !timeframes.some(t => t.value === tfStr)) {
            timeframes.push({ value: tfStr, label: tfStr });
          }
        });
      }

      // Fallback defaults
      if (instruments.length === 0) {
        instruments.push({ value: 'TI', label: 'Trading Instrument' });
      }
      if (timeframes.length === 0) {
        timeframes.push({ value: '1m', label: '1m' });
      }

      return { timeframes, instruments };
    };

    const { timeframes, instruments } = isCandles ? getAvailableTimeframesAndInstruments() : { timeframes: [], instruments: [] };

    const selectedTimeframe = timeOffsetExpr.candleTimeframe || (timeframes.length > 0 ? timeframes[0].value : '');
    const selectedInstrument = timeOffsetExpr.candleInstrument || (instruments.length > 0 ? instruments[0].value : '');

    // Auto-persist default timeframe/instrument when candles is selected
    React.useEffect(() => {
      if (isCandles) {
        const needsUpdate =
          (!timeOffsetExpr.candleTimeframe && selectedTimeframe) ||
          (!timeOffsetExpr.candleInstrument && selectedInstrument);
        if (needsUpdate) {
          updateExpression({
            ...timeOffsetExpr,
            candleTimeframe: selectedTimeframe,
            candleInstrument: selectedInstrument
          });
        }
      }
    }, [isCandles, selectedTimeframe, selectedInstrument, timeOffsetExpr.candleTimeframe, timeOffsetExpr.candleInstrument]);

    if (expression.type !== 'time_offset') {
      return null;
    }

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

   const updateCandleTimeframe = (value: string) => {
     updateExpression({
       ...timeOffsetExpr,
       candleTimeframe: value
     });
   };

   const updateCandleInstrument = (value: string) => {
     updateExpression({
       ...timeOffsetExpr,
       candleInstrument: value
     });
   };

   const offsetVal = timeOffsetExpr.offsetValue || 0;

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
       <div className={`grid grid-cols-1 gap-3 ${isCandles ? 'md:grid-cols-5' : 'md:grid-cols-3'}`}>
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

         {/* Timeframe selector - only when candles */}
         {isCandles && timeframes.length > 0 && (
           <div className="p-3 border border-cyan-200 rounded-lg bg-cyan-50/50 dark:border-cyan-800 dark:bg-cyan-950/30">
             <RadioGroupField
               label="Timeframe"
               value={selectedTimeframe}
               onChange={updateCandleTimeframe}
               options={timeframes}
               layout="vertical"
             />
           </div>
         )}

         {/* Instrument selector - only when candles */}
         {isCandles && instruments.length > 0 && (
           <div className="p-3 border border-teal-200 rounded-lg bg-teal-50/50 dark:border-teal-800 dark:bg-teal-950/30">
             <RadioGroupField
               label="Instrument"
               value={selectedInstrument}
               onChange={updateCandleInstrument}
               options={instruments}
               layout="vertical"
             />
           </div>
         )}
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
             For example, if the timeframe is <strong>{selectedTimeframe || '1m'}</strong> and current time is <strong>10:00</strong>:
           </p>
           <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 ml-4 list-disc">
             <li>
               <strong>{offsetVal} candle{offsetVal !== 1 ? 's' : ''} before</strong> → excludes 10:00, counts {offsetVal} back
             </li>
             <li>
               <strong>{offsetVal} candle{offsetVal !== 1 ? 's' : ''} after</strong> → excludes 10:00, counts {offsetVal} forward
             </li>
           </ul>
         </div>
       )}
     </div>
   );
 };
 
 export default TimeOffsetExpressionEditor;