import React from 'react';
import { PnLExpression } from '../../../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroupField } from '../../shared';

interface PnLExpressionEditorProps {
  expression: PnLExpression;
  updateExpression: (expr: PnLExpression) => void;
}

const PnLExpressionEditor: React.FC<PnLExpressionEditorProps> = ({
  expression,
  updateExpression
}) => {
  const nodes = useStrategyStore(state => state.nodes);
  
  // Extract all positions from entry nodes
  const positions = React.useMemo(() => {
    const allPositions: Array<{
      id: string;
      vpi: string;
      sourceNodeId: string;
    }> = [];
    
    nodes.forEach(node => {
      if (node.type === 'entryNode' && Array.isArray(node.data?.positions)) {
        node.data.positions.forEach((position: any) => {
          if (position.vpi) {
            allPositions.push({
              id: position.vpi,
              vpi: position.vpi,
              sourceNodeId: node.id
            });
          }
        });
      }
    });
    
    return allPositions;
  }, [nodes]);

  const handlePnLTypeChange = (value: 'realized' | 'unrealized' | 'total') => {
    updateExpression({
      ...expression,
      pnlType: value
    });
  };

  const handleScopeChange = (value: 'position' | 'overall') => {
    updateExpression({
      ...expression,
      scope: value,
      // Clear position identifiers when switching to overall
      ...(value === 'overall' ? { vpi: undefined } : {})
    });
  };

  const handlePositionVpiChange = (value: string) => {
    updateExpression({
      ...expression,
      vpi: value
    });
  };

  // Define options
  const pnlTypeOptions = [
    { value: 'realized', label: 'Realized P&L' },
    { value: 'unrealized', label: 'Unrealized P&L' },
    { value: 'total', label: 'Total P&L' }
  ];

  const scopeOptions = [
    { value: 'overall', label: 'Overall Strategy' },
    { value: 'position', label: 'Specific Position' }
  ];

  return (
    <div className="space-y-4">
      {/* P&L Type Selection */}
      <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
        <RadioGroupField
          label={
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600 dark:text-green-400">💰</span>
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">P&L Type</span>
            </div>
          }
          value={expression.pnlType}
          onChange={handlePnLTypeChange}
          options={pnlTypeOptions}
          layout="horizontal"
          className="space-y-3"
        />
      </div>

      {/* Scope Selection */}
      <div className="p-3 border border-blue-200 rounded-lg bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
        <RadioGroupField
          label={
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">🎯</span>
              </div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Scope</span>
            </div>
          }
          value={expression.scope}
          onChange={handleScopeChange}
          options={scopeOptions}
          layout="horizontal"
          className="space-y-3"
        />
      </div>

      {/* Position Selection - Keep as dropdown since it's dynamic data */}
      {expression.scope === 'position' && (
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2 block">Position (Required)</Label>
          <Select value={expression.vpi || ''} onValueChange={handlePositionVpiChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {positions.map(position => (
                <SelectItem key={position.vpi} value={position.vpi}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{position.vpi}</span>
                    <span className="text-muted-foreground text-xs ml-2">({position.sourceNodeId || 'Node ID'})</span>
                  </div>
                </SelectItem>
              ))}
              {positions.length === 0 && (
                <SelectItem value="_no_positions" disabled>
                  No positions available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {expression.scope === 'overall' 
          ? `${expression.pnlType === 'realized' ? 'Realized' : expression.pnlType === 'unrealized' ? 'Unrealized' : 'Total'} P&L across all strategy positions`
          : `${expression.pnlType === 'realized' ? 'Realized' : expression.pnlType === 'unrealized' ? 'Unrealized' : 'Total'} P&L for specific position`
        }
      </div>
    </div>
  );
};

export default PnLExpressionEditor;