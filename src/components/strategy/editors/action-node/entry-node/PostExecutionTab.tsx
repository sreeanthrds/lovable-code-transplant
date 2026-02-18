
import React from 'react';
import { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VariableManager from '../../shared/VariableManager';
import PositionVariableManager from '../../shared/PositionVariableManager';
import TrailingVariableManager from '../../shared/TrailingVariableManager';
import AlertToggle from '../../shared/AlertToggle';
import GlobalVariableAssignment from '../../shared/GlobalVariableAssignment';
import { NodeVariable } from '../../../utils/conditions';
import { TrailingVariable } from '../../../nodes/action-node/types';

interface PostExecutionTabProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const PostExecutionTab: React.FC<PostExecutionTabProps> = ({
  node,
  updateNodeData
}) => {
  // Handle variables
  const variables: NodeVariable[] = Array.isArray(node.data?.variables) ? node.data.variables : [];
  
  const handleVariablesChange = (newVariables: NodeVariable[]) => {
    updateNodeData(node.id, {
      ...node.data,
      variables: newVariables
    });
  };

  // Handle alert toggle
  const alertNotification = node.data?.alertNotification as { enabled?: boolean } | undefined;
  const handleAlertToggle = (enabled: boolean) => {
    updateNodeData(node.id, {
      ...node.data,
      alertNotification: { enabled }
    });
  };

  // Safely get positions array
  const positions = Array.isArray(node.data?.positions) ? node.data.positions : [];

  // Handle trailing variables
  const trailingVariables: TrailingVariable[] = Array.isArray(node.data?.trailingVariables) ? node.data.trailingVariables : [];
  
  const handleTrailingVariablesChange = (newTrailingVariables: TrailingVariable[]) => {
    updateNodeData(node.id, {
      ...node.data,
      trailingVariables: newTrailingVariables
    });
  };

  const handlePositionsChange = (newPositions: any[]) => {
    updateNodeData(node.id, {
      ...node.data,
      positions: newPositions
    });
  };

  return (
    <Tabs defaultValue="post-execution" className="w-full">
      <TabsList className="grid grid-cols-2 mb-2">
        <TabsTrigger value="post-execution" className="text-xs">Post-Execution</TabsTrigger>
        <TabsTrigger value="global-variables" className="text-xs">Global Variables</TabsTrigger>
      </TabsList>

      <TabsContent value="post-execution" className="mt-0">
        <div className="space-y-4">
          <AlertToggle
            enabled={alertNotification?.enabled || false}
            onToggle={handleAlertToggle}
            description="Send alert notification when this entry action is executed"
          />

          <div className="space-y-4 bg-accent/5 rounded-md p-3">
            {node.type === 'entryNode' ? (
              <PositionVariableManager
                nodeId={node.id}
                positions={positions}
                variables={variables}
                onVariablesChange={handleVariablesChange}
              />
            ) : (
              <VariableManager
                nodeId={node.id}
                variables={variables}
                onVariablesChange={handleVariablesChange}
              />
            )}
          </div>

          {node.type === 'entryNode' && (
            <div className="space-y-4 bg-accent/5 rounded-md p-3">
              <TrailingVariableManager
                nodeId={node.id}
                positions={positions}
                trailingVariables={trailingVariables}
                onTrailingVariablesChange={handleTrailingVariablesChange}
                onPositionsChange={handlePositionsChange}
              />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="global-variables" className="mt-0">
        <GlobalVariableAssignment node={node} updateNodeData={updateNodeData} />
      </TabsContent>
    </Tabs>
  );
};

export default PostExecutionTab;
