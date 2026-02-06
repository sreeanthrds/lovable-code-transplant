
import React from 'react';
import { 
  Expression, 
  MarketDataExpression
} from '../../utils/conditions';
import CandleOffsetSelector, { CandleSelectionMode } from './components/CandleOffsetSelector';
import MultilevelDropdown from './components/MultilevelDropdown';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { RadioGroupField } from '../shared';
import { TimeframeResolver } from '../../utils/timeframe-migration';

interface MarketDataSelectorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
}

const MarketDataSelector: React.FC<MarketDataSelectorProps> = ({
  expression,
  updateExpression
}) => {
  const strategyStore = useStrategyStore();
  if (expression.type !== 'candle_data') {
    return null;
  }

  const marketDataExpr = expression as MarketDataExpression;
  
  // No automatic default initialization - let progressive disclosure work
  
  // Update individual components
  const updateInstrumentType = (instrumentType: 'TI' | 'SI') => {
    updateExpression({
      ...marketDataExpr,
      instrumentType,
      // Clear subsequent fields for progressive disclosure
      timeframeId: undefined,
      timeframe: undefined,
      dataField: undefined,
      field: undefined,
      offset: undefined
    });
  };

  const updateTimeframe = (timeframeId: string) => {
    updateExpression({
      ...marketDataExpr,
      timeframeId,
      timeframe: undefined, // Clear legacy field
      // Clear subsequent fields for progressive disclosure
      dataField: undefined,
      field: undefined,
      offset: undefined
    });
  };

  const updateField = (field: string) => {
    updateExpression({
      ...marketDataExpr,
      dataField: field, // Update both dataField and field to match the interface
      field
    });
  };
  
  // Update the time offset (current, previous, etc.)
  const updateOffset = (value: number) => {
    updateExpression({
      ...marketDataExpr,
      offset: value
    });
  };

  // Update candle selection mode
  const updateSelectionMode = (mode: CandleSelectionMode) => {
    updateExpression({
      ...marketDataExpr,
      candleSelectionMode: mode,
      // Reset other fields based on mode
      offset: mode === 'offset' ? (marketDataExpr.offset || -1) : undefined,
      candleTime: mode === 'by_time' ? (marketDataExpr.candleTime || '') : undefined,
      candleNumber: mode === 'by_number' ? (marketDataExpr.candleNumber || 1) : undefined
    });
  };

  // Update candle time (for by_time mode)
  const updateCandleTime = (time: string) => {
    updateExpression({
      ...marketDataExpr,
      candleTime: time
    });
  };

  // Update candle number (for by_number mode)
  const updateCandleNumber = (num: number) => {
    updateExpression({
      ...marketDataExpr,
      candleNumber: num
    });
  };
  
  // Build instrument options
  const getInstrumentOptions = () => {
    const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
    const tradingTimeframes = (startNode?.data as any)?.tradingInstrumentConfig?.timeframes || [];
    const supportingTimeframes = (startNode?.data as any)?.supportingInstrumentConfig?.timeframes || [];
    
    const options = [];
    
    if (tradingTimeframes.length > 0) {
      options.push({ value: 'TI', label: 'Trading Instrument' });
    }
    
    if (supportingTimeframes.length > 0) {
      options.push({ value: 'SI', label: 'Supporting Instrument' });
    }
    
    // Default fallback
    if (options.length === 0) {
      options.push({ value: 'TI', label: 'Trading Instrument' });
    }
    
    return options;
  };

  // Build timeframe options based on selected instrument
  const getTimeframeOptions = () => {
    const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
    const instrumentType = marketDataExpr.instrumentType || 'TI';
    
    let timeframes = [];
    if (instrumentType === 'TI') {
      timeframes = (startNode?.data as any)?.tradingInstrumentConfig?.timeframes || [];
    } else if (instrumentType === 'SI') {
      timeframes = (startNode?.data as any)?.supportingInstrumentConfig?.timeframes || [];
    }
    
    // Default fallback
    if (timeframes.length === 0) {
      timeframes = [
        { id: 'default-1m', timeframe: '1m' },
        { id: 'default-5m', timeframe: '5m' },
        { id: 'default-15m', timeframe: '15m' }
      ];
    }
    
    const options = timeframes.map((timeframe: any) => {
      return {
        value: timeframe.id,
        label: timeframe.timeframe // Use the direct timeframe value like "1m", "5m"
      };
    });
    
    return options;
  };

  // Market data fields
  const getFieldOptions = () => {
    return [
      { value: 'Open', label: 'Open' },
      { value: 'High', label: 'High' },
      { value: 'Low', label: 'Low' },
      { value: 'Close', label: 'Close' },
      { value: 'Volume', label: 'Volume' }
    ];
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Instrument Selection - Always visible */}
      <div className="p-3 border border-blue-200 rounded-lg bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
        <RadioGroupField
          label="Instrument"
          value={marketDataExpr.instrumentType || ''}
          onChange={updateInstrumentType}
          options={getInstrumentOptions()}
          layout="horizontal"
          required={true}
        />
      </div>
      
      {/* Step 2: Timeframe Selection - Only show when instrument is selected */}
      {marketDataExpr.instrumentType && (
        <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
          <RadioGroupField
            label="Timeframe"
            value={marketDataExpr.timeframeId || marketDataExpr.timeframe || ''}
            onChange={updateTimeframe}
            options={getTimeframeOptions()}
            layout="horizontal"
            required={true}
          />
        </div>
      )}
      
      {/* Step 3: Field Selection - Only show when timeframe is selected */}
      {marketDataExpr.instrumentType && (marketDataExpr.timeframeId || marketDataExpr.timeframe) && (
        <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
          <RadioGroupField
            label={
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">$</span>
                </div>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Market Data Field (OHLCV)</span>
              </div>
            }
            value={marketDataExpr.field || ''}
            onChange={updateField}
            options={getFieldOptions()}
            layout="horizontal"
            required={true}
          />
        </div>
      )}
      
      {/* Step 4: Look back - Only show when field is selected */}
      {marketDataExpr.instrumentType && (marketDataExpr.timeframeId || marketDataExpr.timeframe) && marketDataExpr.field && (
        <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
          <CandleOffsetSelector 
            offset={marketDataExpr.offset || 0}
            onOffsetChange={updateOffset}
            label="Candle Selection:"
            selectionMode={marketDataExpr.candleSelectionMode || 'offset'}
            onSelectionModeChange={updateSelectionMode}
            candleTime={marketDataExpr.candleTime || ''}
            onCandleTimeChange={updateCandleTime}
            candleNumber={marketDataExpr.candleNumber || 1}
            onCandleNumberChange={updateCandleNumber}
          />
        </div>
      )}
    </div>
  );
};

export default MarketDataSelector;
