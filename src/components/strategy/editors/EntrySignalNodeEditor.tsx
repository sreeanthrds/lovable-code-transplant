
import React, { memo } from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeDetailsPanel } from './shared';
import { useSignalNodeForm } from './signal-node/useSignalNodeForm';
import SignalNodeContent from './signal-node/SignalNodeContent';
import PostExecutionTab from './action-node/entry-node/PostExecutionTab';

interface EntrySignalNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const EntrySignalNodeEditor = ({ node, updateNodeData }: EntrySignalNodeEditorProps) => {
  const { 
    formData, 
    conditions,
    reEntryConditions,
    hasReEntryConditions,
    handleLabelChange, 
    updateConditions,
    updateReEntryConditions,
    handleReEntryToggle,
    copyInitialConditions
  } = useSignalNodeForm({ node, updateNodeData });

  const entrySignalNodeInfo = "Entry condition nodes detect specific market conditions to trigger entry actions in your strategy. Configure entry conditions in the Conditions tab and post-execution features in the Post-Execution tab.";

  return (
    <NodeDetailsPanel
      nodeId={node.id}
      nodeLabel={formData.label}
      onLabelChange={handleLabelChange}
      infoTooltip={entrySignalNodeInfo}
      additionalContent={
        <Tabs defaultValue="signals" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="signals">Conditions</TabsTrigger>
            <TabsTrigger value="post-execution">Post-Execution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signals">
            <SignalNodeContent
              conditions={conditions}
              updateConditions={updateConditions}
              conditionContext="entry"
              showTabSelector={false}
              hasReEntryConditions={hasReEntryConditions}
              reEntryConditions={reEntryConditions}
              updateReEntryConditions={updateReEntryConditions}
              onReEntryToggle={handleReEntryToggle}
              onCopyInitialConditions={copyInitialConditions}
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

export default memo(EntrySignalNodeEditor);
