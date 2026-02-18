
import React, { memo } from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeDetailsPanel } from './shared';
import { useSignalNodeForm } from './signal-node/useSignalNodeForm';
import SignalNodeContent from './signal-node/SignalNodeContent';
import PostExecutionTab from './action-node/entry-node/PostExecutionTab';

interface ExitSignalNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const ExitSignalNodeEditor = ({ node, updateNodeData }: ExitSignalNodeEditorProps) => {
  const { 
    formData, 
    conditions,
    reEntryExitConditions,
    hasReEntryExitConditions,
    handleLabelChange, 
    updateConditions,
    updateReEntryExitConditions,
    handleReEntryExitToggle,
    copyInitialExitConditions
  } = useSignalNodeForm({ node, updateNodeData });

  const exitSignalNodeInfo = "Exit condition nodes detect specific market conditions to trigger exit actions in your strategy. Configure exit conditions in the Conditions tab and post-execution features in the Post-Execution tab.";

  return (
    <NodeDetailsPanel
      nodeId={node.id}
      nodeLabel={formData.label}
      onLabelChange={handleLabelChange}
      infoTooltip={exitSignalNodeInfo}
      additionalContent={
        <Tabs defaultValue="signals" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="signals">Conditions</TabsTrigger>
            <TabsTrigger value="post-execution">Node Variables</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signals">
            <SignalNodeContent
              conditions={conditions}
              updateConditions={updateConditions}
              conditionContext="exit"
              showTabSelector={false}
              hasReEntryExitConditions={hasReEntryExitConditions}
              reEntryExitConditions={reEntryExitConditions}
              updateReEntryExitConditions={updateReEntryExitConditions}
              onReEntryExitToggle={handleReEntryExitToggle}
              onCopyInitialExitConditions={copyInitialExitConditions}
            />
          </TabsContent>
          
          <TabsContent value="post-execution">
            <PostExecutionTab node={node} updateNodeData={updateNodeData} />
          </TabsContent>
        </Tabs>
      }
    />
  );
};

export default memo(ExitSignalNodeEditor);
