
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Variable, Camera, TrendingUp } from 'lucide-react';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { NodeVariable } from '../utils/conditions';
import { TrailingVariable } from '../nodes/action-node/types';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GlobalVariable {
  id: string;
  name: string;
}

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
  const strategyStore = useStrategyStore();
  const nodes = strategyStore.nodes;

  // Global variables state - stored in strategy store's metadata or local for now
  const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>(() => {
    // Try to load from strategy store metadata
    const startNode = nodes.find(n => n.type === 'startNode');
    return (startNode?.data as any)?.globalVariables || [];
  });
  const [newVarName, setNewVarName] = useState('');

  const addGlobalVariable = () => {
    if (!newVarName.trim()) return;
    const newVar: GlobalVariable = {
      id: `global-${Date.now()}`,
      name: newVarName.trim()
    };
    const updated = [...globalVariables, newVar];
    setGlobalVariables(updated);
    setNewVarName('');
    
    // Persist to start node data
    const startNode = nodes.find(n => n.type === 'startNode');
    if (startNode) {
      const updatedNodes = nodes.map((n: any) => 
        n.id === startNode.id ? { ...n, data: { ...n.data, globalVariables: updated } } : n
      );
      strategyStore.setNodes(updatedNodes);
    }
  };

  const removeGlobalVariable = (id: string) => {
    const updated = globalVariables.filter(v => v.id !== id);
    setGlobalVariables(updated);
    
    const startNode = nodes.find(n => n.type === 'startNode');
    if (startNode) {
      const updatedNodes = nodes.map((n: any) => 
        n.id === startNode.id ? { ...n, data: { ...n.data, globalVariables: updated } } : n
      );
      strategyStore.setNodes(updatedNodes);
    }
  };

  // Collect all snapshot and trailing variables grouped by node
  const variableGroups: NodeVariableGroup[] = useMemo(() => {
    const groups: NodeVariableGroup[] = [];

    nodes.forEach((node: any) => {
      const nodeData = node.data || {};
      const snapshotVars: NodeVariable[] = Array.isArray(nodeData.variables) ? nodeData.variables : [];
      const trailingVars: TrailingVariable[] = Array.isArray(nodeData.trailingVariables) ? nodeData.trailingVariables : [];
      
      // Also check positionVariables (used in entry nodes)
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
                Define global variables that can be used throughout the strategy.
              </p>
              
              <div className="flex gap-2">
                <Input
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  placeholder="Variable name"
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && addGlobalVariable()}
                />
                <Button
                  size="sm"
                  onClick={addGlobalVariable}
                  disabled={!newVarName.trim()}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              {globalVariables.length > 0 ? (
                <div className="space-y-1.5">
                  {globalVariables.map(v => (
                    <div key={v.id} className="flex items-center justify-between px-3 py-1.5 bg-muted/50 rounded-md border">
                      <span className="text-sm font-mono">{v.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGlobalVariable(v.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
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
