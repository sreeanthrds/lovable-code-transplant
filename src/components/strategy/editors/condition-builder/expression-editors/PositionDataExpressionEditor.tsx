import React from 'react';
import { Expression, PositionDataExpression } from '../../../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { cn } from '@/lib/utils';
import { RadioGroupField } from '../../shared';

interface PositionDataExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const PositionDataExpressionEditor: React.FC<PositionDataExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  if (expression.type !== 'position_data') {
    return null;
  }

  const positionExpr = expression as PositionDataExpression;
  const nodes = useStrategyStore(state => state.nodes);
  
  // Local state for category selection
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  
  // Check if trading instrument is options
  const isOptionsTrading = React.useMemo(() => {
    const startNode = nodes.find(node => node.type === 'startNode');
    return (startNode?.data as any)?.tradingInstrument?.type === 'options';
  }, [nodes]);
  
  // Extract all positions from entry nodes
  const positions = React.useMemo(() => {
    const allPositions: Array<{
      id: string;
      vpi: string;
      vpt?: string;
      sourceNodeId: string;
    }> = [];
    
    nodes.forEach(node => {
      if (node.type === 'entryNode' && Array.isArray(node.data?.positions)) {
        node.data.positions.forEach((position: any) => {
          if (position.vpi) {
            allPositions.push({
              id: position.vpi,
              vpi: position.vpi,
              vpt: position.vpt,
              sourceNodeId: node.id
            });
          }
        });
      }
    });
    
    return allPositions;
  }, [nodes]);
  
  // Position data fields organized by category
  const positionDataFields = React.useMemo(() => {
    const baseFields = [
      // Basic Position Data
      { value: 'entryPrice', label: 'Entry Price', group: 'Position Data' },
      { value: 'currentPrice', label: 'Current Price', group: 'Position Data' },
      { value: 'quantity', label: 'Quantity', group: 'Position Data' },
      { value: 'status', label: 'Status (Open/Closed)', group: 'Position Data' },
      { value: 'entryTime', label: 'Entry Time', group: 'Position Data' },
      { value: 'exitTime', label: 'Exit Time', group: 'Position Data' },
      
      // Instrument Information
      { value: 'instrumentName', label: 'Instrument Name', group: 'Instrument Info' },
      { value: 'instrumentType', label: 'Instrument Type', group: 'Instrument Info' },
      { value: 'symbol', label: 'Trading Symbol', group: 'Instrument Info' }
    ];

    // Add underlying-related fields only for options trading  
    const underlyingFields = isOptionsTrading ? [
      { value: 'underlyingPriceOnEntry', label: 'Underlying Price on Entry', group: 'Position Data' },
      { value: 'underlyingPriceOnExit', label: 'Underlying Price on Exit', group: 'Position Data' },
      { value: 'underlyingName', label: 'Underlying Instrument', group: 'Instrument Info' }
    ] : [];

    // Add options-specific fields only for options trading
    const optionsFields = isOptionsTrading ? [
      { value: 'expiryDate', label: 'Expiry Date', group: 'Options Info' },
      { value: 'strikePrice', label: 'Strike Price', group: 'Options Info' },
      { value: 'optionType', label: 'Option Type (PE/CE)', group: 'Options Info' },
      { value: 'strikeType', label: 'Strike Type (ATM/ITM/OTM)', group: 'Options Info' }
    ] : [];

    return [...baseFields, ...underlyingFields, ...optionsFields];
  }, [isOptionsTrading]);

  // Get unique groups for organization
  const fieldGroups = React.useMemo(() => {
    return Array.from(new Set(positionDataFields.map(field => field.group)));
  }, [positionDataFields]);

  // Get fields by group for radio options
  const getFieldsByGroup = (group: string) => {
    return positionDataFields
      .filter(field => field.group === group)
      .map(field => ({ value: field.value, label: field.label }));
  };
  
  // Create position options for radio group
  const positionOptions = React.useMemo(() => {
    return positions.map(position => ({
      value: position.vpi,
      label: position.vpt ? `${position.vpi} (${position.vpt})` : position.vpi
    }));
  }, [positions]);

  // Category options for radio group
  const categoryOptions = React.useMemo(() => {
    return fieldGroups.map(group => ({
      value: group,
      label: group
    }));
  }, [fieldGroups]);

  // Update handlers
  const updatePositionVpi = (value: string) => {
    // Reset category and field when position changes
    setSelectedCategory('');
    updateExpression({
      ...positionExpr,
      vpi: value,
      positionField: undefined,
      field: undefined
    });
  };

  const updateCategory = (value: string) => {
    setSelectedCategory(value);
    // Reset field when category changes
    updateExpression({
      ...positionExpr,
      positionField: undefined,
      field: undefined
    });
  };
  
  const updateField = (value: string) => {
    updateExpression({
      ...positionExpr,
      positionField: value as any,
      field: value
    });
  };

  // Current selected field for the selected category
  const currentSelectedField = React.useMemo(() => {
    if (!selectedCategory || !positionExpr.positionField) return '';
    const field = positionDataFields.find(f => f.value === positionExpr.positionField);
    return field?.group === selectedCategory ? positionExpr.positionField : '';
  }, [selectedCategory, positionExpr.positionField, positionDataFields]);

  // Update selected category when field is already selected (for existing expressions)
  React.useEffect(() => {
    if (positionExpr.positionField && !selectedCategory) {
      const field = positionDataFields.find(f => f.value === positionExpr.positionField);
      if (field) {
        setSelectedCategory(field.group);
      }
    }
  }, [positionExpr.positionField, selectedCategory, positionDataFields]);

  // Don't render anything if no positions exist
  if (positions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No positions available. Add positions in an Entry node first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Step 1: Position Selection (Horizontal with wrap) */}
      <div className="p-1 sm:p-2 border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30 rounded-lg">
        <RadioGroupField
          label={
            <div className="flex items-center gap-1 mb-2">
              <div className="w-5 h-5 rounded-md border bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">🎯</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">Select Position</span>
            </div>
          }
          value={positionExpr.vpi || ''}
          onChange={updatePositionVpi}
          options={positionOptions}
          layout="horizontal"
          className=""
        />
      </div>

      {/* Step 2 & 3: Category and Field Selection (only if position selected) */}
      {positionExpr.vpi && positionExpr.vpi !== '' && (
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
          {/* Left Side: Category Selection (Vertical) */}
          <div className="w-full lg:w-1/3">
            <div className="p-1 sm:p-2 border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30 rounded-lg">
              <RadioGroupField
                label={
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-5 h-5 rounded-md border bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">📂</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-400">Select Category</span>
                  </div>
                }
                value={selectedCategory}
                onChange={updateCategory}
                options={categoryOptions}
                layout="vertical"
                className="space-y-1"
              />
            </div>
          </div>

          {/* Right Side: Field Selection (only if category selected) */}
          {selectedCategory && (
            <div className="w-full lg:w-2/3">
              <div className={cn(
                "p-1 sm:p-2 border rounded-lg",
                selectedCategory === 'Position Data' && "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30",
                selectedCategory === 'Instrument Info' && "border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30",
                selectedCategory === 'Options Info' && "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30"
              )}>
                <RadioGroupField
                  label={
                    <div className="flex items-center gap-1 mb-2">
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center",
                        selectedCategory === 'Position Data' && "bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-700",
                        selectedCategory === 'Instrument Info' && "bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-700",
                        selectedCategory === 'Options Info' && "bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-700"
                      )}>
                        <span className={cn(
                          "text-xs font-bold",
                          selectedCategory === 'Position Data' && "text-green-600 dark:text-green-400",
                          selectedCategory === 'Instrument Info' && "text-purple-600 dark:text-purple-400",
                          selectedCategory === 'Options Info' && "text-orange-600 dark:text-orange-400"
                        )}>
                          {selectedCategory === 'Position Data' ? '📊' : selectedCategory === 'Instrument Info' ? '🏷️' : '📈'}
                        </span>
                      </div>
                      <span className={cn(
                        "text-xs sm:text-sm font-medium",
                        selectedCategory === 'Position Data' && "text-green-700 dark:text-green-400",
                        selectedCategory === 'Instrument Info' && "text-purple-700 dark:text-purple-400",
                        selectedCategory === 'Options Info' && "text-orange-700 dark:text-orange-400"
                      )}>Select {selectedCategory} Field</span>
                    </div>
                  }
                  value={currentSelectedField}
                  onChange={updateField}
                  options={getFieldsByGroup(selectedCategory)}
                  layout="vertical"
                  className="space-y-1"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PositionDataExpressionEditor;