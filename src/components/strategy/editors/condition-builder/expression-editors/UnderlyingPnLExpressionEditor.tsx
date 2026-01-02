import React from 'react';
import { UnderlyingPnLExpression } from '../../../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroupField } from '../../shared';

interface UnderlyingPnLExpressionEditorProps {
  expression: UnderlyingPnLExpression;
  updateExpression: (expr: UnderlyingPnLExpression) => void;
}

const UnderlyingPnLExpressionEditor: React.FC<UnderlyingPnLExpressionEditorProps> = ({
  expression,
  updateExpression
}) => {
  const nodes = useStrategyStore(state => state.nodes);
  
  // Extract all positions from entry nodes - only options positions
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
      // Clear vpi when switching to overall scope
      ...(value === 'overall' && { vpi: undefined })
    });
  };

  const handlePositionVpiChange = (value: string) => {
    updateExpression({
      ...expression,
      vpi: value
    });
  };

  const getPnLTypeDescription = () => {
    const scope = expression.scope === 'position' ? 'position' : 'strategy';
    
    switch (expression.pnlType) {
      case 'realized':
        return `Realized underlying P&L for ${scope} (only closed positions)`;
      case 'unrealized':
        return `Unrealized underlying P&L for ${scope} (only open positions)`;
      case 'total':
        return `Total underlying P&L for ${scope} (realized + unrealized)`;
      default:
        return '';
    }
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
      <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
        <RadioGroupField
          label={
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-700 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">📊</span>
              </div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Underlying P&L Type</span>
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
      <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
        <RadioGroupField
          label={
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">🎯</span>
              </div>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Scope</span>
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
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2 block">Position</Label>
          <Select value={expression.vpi || ''} onValueChange={handlePositionVpiChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {positions.map((position) => (
                <SelectItem key={position.vpi} value={position.vpi}>
                  <div className="flex items-center justify-between w-full">
                    <span>{position.vpi}</span>
                    <span className="text-muted-foreground text-xs ml-2">({position.sourceNodeId || 'Node ID'})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {expression.pnlType && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            {getPnLTypeDescription()}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Note: This calculates P&L based on underlying price movement, not actual underlying transactions.
          </p>
        </div>
      )}
    </div>
  );
};

export default UnderlyingPnLExpressionEditor;