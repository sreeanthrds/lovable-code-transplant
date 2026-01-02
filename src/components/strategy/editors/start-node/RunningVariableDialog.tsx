import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Settings, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RunningVariable, VariableDeclaration } from './types/runningVariableTypes';
import { GroupCondition, createDefaultGroupCondition, createDefaultExpression } from '../../utils/conditionTypes';
import ConditionBuilder from '../condition-builder/ConditionBuilder';
import ExpressionEditorDialogTrigger from '../condition-builder/ExpressionEditorDialogTrigger';

interface RunningVariableDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  variable?: RunningVariable | null;
  onSave: (variable: RunningVariable) => void;
}

export const RunningVariableDialog: React.FC<RunningVariableDialogProps> = ({
  isOpen,
  onOpenChange,
  variable,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<RunningVariable>>({
    name: '',
    description: '',
    eventConditions: createDefaultGroupCondition(),
    declarations: []
  });

  const [showConditionBuilder, setShowConditionBuilder] = useState(false);

  useEffect(() => {
    if (variable) {
      setFormData({
        ...variable,
        eventConditions: variable.eventConditions || createDefaultGroupCondition()
      });
    } else {
      setFormData({
        name: '',
        description: '',
        eventConditions: createDefaultGroupCondition(),
        declarations: []
      });
    }
    setShowConditionBuilder(false);
  }, [variable, isOpen]);

  const handleSave = () => {
    if (!formData.name?.trim()) return;

    const now = new Date().toISOString();
    const savedVariable: RunningVariable = {
      id: variable?.id || uuidv4(),
      name: formData.name.trim(),
      description: formData.description || '',
      eventConditions: formData.eventConditions || createDefaultGroupCondition(),
      declarations: formData.declarations || [],
      createdAt: variable?.createdAt || now,
      updatedAt: now
    };

    onSave(savedVariable);
  };

  const updateEventConditions = (conditions: GroupCondition) => {
    setFormData(prev => ({
      ...prev,
      eventConditions: conditions
    }));
  };

  const addDeclaration = () => {
    const newDeclaration: VariableDeclaration = {
      id: uuidv4(),
      name: '',
      expression: createDefaultExpression('constant'),
      description: ''
    };

    setFormData(prev => ({
      ...prev,
      declarations: [...(prev.declarations || []), newDeclaration]
    }));
  };

  const updateDeclaration = (id: string, updates: Partial<VariableDeclaration>) => {
    setFormData(prev => ({
      ...prev,
      declarations: prev.declarations?.map(decl => 
        decl.id === id ? { ...decl, ...updates } : decl
      ) || []
    }));
  };

  const removeDeclaration = (id: string) => {
    setFormData(prev => ({
      ...prev,
      declarations: prev.declarations?.filter(decl => decl.id !== id) || []
    }));
  };

  const updateExpression = (declarationId: string, expression: any) => {
    updateDeclaration(declarationId, { expression });
  };

  const hasConditions = formData.eventConditions?.conditions && formData.eventConditions.conditions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {variable ? 'Edit Running Variable' : 'Create Running Variable'}
          </DialogTitle>
          <DialogDescription>
            Configure event-driven variables that update during strategy execution and can be used in expressions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Basic Information</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="variable-name">Variable Name *</Label>
                <Input
                  id="variable-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter variable name (e.g., 'TrendState', 'TradeCount')"
                />
              </div>
              
              <div>
                <Label htmlFor="variable-description">Description</Label>
                <Textarea
                  id="variable-description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this variable tracks and how it's used"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Event Conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Event Conditions</h4>
                <p className="text-xs text-muted-foreground">
                  Define when this variable should be updated during strategy execution.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowConditionBuilder(!showConditionBuilder)}
                className="flex items-center gap-2"
              >
                <Settings className="h-3 w-3" />
                {showConditionBuilder ? 'Hide Conditions' : 'Edit Conditions'}
              </Button>
            </div>

            {showConditionBuilder ? (
              <Card>
                <CardContent className="pt-4">
                  <ConditionBuilder
                    rootCondition={formData.eventConditions || createDefaultGroupCondition()}
                    updateConditions={updateEventConditions}
                    context="entry"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className={hasConditions ? "" : "border-dashed"}>
                <CardContent className={hasConditions ? "pt-4" : "text-center py-6"}>
                  {hasConditions ? (
                    <p className="text-xs text-muted-foreground">
                      Event conditions are configured. Click "Edit Conditions" to modify.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No event conditions configured. Click "Edit Conditions" to add conditions.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Variable Declarations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Variable Declarations</h4>
                <p className="text-xs text-muted-foreground">
                  Define the variables that will be available when the event conditions are met.
                </p>
              </div>
              <Button size="sm" onClick={addDeclaration} className="flex items-center gap-2">
                <Plus className="h-3 w-3" />
                Add Variable
              </Button>
            </div>

            {(formData.declarations?.length || 0) === 0 ? (
              <Card className="border-dashed">
                <CardContent className="text-center py-6">
                  <p className="text-xs text-muted-foreground">
                    No variables declared. Click "Add Variable" to create variables.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {formData.declarations?.map((declaration) => (
                  <Card key={declaration.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Variable Name</Label>
                              <Input
                                value={declaration.name}
                                onChange={(e) => updateDeclaration(declaration.id, { name: e.target.value })}
                                placeholder="Variable name"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Description</Label>
                              <Input
                                value={declaration.description || ''}
                                onChange={(e) => updateDeclaration(declaration.id, { description: e.target.value })}
                                placeholder="Optional description"
                              />
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDeclaration(declaration.id)}
                            className="h-7 w-7 p-0 ml-3 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Expression</Label>
                          <ExpressionEditorDialogTrigger
                            expression={declaration.expression}
                            updateExpression={(expr) => updateExpression(declaration.id, expr)}
                            currentNodeId="start-node"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.name?.trim()}
          >
            {variable ? 'Update Variable' : 'Create Variable'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};