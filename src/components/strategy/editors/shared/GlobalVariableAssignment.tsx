import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Variable } from 'lucide-react';
import { Expression, createDefaultExpression } from '../../utils/conditions';
import ExpressionEditorDialogTrigger from '../condition-builder/ExpressionEditorDialogTrigger';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GlobalVariableUpdate {
  id: string;
  globalVariableId: string;
  globalVariableName: string;
  expression: Expression;
}

interface GlobalVariableAssignmentProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const GlobalVariableAssignment: React.FC<GlobalVariableAssignmentProps> = ({
  node,
  updateNodeData
}) => {
  const globalVariables = useStrategyStore(state => state.globalVariables);

  // Get current assignments from node data
  const assignments: GlobalVariableUpdate[] = Array.isArray(node.data?.globalVariableUpdates) 
    ? node.data.globalVariableUpdates 
    : [];

  const updateAssignments = (newAssignments: GlobalVariableUpdate[]) => {
    updateNodeData(node.id, {
      ...node.data,
      globalVariableUpdates: newAssignments
    });
  };

  const [selectedVarId, setSelectedVarId] = useState<string>('');

  const addAssignment = () => {
    if (!selectedVarId) return;
    const gv = globalVariables.find((v: any) => v.id === selectedVarId);
    if (!gv) return;
    
    // Check if already added
    if (assignments.some(a => a.globalVariableId === selectedVarId)) return;
    
    const newAssignment: GlobalVariableUpdate = {
      id: `gva-${Date.now()}`,
      globalVariableId: gv.id,
      globalVariableName: gv.name,
      expression: createDefaultExpression('constant')
    };
    updateAssignments([...assignments, newAssignment]);
    setSelectedVarId('');
  };

  const removeAssignment = (id: string) => {
    updateAssignments(assignments.filter(a => a.id !== id));
  };

  const updateExpression = (assignmentId: string, expression: Expression) => {
    updateAssignments(
      assignments.map(a => a.id === assignmentId ? { ...a, expression } : a)
    );
  };

  // Filter out already-assigned variables
  const availableVars = globalVariables.filter(
    (gv: any) => !assignments.some(a => a.globalVariableId === gv.id)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Variable className="h-4 w-4" />
          Update Global Variables
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {globalVariables.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No global variables defined. Add them via the Variables button in the toolbar.
          </p>
        ) : (
          <>
            {/* Add new assignment */}
            {availableVars.length > 0 && (
              <div className="flex gap-2">
                <Select value={selectedVarId} onValueChange={setSelectedVarId}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Choose global variable..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVars.map((gv: any) => (
                      <SelectItem key={gv.id} value={gv.id} className="text-xs">
                        {gv.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={addAssignment}
                  disabled={!selectedVarId}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            )}

            {/* Existing assignments */}
            {assignments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No global variable updates configured.</p>
            ) : (
              assignments.map(assignment => (
                <div key={assignment.id} className="space-y-2 p-2 border rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-medium">{assignment.globalVariableName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssignment(assignment.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs">=  Expression</Label>
                    <ExpressionEditorDialogTrigger
                      expression={assignment.expression}
                      updateExpression={(expr) => updateExpression(assignment.id, expr)}
                      currentNodeId={node.id}
                    />
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalVariableAssignment;
