
import React, { memo } from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeDetailsPanel } from './shared';
import { useSignalNodeForm } from './signal-node/useSignalNodeForm';
import SignalNodeContent from './signal-node/SignalNodeContent';
import PostExecutionTab from './action-node/entry-node/PostExecutionTab';

interface SignalNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const SignalNodeEditor = ({ node, updateNodeData }: SignalNodeEditorProps) => {
  const { 
    formData, 
    conditions,
    exitConditions,
    reEntryConditions,
    reEntryExitConditions,
    hasReEntryConditions,
    hasReEntryExitConditions,
    handleLabelChange, 
    updateConditions,
    updateExitConditions,
    updateReEntryConditions,
    updateReEntryExitConditions,
    handleReEntryToggle,
    handleReEntryExitToggle,
    copyInitialConditions,
    copyInitialExitConditions
  } = useSignalNodeForm({ node, updateNodeData });

  const signalNodeInfo = "Signal nodes detect market conditions and can trigger both entry and exit actions. Configure conditions in the Signals tab and post-execution features in the Post-Execution tab.";

  return (
    <NodeDetailsPanel
      nodeId={node.id}
      nodeLabel={formData.label}
      onLabelChange={handleLabelChange}
      infoTooltip={signalNodeInfo}
      additionalContent={
        <Tabs defaultValue="signals" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="post-execution">Post-Execution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signals">
            <SignalNodeContent
              conditions={conditions}
              updateConditions={updateConditions}
              exitConditions={exitConditions}
              updateExitConditions={updateExitConditions}
              showTabSelector={true}
              hasReEntryConditions={hasReEntryConditions}
              reEntryConditions={reEntryConditions}
              updateReEntryConditions={updateReEntryConditions}
              hasReEntryExitConditions={hasReEntryExitConditions}
              reEntryExitConditions={reEntryExitConditions}
              updateReEntryExitConditions={updateReEntryExitConditions}
              onReEntryToggle={handleReEntryToggle}
              onReEntryExitToggle={handleReEntryExitToggle}
              onCopyInitialConditions={copyInitialConditions}
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

export default memo(SignalNodeEditor);
