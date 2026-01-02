
import React from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeDetailsPanel } from './shared';
import { ExitOrderForm } from './action-node/exit-node';
import PostExecutionTab from './action-node/exit-node/PostExecutionTab';

interface ExitNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const ExitNodeEditor = ({ node, updateNodeData }: ExitNodeEditorProps) => {
  // Force actionType to be 'exit'
  if (node.data.actionType !== 'exit') {
    updateNodeData(node.id, { 
      ...node.data, 
      actionType: 'exit',
      _lastUpdated: Date.now()
    });
  }
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(node.id, { 
      ...node.data, 
      label: e.target.value,
      _lastUpdated: Date.now()
    });
  };

  // Get the appropriate info message
  const getActionInfoTooltip = () => {
    return "Exit nodes close existing positions. Connect them to signal nodes to define when to exit the market based on conditions.";
  };

  // Ensure we always pass a string to nodeLabel by using explicit type check
  const nodeLabel = typeof node.data?.label === 'string' ? node.data.label : '';

  return (
    <NodeDetailsPanel
      nodeId={node.id}
      nodeLabel={nodeLabel}
      onLabelChange={handleLabelChange}
      infoTooltip={getActionInfoTooltip()}
      additionalContent={
        <Tabs defaultValue="order-settings" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="order-settings">Order Settings</TabsTrigger>
            <TabsTrigger value="post-execution">Post-Execution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="order-settings">
            <ExitOrderForm node={node} updateNodeData={updateNodeData} />
          </TabsContent>
          
          <TabsContent value="post-execution">
            <PostExecutionTab node={node} updateNodeData={updateNodeData} />
          </TabsContent>
        </Tabs>
      }
    />
  );
};

export default ExitNodeEditor;
