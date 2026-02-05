 import React from 'react';
 import { Expression, CandleRangeExpression } from '../../../utils/conditions';
 import { useStrategyStore } from '@/hooks/use-strategy-store';
 import { RadioGroupField } from '../../shared';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 
 interface CandleRangeExpressionEditorProps {
   expression: Expression;
   updateExpression: (expr: Expression) => void;
   required?: boolean;
 }
 
const CandleRangeExpressionEditor: React.FC<CandleRangeExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  const nodes = useStrategyStore(state => state.nodes);

  // Get start node data
  const startNode = nodes.find(node => node.type === 'startNode');
  const startNodeData = startNode?.data as any;

  // Get positions for relative range - must be before early return
  const positions = React.useMemo(() => {
    const allPositions: Array<{ vpi: string; vpt?: string }> = [];
    nodes.forEach(node => {
      if (node.type === 'entryNode' && Array.isArray(node.data?.positions)) {
        node.data.positions.forEach((position: any) => {
          if (position.vpi) {
            allPositions.push({ vpi: position.vpi, vpt: position.vpt });
          }
        });
      }
    });
    return allPositions;
  }, [nodes]);

  // Check if supporting instrument is enabled
  const supportingInstrumentEnabled = startNodeData?.supportingInstrumentEnabled === true;

  if (expression.type !== 'candle_range') {
    return null;
  }

  const candleRangeExpr = expression as CandleRangeExpression;

  // Get timeframe options from strategy based on instrument type
  const getTimeframeOptions = () => {
    const instrumentType = candleRangeExpr.instrumentType || 'TI';
    
    let timeframes = [];
    if (instrumentType === 'TI') {
      timeframes = startNodeData?.tradingInstrumentConfig?.timeframes || [];
    } else if (supportingInstrumentEnabled) {
      timeframes = startNodeData?.supportingInstrumentConfig?.timeframes || [];
    }
    
    return timeframes.map((tf: any) => ({
      value: tf.timeframe, // Use timeframe string directly as value for consistency
      label: tf.timeframe
    }));
  };

  const rangeTypeOptions = [
    { value: 'by_count', label: 'By Count (e.g., last 10 candles)' },
    { value: 'by_time', label: 'By Time (e.g., 09:15 to 10:30)' },
    { value: 'relative', label: 'Relative (e.g., 5 candles after entry)' },
    { value: 'to_current', label: 'To Current Candle (from reference to now)' }
  ];

  // Only show Supporting Instrument if enabled in start node
  const instrumentOptions = supportingInstrumentEnabled
    ? [
        { value: 'TI', label: 'Trading Instrument' },
        { value: 'SI', label: 'Supporting Instrument' }
      ]
    : [
        { value: 'TI', label: 'Trading Instrument' }
      ];

  const referenceTypeOptions = [
    { value: 'time', label: 'Specific Time' },
    { value: 'current_candle', label: 'Current Candle Time' },
    { value: 'candle_number', label: 'Candle Number (from day start)' },
    { value: 'position_entry', label: 'Position Entry' },
    { value: 'position_exit', label: 'Position Exit' }
  ];

  const startReferenceOptions = [
    { value: 'time', label: 'Specific Time' },
    { value: 'candle_number', label: 'Candle Number (from day start)' },
    { value: 'position_entry', label: 'Position Entry' },
    { value: 'position_exit', label: 'Position Exit' }
  ];

   const directionOptions = [
     { value: 'before', label: 'Before' },
     { value: 'after', label: 'After' }
   ];
 
   const updateField = (field: string, value: any) => {
     updateExpression({ ...candleRangeExpr, [field]: value });
   };
 
   return (
     <div className="space-y-3">
       {/* Instrument & Timeframe */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <div className="p-3 border border-blue-200 rounded-lg bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
           <RadioGroupField
             label="Instrument"
             value={candleRangeExpr.instrumentType || 'TI'}
             onChange={(v) => updateField('instrumentType', v)}
             options={instrumentOptions}
             layout="horizontal"
           />
         </div>
         <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
           <RadioGroupField
             label="Timeframe"
             value={candleRangeExpr.timeframeId || ''}
             onChange={(v) => updateField('timeframeId', v)}
             options={getTimeframeOptions()}
             layout="horizontal"
           />
         </div>
       </div>
 
       {/* Range Type */}
       <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
         <RadioGroupField
           label="Range Type"
           value={candleRangeExpr.rangeType || 'by_count'}
           onChange={(v) => updateField('rangeType', v)}
           options={rangeTypeOptions}
           layout="vertical"
         />
       </div>
 
       {/* Range Configuration based on type */}
       {candleRangeExpr.rangeType === 'by_count' && (
         <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
           <Label className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2 block">
             Candle Range (0 = current candle)
           </Label>
           <div className="flex items-center gap-3">
             <div className="flex-1">
               <Label className="text-xs text-muted-foreground">From</Label>
               <Input
                 type="number"
                 value={candleRangeExpr.startIndex ?? 0}
                 onChange={(e) => updateField('startIndex', parseInt(e.target.value) || 0)}
                 min={0}
               />
             </div>
             <span className="text-muted-foreground pt-5">to</span>
             <div className="flex-1">
               <Label className="text-xs text-muted-foreground">To</Label>
               <Input
                 type="number"
                 value={candleRangeExpr.endIndex ?? 5}
                 onChange={(e) => updateField('endIndex', parseInt(e.target.value) || 0)}
                 min={0}
               />
             </div>
           </div>
         </div>
       )}
 
       {candleRangeExpr.rangeType === 'by_time' && (
         <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
           <Label className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2 block">
             Time Range
           </Label>
           <div className="flex items-center gap-3">
             <div className="flex-1">
               <Label className="text-xs text-muted-foreground">Start Time</Label>
               <Input
                 type="time"
                 value={candleRangeExpr.startTime || '09:15'}
                 onChange={(e) => updateField('startTime', e.target.value)}
               />
             </div>
             <span className="text-muted-foreground pt-5">to</span>
             <div className="flex-1">
               <Label className="text-xs text-muted-foreground">End Time</Label>
               <Input
                 type="time"
                 value={candleRangeExpr.endTime || '15:30'}
                 onChange={(e) => updateField('endTime', e.target.value)}
               />
             </div>
           </div>
         </div>
       )}
 
       {candleRangeExpr.rangeType === 'relative' && (
         <div className="space-y-3">
           <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
             <RadioGroupField
               label="Reference Point"
               value={candleRangeExpr.referenceType || 'time'}
               onChange={(v) => updateField('referenceType', v)}
               options={referenceTypeOptions}
               layout="vertical"
             />
           </div>
 
           {candleRangeExpr.referenceType === 'time' && (
             <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
               <Label className="text-sm font-medium mb-2 block">Reference Time</Label>
               <Input
                 type="time"
                 value={candleRangeExpr.referenceTime || '09:15'}
                 onChange={(e) => updateField('referenceTime', e.target.value)}
               />
             </div>
           )}
 
           {candleRangeExpr.referenceType === 'candle_number' && (
             <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
               <Label className="text-sm font-medium mb-2 block">Candle Number (from day start)</Label>
               <Input
                 type="number"
                 value={candleRangeExpr.referenceCandleNumber ?? 1}
                 onChange={(e) => updateField('referenceCandleNumber', parseInt(e.target.value) || 1)}
                 min={1}
               />
             </div>
           )}
 
           {(candleRangeExpr.referenceType === 'position_entry' || candleRangeExpr.referenceType === 'position_exit') && (
             <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
               <RadioGroupField
                 label="Position"
                 value={candleRangeExpr.referenceVpi || ''}
                 onChange={(v) => updateField('referenceVpi', v)}
                 options={positions.map(p => ({ value: p.vpi, label: p.vpt || p.vpi }))}
                 layout="horizontal"
               />
             </div>
           )}
 
           <div className="grid grid-cols-2 gap-3">
             <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
               <Label className="text-sm font-medium mb-2 block">Number of Candles</Label>
               <Input
                 type="number"
                 value={candleRangeExpr.candleCount ?? 5}
                 onChange={(e) => updateField('candleCount', parseInt(e.target.value) || 1)}
                 min={1}
               />
             </div>
             <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
               <RadioGroupField
                 label="Direction"
                 value={candleRangeExpr.direction || 'after'}
                 onChange={(v) => updateField('direction', v)}
                 options={directionOptions}
                 layout="horizontal"
               />
             </div>
           </div>
         </div>
       )}

      {candleRangeExpr.rangeType === 'to_current' && (
        <div className="space-y-3">
          <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
            <RadioGroupField
              label="Start From"
              value={candleRangeExpr.referenceType || 'time'}
              onChange={(v) => updateField('referenceType', v)}
              options={startReferenceOptions}
              layout="vertical"
            />
          </div>

          {candleRangeExpr.referenceType === 'time' && (
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
              <Label className="text-sm font-medium mb-2 block">Start Time</Label>
              <Input
                type="time"
                value={candleRangeExpr.referenceTime || '09:15'}
                onChange={(e) => updateField('referenceTime', e.target.value)}
              />
            </div>
          )}

          {candleRangeExpr.referenceType === 'candle_number' && (
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
              <Label className="text-sm font-medium mb-2 block">Start Candle Number (from day start)</Label>
              <Input
                type="number"
                value={candleRangeExpr.referenceCandleNumber ?? 1}
                onChange={(e) => updateField('referenceCandleNumber', parseInt(e.target.value) || 1)}
                min={1}
              />
            </div>
          )}

          {(candleRangeExpr.referenceType === 'position_entry' || candleRangeExpr.referenceType === 'position_exit') && (
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
              <RadioGroupField
                label="Position"
                value={candleRangeExpr.referenceVpi || ''}
                onChange={(v) => updateField('referenceVpi', v)}
                options={positions.map(p => ({ value: p.vpi, label: p.vpt || p.vpi }))}
                layout="horizontal"
              />
            </div>
          )}

          <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
            <Label className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 block">
              End: Current Candle
            </Label>
            <p className="text-xs text-muted-foreground">
              Range will include all candles from the start reference up to and including the current candle.
            </p>
          </div>
        </div>
      )}
     </div>
   );
 };
 
 export default CandleRangeExpressionEditor;