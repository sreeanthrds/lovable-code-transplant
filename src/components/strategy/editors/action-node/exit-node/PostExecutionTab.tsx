
import React from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VariableManager from '../../shared/VariableManager';
import AlertToggle from '../../shared/AlertToggle';
import GlobalVariableAssignment from '../../shared/GlobalVariableAssignment';
import { NodeVariable } from '../../../utils/conditions';

interface PostExecutionTabProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const PostExecutionTab: React.FC<PostExecutionTabProps> = ({
  node,
  updateNodeData
}) => {
  const variables: NodeVariable[] = Array.isArray(node.data?.variables) ? node.data.variables : [];
  
  const handleVariablesChange = (newVariables: NodeVariable[]) => {
    updateNodeData(node.id, {
      ...node.data,
      variables: newVariables
    });
  };

  const alertNotification = node.data?.alertNotification as { enabled?: boolean } | undefined;
  const handleAlertToggle = (enabled: boolean) => {
    updateNodeData(node.id, {
      ...node.data,
      alertNotification: { enabled }
    });
  };

  return (
    <Tabs defaultValue="snapshot-variables" className="w-full">
      <TabsList className="grid grid-cols-2 mb-2">
        <TabsTrigger value="snapshot-variables" className="text-xs">Snapshot Variables</TabsTrigger>
        <TabsTrigger value="global-variables" className="text-xs">Global Variables</TabsTrigger>
      </TabsList>

      <TabsContent value="snapshot-variables" className="mt-0">
        <div className="space-y-4">
          <AlertToggle
            enabled={alertNotification?.enabled || false}
            onToggle={handleAlertToggle}
            description="Send alert notification when this exit action is executed"
          />
          <div className="space-y-4 bg-accent/5 rounded-md p-3">
            <VariableManager
              nodeId={node.id}
              variables={variables}
              onVariablesChange={handleVariablesChange}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="global-variables" className="mt-0">
        <GlobalVariableAssignment node={node} updateNodeData={updateNodeData} />
      </TabsContent>
    </Tabs>
  );
};

export default PostExecutionTab;
