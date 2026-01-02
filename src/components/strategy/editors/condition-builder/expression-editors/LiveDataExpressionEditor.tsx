
import React from 'react';
import { Expression, LiveDataExpression } from '../../../utils/conditions';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { RadioGroupField } from '../../shared';

interface LiveDataExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const LiveDataExpressionEditor: React.FC<LiveDataExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  const strategyStore = useStrategyStore();
  
  if (expression.type !== 'live_data') {
    return null;
  }

  const liveDataExpr = expression as LiveDataExpression;
  
  // Ensure instrumentType exists for backward compatibility
  if (!liveDataExpr.instrumentType) {
    updateExpression({
      ...liveDataExpr,
      instrumentType: 'TI'
    });
  }
  
  // Get trading instrument type from start node
  const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
  const tradingInstrument = startNode?.data?.tradingInstrument as { type?: string } | undefined;
  const isOptions = tradingInstrument?.type === 'options';
  
  // Extract position IDs from all nodes with positions
  const getPositionIds = () => {
    const positionIds: string[] = [];
    
    strategyStore.nodes.forEach(node => {
      if (node.data?.positions && Array.isArray(node.data.positions)) {
        node.data.positions.forEach((position: any) => {
          if (position.vpi) {
            positionIds.push(position.vpi);
          }
        });
      }
    });
    
    return positionIds;
  };
  
  const updateField = (value: string) => {
    const updates: Partial<LiveDataExpression> = { 
      field: value,
      instrumentType: liveDataExpr.instrumentType || 'TI' // Preserve current or default to TI
    };
    
    // Reset vpi when field changes
    if (value !== 'position_ltp') {
      updates.vpi = undefined;
    }
    
    updateExpression({
      ...liveDataExpr,
      ...updates
    });
  };
  
  const updateVpi = (value: string) => {
    // Only allow valid VPIs
    const positionIds = getPositionIds();
    if (!positionIds.length) {
      // If no positions available, don't update anything
      return;
    }
    
    updateExpression({
      ...liveDataExpr,
      vpi: value,
      instrumentType: liveDataExpr.instrumentType || 'TI' // Preserve current or default to TI
    });
  };
  
  const updateInstrumentType = (value: string) => {
    updateExpression({
      ...liveDataExpr,
      instrumentType: value as 'TI' | 'SI'
    });
  };
  
  // Get instrument options
  const getInstrumentOptions = () => {
    return [
      { value: 'TI', label: 'Trading Instrument' },
      { value: 'SI', label: 'Supporting Instrument' }
    ];
  };

  // Different fields based on instrument type
  const getLiveDataFields = () => {
    if (isOptions) {
      return [
        { value: 'position_ltp', label: 'Position LTP' },
        { value: 'underlying_ltp', label: 'Underlying LTP' }
      ];
    } else {
      // For stocks, only LTP
      return [
        { value: 'ltp', label: 'LTP (Last Traded Price)' }
      ];
    }
  };
  
  const liveDataFields = getLiveDataFields();
  
  // Show appropriate display value based on instrument type and field
  const getDisplayValue = () => {
    if (!isOptions && liveDataExpr.field === 'ltp') {
      return 'LTP';
    }
    const field = liveDataFields.find(f => f.value === liveDataExpr.field);
    return field ? field.label : 'Select live data field';
  };
  
  const positionIds = getPositionIds();
  const hasPositions = positionIds.length > 0;
  const showPositionSelector = isOptions && liveDataExpr.field === 'position_ltp' && hasPositions;
  
  return (
    <div className="space-y-4">
      {/* Instrument Selection */}
      <RadioGroupField
        label="Instrument"
        value={liveDataExpr.instrumentType || 'TI'}
        onChange={updateInstrumentType}
        options={getInstrumentOptions()}
        layout="horizontal"
      />
      
      {/* Live Data Field Selection with Enhanced Styling */}
      <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
        <RadioGroupField
          label={
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600 dark:text-green-400">⚡</span>
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Live Market Data</span>
            </div>
          }
          value={liveDataExpr.field || ''}
          onChange={updateField}
          options={liveDataFields}
          layout="horizontal"
          className="space-y-3"
        />
      </div>
      
      {/* Position Selector - Keep as dropdown since it's dynamic data */}
      {showPositionSelector && (
        <Select 
          value={liveDataExpr.vpi || ''} 
          onValueChange={updateVpi}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            {positionIds.map(vpi => (
              <SelectItem key={vpi} value={vpi}>
                {vpi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {isOptions && liveDataExpr.field === 'position_ltp' && !hasPositions && (
        <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/50">
          No positions available. Create positions in action nodes first.
        </div>
      )}
    </div>
  );
};

export default LiveDataExpressionEditor;
