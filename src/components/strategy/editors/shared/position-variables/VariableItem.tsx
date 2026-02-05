
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { NodeVariable, Expression } from '../../../utils/conditions';
import ExpressionWrapper from '../../condition-builder/components/ExpressionWrapper';
import PositionBinding from './PositionBinding';
import { expressionToString } from '../../../utils/conditions/stringRepresentation';
import { useStrategyStore } from '@/hooks/use-strategy-store';

interface VariableItemProps {
  variable: NodeVariable;
  positions: any[];
  currentNodeId?: string;
  onUpdate: (updates: Partial<NodeVariable>) => void;
  onRemove: () => void;
  onExpressionUpdate: (expression: Expression) => void;
  onPositionBinding: (positionId: string) => void;
}

const VariableItem: React.FC<VariableItemProps> = ({
  variable,
  positions,
  currentNodeId,
  onUpdate,
  onRemove,
  onExpressionUpdate,
  onPositionBinding
}) => {
  const strategyStore = useStrategyStore();

  // Get expression preview text
  const getExpressionPreview = () => {
    if (!variable.expression || !variable.expression.type) {
      return 'Click to add expression';
    }
    
    try {
      const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
      const displayText = expressionToString(variable.expression, startNode?.data);
      return displayText || `${variable.expression.type} expression`;
    } catch (error) {
      console.error('Error formatting expression preview:', error);
      return `${variable.expression.type || 'Unknown'} expression`;
    }
  };
  
  return (
    <div className="space-y-2 p-3 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Label htmlFor={`var-name-${variable.id}`} className="text-xs font-medium text-foreground">
            Variable Name
          </Label>
          <Input
            id={`var-name-${variable.id}`}
            value={variable.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="h-8 text-xs mt-1"
            placeholder="Variable name"
          />
          <div className="mt-2 p-2 text-xs bg-muted border border-border rounded font-mono truncate">
            <span className="text-muted-foreground">Preview:</span> <span className="text-foreground">{getExpressionPreview()}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 ml-2 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <PositionBinding
        variable={variable}
        positions={positions}
        onPositionBinding={onPositionBinding}
      />

      <div>
        <Label className="text-xs font-medium text-foreground">Expression</Label>
        <div className="mt-1">
          <ExpressionWrapper
            label=""
            expression={variable.expression}
            updateExpression={onExpressionUpdate}
            showLabels={false}
            currentNodeId={currentNodeId}
            currentVariableId={variable.id}
          />
        </div>
      </div>
    </div>
  );
};

export default VariableItem;
