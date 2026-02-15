import React from 'react';
import { Expression, TimeOffsetExpression } from '../../../utils/conditions';
import { RadioGroupField } from '../../shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ExpressionEditorDialogTrigger from '../ExpressionEditorDialogTrigger';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { Info, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const direction = timeOffsetExpr.direction || 'after';
  const isAfter = direction === 'after';

  const unitOptions = [
    { value: 'days', label: 'Days' },
    { value: 'hours', label: 'Hours' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'seconds', label: 'Seconds' },
    { value: 'candles', label: 'Candles' }
  ];

  const updateBaseTime = (baseTime: Expression) => {
    updateExpression({ ...timeOffsetExpr, baseTime });
  };

  const toggleDirection = () => {
    updateExpression({
      ...timeOffsetExpr,
      direction: isAfter ? 'before' : 'after'
    });
  };

  const updateOffsetType = (value: string) => {
    updateExpression({
      ...timeOffsetExpr,
      offsetType: value as 'days' | 'hours' | 'minutes' | 'seconds' | 'candles'
    });
  };

  const updateOffsetValue = (value: number) => {
    updateExpression({ ...timeOffsetExpr, offsetValue: value });
  };

  const updateCandleTimeframe = (value: string) => {
    updateExpression({ ...timeOffsetExpr, candleTimeframe: value });
  };

  const updateCandleInstrument = (value: string) => {
    updateExpression({ ...timeOffsetExpr, candleInstrument: value });
  };

  const offsetVal = timeOffsetExpr.offsetValue || 0;

  return (
    <div className="space-y-3">
      {/* Arithmetic expression row: [base time] [+/-] [number] [unit] */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Base Time */}
        <div className="flex-1 min-w-[180px] p-2 border border-blue-200 rounded-lg bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
          <Label className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1 block">
            Reference Time
          </Label>
          <ExpressionEditorDialogTrigger
            expression={timeOffsetExpr.baseTime}
            updateExpression={updateBaseTime}
            required={required}
            currentNodeId={currentNodeId}
          />
        </div>

        {/* +/- toggle button */}
        <button
          type="button"
          onClick={toggleDirection}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg border-2 font-bold text-lg transition-colors shrink-0",
            isAfter
              ? "border-green-400 bg-green-100 text-green-700 dark:border-green-600 dark:bg-green-950/50 dark:text-green-400"
              : "border-red-400 bg-red-100 text-red-700 dark:border-red-600 dark:bg-red-950/50 dark:text-red-400"
          )}
          title={isAfter ? 'Add (after)' : 'Subtract (before)'}
        >
          {isAfter ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
        </button>

        {/* Offset Value */}
        <div className="w-20">
          <Input
            type="number"
            value={timeOffsetExpr.offsetValue || 0}
            onChange={(e) => updateOffsetValue(parseInt(e.target.value) || 0)}
            className="text-center"
            min={0}
          />
        </div>

        {/* Unit selector */}
        <div className="p-2 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
          <RadioGroupField
            label="Unit"
            value={timeOffsetExpr.offsetType || 'minutes'}
            onChange={updateOffsetType}
            options={unitOptions}
            layout="horizontal"
          />
        </div>
      </div>

      {/* Candle-specific: Timeframe & Instrument */}
      {isCandles && (
        <div className="flex items-start gap-3 flex-wrap">
          {timeframes.length > 0 && (
            <div className="p-2 border border-cyan-200 rounded-lg bg-cyan-50/50 dark:border-cyan-800 dark:bg-cyan-950/30">
              <RadioGroupField
                label="Timeframe"
                value={selectedTimeframe}
                onChange={updateCandleTimeframe}
                options={timeframes}
                layout="horizontal"
              />
            </div>
          )}
          {instruments.length > 0 && (
            <div className="p-2 border border-teal-200 rounded-lg bg-teal-50/50 dark:border-teal-800 dark:bg-teal-950/30">
              <RadioGroupField
                label="Instrument"
                value={selectedInstrument}
                onChange={updateCandleInstrument}
                options={instruments}
                layout="horizontal"
              />
            </div>
          )}
        </div>
      )}

      {/* Candle info */}
      {isCandles && (
        <div className="p-2 border border-amber-200 rounded-lg bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 space-y-1">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <Label className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Current candle is excluded from offset count.
            </Label>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            E.g. <strong>{offsetVal} candle{offsetVal !== 1 ? 's' : ''} {isAfter ? 'after' : 'before'}</strong> at 10:00 ({selectedTimeframe || '1m'}) → skips 10:00, counts {offsetVal} {isAfter ? 'forward' : 'back'}.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeOffsetExpressionEditor;
