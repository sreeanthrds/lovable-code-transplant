
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { NodeVariable } from '../../utils/conditions';
import { usePositionVariables } from './position-variables/usePositionVariables';
import VariableItem from './position-variables/VariableItem';

interface PositionVariableManagerProps {
  nodeId: string;
  positions: any[];
  variables: NodeVariable[];
  onVariablesChange: (variables: NodeVariable[]) => void;
}

const PositionVariableManager: React.FC<PositionVariableManagerProps> = ({
  nodeId,
  positions,
  variables,
  onVariablesChange
}) => {
  const {
    addVariable,
    updateVariable,
    removeVariable,
    handlePositionBinding
  } = usePositionVariables({
    nodeId,
    positions,
    variables,
    onVariablesChange
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Snapshot Variables</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={addVariable}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Variable
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {variables.length === 0 ? (
          <p className="text-xs text-muted-foreground">No variables defined</p>
        ) : (
          variables.map(variable => (
            <VariableItem
              key={variable.id}
              variable={variable}
              positions={positions}
              currentNodeId={nodeId}
              onUpdate={(updates) => updateVariable(variable.id, updates)}
              onRemove={() => removeVariable(variable.id)}
              onExpressionUpdate={(expression) => updateVariable(variable.id, { expression })}
              onPositionBinding={(positionId) => handlePositionBinding(variable.id, positionId)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PositionVariableManager;
