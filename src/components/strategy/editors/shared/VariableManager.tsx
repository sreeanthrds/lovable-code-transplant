
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { Expression, NodeVariable, createDefaultExpression } from '../../utils/conditions';
import ExpressionEditorDialogTrigger from '../condition-builder/ExpressionEditorDialogTrigger';

interface VariableManagerProps {
  nodeId: string;
  variables: NodeVariable[];
  onVariablesChange: (variables: NodeVariable[]) => void;
}

const VariableManager: React.FC<VariableManagerProps> = ({
  nodeId,
  variables,
  onVariablesChange
}) => {
  const [editingVariable, setEditingVariable] = useState<string | null>(null);

  const addVariable = () => {
    const newVariable: NodeVariable = {
      id: `var-${Date.now()}`,
      name: `variable${variables.length + 1}`,
      expression: createDefaultExpression('constant'),
      nodeId
    };
    
    onVariablesChange([...variables, newVariable]);
    setEditingVariable(newVariable.id);
  };

  const updateVariable = (variableId: string, updates: Partial<NodeVariable>) => {
    const updatedVariables = variables.map(variable =>
      variable.id === variableId ? { ...variable, ...updates } : variable
    );
    onVariablesChange(updatedVariables);
  };

  const removeVariable = (variableId: string) => {
    const filteredVariables = variables.filter(variable => variable.id !== variableId);
    onVariablesChange(filteredVariables);
    if (editingVariable === variableId) {
      setEditingVariable(null);
    }
  };

  const updateExpression = (variableId: string, expression: Expression) => {
    updateVariable(variableId, { expression });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Snapshot Variables</CardTitle>
          <Button
            variant="default"
            size="sm"
            onClick={addVariable}
            className="h-7 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
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
            <div key={variable.id} className="space-y-2 p-2 border rounded">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor={`var-name-${variable.id}`} className="text-xs">
                    Variable Name
                  </Label>
                  <Input
                    id={`var-name-${variable.id}`}
                    value={variable.name}
                    onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="Variable name"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariable(variable.id)}
                  className="h-7 w-7 p-0 ml-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div>
                <Label className="text-xs">Expression</Label>
                <ExpressionEditorDialogTrigger
                  expression={variable.expression}
                  updateExpression={(expr) => updateExpression(variable.id, expr)}
                  currentNodeId={nodeId}
                  currentVariableId={variable.id}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default VariableManager;
