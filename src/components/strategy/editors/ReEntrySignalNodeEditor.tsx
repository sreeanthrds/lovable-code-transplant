import React, { memo, useCallback, useMemo } from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeDetailsPanel } from './shared';
import { useReEntryNodeForm } from './re-entry-node/useReEntryNodeForm';
import { CompactReEntrySettings } from './re-entry-node/CompactReEntrySettings';
import { useSignalNodeForm } from './signal-node/useSignalNodeForm';
import SignalNodeContent from './signal-node/SignalNodeContent';
import VariableManager from './shared/VariableManager';
import { NodeVariable } from '../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';

interface ReEntrySignalNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

interface ReEntrySignalNodeData {
  label?: string;
  conditions?: any[];
  retryConfig?: {
    groupNumber?: number;
    maxEntries?: number;
  };
  variables?: NodeVariable[];
  targetEntryNodeId?: string;
  [key: string]: any;
}

const ReEntrySignalNodeEditor: React.FC<ReEntrySignalNodeEditorProps> = ({ node, updateNodeData }) => {
  const nodeData = node.data as ReEntrySignalNodeData || {};
  const strategyStore = useStrategyStore();
  
  // Get available entry nodes
  const entryNodes = strategyStore.nodes.filter(n => n.type === 'entryNode');
  
  // Get the selected entry node's maxEntries from its position
  const selectedEntryMaxEntries = useMemo(() => {
    if (!nodeData.targetEntryNodeId || nodeData.targetEntryNodeId === 'none') return 1;
    
    const targetEntryNode = entryNodes.find(n => n.id === nodeData.targetEntryNodeId);
    if (!targetEntryNode?.data?.positions?.[0]) return 1;
    
    return targetEntryNode.data.positions[0].maxEntries || 1;
  }, [nodeData.targetEntryNodeId, entryNodes]);
  
  // Handle target entry node selection
  const handleTargetEntryNodeChange = useCallback((targetNodeId: string) => {
    console.log('🔧 Handling target entry node change:', targetNodeId);
    
    const currentNodeData = node.data as ReEntrySignalNodeData || {};
    
    // Get the maxEntries from selected entry node
    let entryMaxEntries = 1;
    if (targetNodeId !== 'none') {
      const targetEntryNode = entryNodes.find(n => n.id === targetNodeId);
      if (targetEntryNode?.data?.positions?.[0]) {
        entryMaxEntries = targetEntryNode.data.positions[0].maxEntries || 1;
      }
    }
    
    // Update node data with mirrored maxEntries
    updateNodeData(node.id, { 
      ...currentNodeData, 
      targetEntryNodeId: targetNodeId === 'none' ? undefined : targetNodeId,
      retryConfig: {
        ...(currentNodeData.retryConfig || {}),
        maxEntries: entryMaxEntries
      }
    });
    
    // Handle edge management
    const currentEdges = strategyStore.edges;
    console.log('🔧 Current edges before filter:', currentEdges);
    
    const filteredEdges = currentEdges.filter(edge => edge.source !== node.id);
    console.log('🔧 Filtered edges (removed existing):', filteredEdges);
    
    let newEdges = filteredEdges;
    
    // Only create edge if we selected an actual entry node (not 'none')
    if (targetNodeId !== 'none') {
      const newEdge = {
        id: `e-${node.id}-${targetNodeId}`,
        source: node.id,
        target: targetNodeId,
        animated: true,
        style: { strokeWidth: 2 }
      };
      console.log('🔧 Creating new edge:', newEdge);
      
      newEdges = [...filteredEdges, newEdge];
    }
    
    console.log('🔧 Final edges to set:', newEdges);
    
    strategyStore.setEdges(newEdges);
    strategyStore.addHistoryItem(strategyStore.nodes, newEdges);
    
    // Force React Flow to update
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceEdgeUpdate', { detail: { edges: newEdges } }));
    }, 100);
  }, [node.id, updateNodeData, strategyStore, entryNodes]);

  // Use re-entry node form for retry configuration  
  const reEntryForm = useReEntryNodeForm({
    node,
    updateNodeData
  });

  // Use signal node form for conditions
  const signalForm = useSignalNodeForm({
    node,
    updateNodeData
  });

  // Get entry positions for variable management
  const entryPositions = strategyStore.nodes
    .filter(n => n.type === 'entryNode' && n.data?.positions)
    .map(n => ({
      id: n.id,
      label: n.data.label || 'Entry',
      positions: n.data.positions || []
    }));

  const handleVariablesChange = (variables: NodeVariable[]) => {
    updateNodeData(node.id, {
      ...nodeData,
      variables
    });
  };

  const isTargetRequired = entryNodes.length > 0;
  const isTargetSelected = nodeData.targetEntryNodeId && nodeData.targetEntryNodeId !== 'none';
  const showWarning = isTargetRequired && !isTargetSelected;

  return (
    <div className="space-y-4">
      <NodeDetailsPanel
        nodeId={node.id}
        nodeLabel={signalForm.formData.label}
        onLabelChange={signalForm.handleLabelChange}
        infoTooltip="Re-entry condition nodes detect when positions should re-enter based on specific conditions and retry settings."
      />
      
      {/* Target Entry Node Selection */}
      <div className={cn(
        "space-y-2",
        showWarning && "border border-destructive rounded-lg p-3 bg-destructive/5"
      )}>
        <div className="flex items-center gap-2">
          <Label htmlFor="target-entry-node" className={cn(
            "text-sm font-medium",
            showWarning && "text-destructive"
          )}>
            {showWarning && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="h-4 w-4 text-destructive inline mr-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs text-destructive font-medium">
                      Target entry node selection is required for re-entry functionality!
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            Target Entry Node
          </Label>
        </div>
        <Select
          value={nodeData.targetEntryNodeId || 'none'}
          onValueChange={handleTargetEntryNodeChange}
        >
          <SelectTrigger className={cn(
            "w-full shadow-sm hover:shadow-md transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20",
            showWarning && "border-destructive focus:ring-destructive/30 hover:border-destructive"
          )}>
            <SelectValue placeholder={
              showWarning 
                ? "⚠️ Select entry node (Required)" 
                : "Select entry node to connect to"
            } />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No connection</SelectItem>
            {entryNodes.map(entryNode => (
              <SelectItem key={entryNode.id} value={entryNode.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{(entryNode.data?.label as string) || 'Entry Node'}</span>
                  <span className="text-muted-foreground text-xs ml-2">({entryNode.id})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Re-entry Configuration - Read-only mirroring entry node */}
      <CompactReEntrySettings 
        maxEntries={selectedEntryMaxEntries}
        readOnly={true}
      />
      
      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="variables">Post-Execution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conditions" className="space-y-4">
          <SignalNodeContent
            conditions={signalForm.conditions}
            updateConditions={signalForm.updateConditions}
            conditionContext="entry"
            showTabSelector={false}
          />
        </TabsContent>
        
        <TabsContent value="variables" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Node Variables</h3>
            <VariableManager
              nodeId={node.id}
              variables={nodeData.variables || []}
              onVariablesChange={handleVariablesChange}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default memo(ReEntrySignalNodeEditor);