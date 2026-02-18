
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Variable, Camera, TrendingUp, Pencil, Check } from 'lucide-react';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { GlobalVariable } from '@/hooks/strategy-store/types';
import { NodeVariable } from '../utils/conditions';
import { TrailingVariable } from '../nodes/action-node/types';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GlobalVariablesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NodeVariableGroup {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  snapshotVariables: NodeVariable[];
  trailingVariables: TrailingVariable[];
}

const GlobalVariablesModal: React.FC<GlobalVariablesModalProps> = ({ open, onOpenChange }) => {
  const { nodes, setNodes, globalVariables, setGlobalVariables } = useStrategyStore();

  const [newVarName, setNewVarName] = useState('');
  const [newVarInitialValue, setNewVarInitialValue] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const isDuplicate = globalVariables.some(
    v => v.name.toLowerCase() === newVarName.trim().toLowerCase()
  );

  const addGlobalVariable = () => {
    if (!newVarName.trim() || isDuplicate) return;
    const newVar: GlobalVariable = {
      id: `global-${Date.now()}`,
      name: newVarName.trim(),
      initialValue: newVarInitialValue
    };
    setGlobalVariables([...globalVariables, newVar]);
    setNewVarName('');
    setNewVarInitialValue(0);
  };

  const removeGlobalVariable = (id: string) => {
    setGlobalVariables(globalVariables.filter(v => v.id !== id));
  };

  // Rename a global variable and propagate the new name to all node references
  const renameGlobalVariable = (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    // Check duplicate (excluding self)
    const isDup = globalVariables.some(
      v => v.id !== id && v.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDup) return;

    // Update the global variable
    setGlobalVariables(globalVariables.map(v => v.id === id ? { ...v, name: trimmed } : v));

    // Propagate name change to all node references
    const updateNameInObj = (obj: any): any => {
      if (!obj) return obj;
      if (Array.isArray(obj)) return obj.map(updateNameInObj);
      if (typeof obj === 'object') {
        const updated: any = {};
        for (const [key, val] of Object.entries(obj)) {
          updated[key] = updateNameInObj(val);
        }
        // Update globalVariableName where globalVariableId matches
        if (updated.type === 'global_variable' && updated.globalVariableId === id) {
          updated.globalVariableName = trimmed;
        }
        return updated;
      }
      return obj;
    };

    const updatedNodes = nodes.map((node: any) => {
      let changed = false;
      let newData = { ...node.data };

      // Update conditions
      if (newData.conditions) {
        newData.conditions = updateNameInObj(newData.conditions);
        changed = true;
      }

      // Update globalVariableUpdates (top-level name + nested expressions)
      if (Array.isArray(newData.globalVariableUpdates)) {
        const updated = newData.globalVariableUpdates.map((u: any) => {
          let entry = u.globalVariableId === id ? { ...u, globalVariableName: trimmed } : { ...u };
          // Also update any global_variable references inside the assignment expression
          if (entry.expression) {
            entry.expression = updateNameInObj(entry.expression);
          }
          return entry;
        });
        newData.globalVariableUpdates = updated;
        changed = true;
      }

      return changed ? { ...node, data: newData } : node;
    });

    setNodes(updatedNodes);
    setEditingId(null);
  };

  // Check if a global variable is used in any node's conditions or assignments
  const getVariableUsages = (varId: string): string[] => {
    const usages: string[] = [];
    nodes.forEach((node: any) => {
      const nodeLabel = node.data?.label || node.id;
      // Check conditions for global_variable expressions
      const checkExpressions = (obj: any): boolean => {
        if (!obj) return false;
        if (obj.type === 'global_variable' && obj.globalVariableId === varId) return true;
        if (Array.isArray(obj)) return obj.some(checkExpressions);
        if (typeof obj === 'object') {
          for (const val of Object.values(obj)) {
            if (checkExpressions(val)) return true;
          }
        }
        return false;
      };
      if (checkExpressions(node.data?.conditions)) {
        usages.push(`Condition in "${nodeLabel}"`);
      }
      // Check globalVariableUpdates (post-execution assignments)
      if (Array.isArray(node.data?.globalVariableUpdates)) {
        if (node.data.globalVariableUpdates.some((u: any) => u.globalVariableId === varId)) {
          usages.push(`Assignment in "${nodeLabel}"`);
        }
      }
    });
    return usages;
  };

  // Collect all snapshot and trailing variables grouped by node
  const variableGroups: NodeVariableGroup[] = useMemo(() => {
    const groups: NodeVariableGroup[] = [];

    nodes.forEach((node: any) => {
      const nodeData = node.data || {};
      const snapshotVars: NodeVariable[] = Array.isArray(nodeData.variables) ? nodeData.variables : [];
      const trailingVars: TrailingVariable[] = Array.isArray(nodeData.trailingVariables) ? nodeData.trailingVariables : [];
      const positionVars: NodeVariable[] = Array.isArray(nodeData.positionVariables) ? nodeData.positionVariables : [];
      const allSnapshotVars = [...snapshotVars, ...positionVars];

      if (allSnapshotVars.length > 0 || trailingVars.length > 0) {
        groups.push({
          nodeId: node.id,
          nodeLabel: nodeData.label || node.type || 'Unknown',
          nodeType: node.type || 'unknown',
          snapshotVariables: allSnapshotVars,
          trailingVariables: trailingVars
        });
      }
    });

    return groups;
  }, [nodes]);

  const hasAnyNodeVariables = variableGroups.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Variable className="h-5 w-5 text-primary" />
            Strategy Variables
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-6">
            {/* Global Variables Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Global Variables</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Define global variables that can be read and updated by any node in the strategy.
              </p>
              
              <div className="flex gap-2">
                <Input
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  placeholder="Variable name"
                  className="h-8 text-sm flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addGlobalVariable()}
                />
                <Input
                  type="number"
                  value={newVarInitialValue}
                  onChange={(e) => setNewVarInitialValue(Number(e.target.value))}
                  placeholder="Initial value"
                  className="h-8 text-sm w-24"
                />
                <Button
                  size="sm"
                  onClick={addGlobalVariable}
                  disabled={!newVarName.trim() || isDuplicate}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              {isDuplicate && (
                <p className="text-xs text-destructive">A variable with this name already exists.</p>
              )}

              {globalVariables.length > 0 ? (
                <div className="space-y-1.5">
                  {globalVariables.map(v => {
                    const usages = getVariableUsages(v.id);
                    const isInUse = usages.length > 0;
                    const isEditing = editingId === v.id;
                    return (
                      <div key={v.id} className="flex items-center justify-between px-3 py-1.5 bg-muted/50 rounded-md border">
                        <div className="flex items-center gap-3">
                          {isEditing ? (
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') renameGlobalVariable(v.id, editingName);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="h-6 text-sm font-mono w-32"
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm font-mono">{v.name}</span>
                          )}
                          <span className="text-xs text-muted-foreground">= {v.initialValue}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => renameGlobalVariable(v.id, editingName)}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setEditingId(v.id); setEditingName(v.name); }}
                              className="h-6 w-6 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeGlobalVariable(v.id)}
                                    disabled={isInUse}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {isInUse && (
                                <TooltipContent side="left" className="max-w-[250px]">
                                  <p className="text-xs font-medium">Cannot delete — in use:</p>
                                  {usages.map((u, i) => (
                                    <p key={i} className="text-xs">• {u}</p>
                                  ))}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No global variables defined.</p>
              )}
            </div>

            <Separator />

            {/* Node Variables Section (Read-only) */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Node Variables (Read-only)</Label>
              <p className="text-xs text-muted-foreground">
                Snapshot and trailing variables defined across all nodes in the strategy.
              </p>

              {hasAnyNodeVariables ? (
                <div className="space-y-4">
                  {variableGroups.map(group => (
                    <div key={group.nodeId} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {group.nodeId}
                        </Badge>
                        <span className="text-sm font-medium">{group.nodeLabel}</span>
                      </div>

                      {group.snapshotVariables.length > 0 && (
                        <div className="space-y-1 ml-2">
                          <div className="flex items-center gap-1.5">
                            <Camera className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-blue-500">Snapshot Variables</span>
                          </div>
                          {group.snapshotVariables.map(sv => (
                            <div key={sv.id} className="text-xs font-mono text-muted-foreground ml-5 py-0.5">
                              {sv.name}
                            </div>
                          ))}
                        </div>
                      )}

                      {group.trailingVariables.length > 0 && (
                        <div className="space-y-1 ml-2">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-green-500">Trailing Variables</span>
                          </div>
                          {group.trailingVariables.map(tv => (
                            <div key={tv.id} className="text-xs font-mono text-muted-foreground ml-5 py-0.5">
                              {tv.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No snapshot or trailing variables defined in any node yet.
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalVariablesModal;
