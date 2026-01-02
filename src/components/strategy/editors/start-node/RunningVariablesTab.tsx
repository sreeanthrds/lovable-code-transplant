import React, { useState } from 'react';
import { Plus, Settings, Trash2, Calendar, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RunningVariable, RunningVariablesData } from './types/runningVariableTypes';
import { RunningVariableDialog } from './RunningVariableDialog';
import { formatDistanceToNow } from 'date-fns';

interface RunningVariablesTabProps {
  runningVariables?: RunningVariablesData;
  onRunningVariablesChange: (variables: RunningVariablesData) => void;
}

const RunningVariablesTab: React.FC<RunningVariablesTabProps> = ({
  runningVariables = { variables: {} },
  onRunningVariablesChange
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<RunningVariable | null>(null);

  const handleAddVariable = () => {
    setEditingVariable(null);
    setIsDialogOpen(true);
  };

  const handleEditVariable = (variable: RunningVariable) => {
    setEditingVariable(variable);
    setIsDialogOpen(true);
  };

  const handleSaveVariable = (variable: RunningVariable) => {
    const updatedVariables = {
      ...runningVariables,
      variables: {
        ...runningVariables.variables,
        [variable.id]: variable
      }
    };
    onRunningVariablesChange(updatedVariables);
    setIsDialogOpen(false);
    setEditingVariable(null);
  };

  const handleDeleteVariable = (variableId: string) => {
    const updatedVariables = { ...runningVariables.variables };
    delete updatedVariables[variableId];
    
    onRunningVariablesChange({
      ...runningVariables,
      variables: updatedVariables
    });
  };

  const variables = Object.values(runningVariables.variables);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Running Variables</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create event-driven variables that can be used in expressions and conditions throughout your strategy.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleAddVariable}
          className="flex items-center gap-2"
        >
          <Plus className="h-3 w-3" />
          Add Variable
        </Button>
      </div>

      {variables.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Code className="h-8 w-8 text-muted-foreground mb-3" />
            <h4 className="font-medium text-sm mb-2">No Running Variables</h4>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm">
              Running variables allow you to store and update values based on market events and conditions during strategy execution.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddVariable}
              className="flex items-center gap-2"
            >
              <Plus className="h-3 w-3" />
              Create First Variable
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {variables.map((variable) => (
            <Card key={variable.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">
                      {variable.name}
                    </CardTitle>
                    {variable.description && (
                      <CardDescription className="text-xs mt-1">
                        {variable.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditVariable(variable)}
                      className="h-7 w-7 p-0"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteVariable(variable.id)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {variable.eventConditions?.conditions?.length || 0} condition{(variable.eventConditions?.conditions?.length || 0) !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {variable.declarations.length} variable{variable.declarations.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(variable.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RunningVariableDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variable={editingVariable}
        onSave={handleSaveVariable}
      />
    </div>
  );
};

export default RunningVariablesTab;