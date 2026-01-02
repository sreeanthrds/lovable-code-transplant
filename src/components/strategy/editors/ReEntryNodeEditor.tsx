
import React, { memo } from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NodeDetailsPanel } from './shared';
import { useReEntryNodeForm } from './re-entry-node/useReEntryNodeForm';
import { CompactReEntrySettings } from './re-entry-node/CompactReEntrySettings';
import { useSignalNodeForm } from './signal-node/useSignalNodeForm';
import SignalNodeContent from './signal-node/SignalNodeContent';
import VariableManager from './shared/VariableManager';
import { NodeVariable } from '../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';

interface ReEntryNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

interface ReEntryNodeData {
  actionType?: string;
  label?: string;
  conditions?: any[];
  targetNodeId?: string;
  variables?: NodeVariable[];
  [key: string]: any;
}

const ReEntryNodeEditor: React.FC<ReEntryNodeEditorProps> = ({ node, updateNodeData }) => {
  console.log('🔧 ReEntryNodeEditor rendering with node:', node);
  
  // Force actionType to be 'retry'
  const nodeData = node.data as ReEntryNodeData || {};
  console.log('🔧 ReEntryNodeEditor nodeData:', nodeData);
  
  if (nodeData?.actionType !== 'retry') {
    console.log('🔧 Setting actionType to retry for node:', node.id);
    updateNodeData(node.id, { 
      ...nodeData, 
      actionType: 'retry',
      _lastUpdated: Date.now()
    });
  }

  const {
    label,
    groupNumber,
    maxEntries,
    handleLabelChange,
    handleGroupNumberChange,
    handleMaxEntriesChange
  } = useReEntryNodeForm({ node, updateNodeData });

  // Use signal node form for conditions functionality
  const { 
    conditions,
    updateConditions
  } = useSignalNodeForm({ node, updateNodeData });

  // Get all nodes for target selection
  const nodes = useStrategyStore(state => state.nodes);

  // Get positions from entry nodes for variable management
  const entryPositions = nodes
    .filter(n => n.type === 'entryNode')
    .flatMap(n => n.data?.positions || []);

  // Handle variables with proper type checking and safe defaults
  const variables: NodeVariable[] = Array.isArray(nodeData?.variables) ? nodeData.variables : [];
  
  const handleVariablesChange = (newVariables: NodeVariable[]) => {
    updateNodeData(node.id, {
      ...nodeData,
      variables: newVariables,
      _lastUpdated: Date.now()
    });
  };

  const getActionInfoTooltip = () => {
    return "Re-entry nodes allow a strategy to re-enter a position after an exit, with configurable attempt limits and entry conditions.";
  };

  const nodeLabel = typeof label === 'string' ? label : 'Re-entry';

  return (
    <div className="space-y-6">
      <NodeDetailsPanel
        nodeId={node.id}
        nodeLabel={nodeLabel}
        onLabelChange={handleLabelChange}
        infoTooltip={getActionInfoTooltip()}
      />

      <CompactReEntrySettings
        maxEntries={maxEntries}
        onMaxEntriesChange={handleMaxEntriesChange}
      />

      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="post-execution">Post-Execution</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions" className="space-y-4">
          <SignalNodeContent
            conditions={conditions}
            updateConditions={updateConditions}
            conditionContext="entry"
            showTabSelector={false}
          />
        </TabsContent>

        <TabsContent value="post-execution" className="space-y-4">
          <div className="space-y-4 bg-accent/5 rounded-md p-3">
            <VariableManager
              nodeId={node.id}
              variables={variables}
              onVariablesChange={handleVariablesChange}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default memo(ReEntryNodeEditor);
