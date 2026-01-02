
import React from 'react';
import { Node } from '@xyflow/react';
import VariableManager from '../../shared/VariableManager';
import AlertToggle from '../../shared/AlertToggle';
import { NodeVariable } from '../../../utils/conditions';

interface PostExecutionTabProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const PostExecutionTab: React.FC<PostExecutionTabProps> = ({
  node,
  updateNodeData
}) => {
  // Handle variables - fix initialization
  const variables: NodeVariable[] = Array.isArray(node.data?.variables) ? node.data.variables : [];
  
  const handleVariablesChange = (newVariables: NodeVariable[]) => {
    updateNodeData(node.id, {
      ...node.data,
      variables: newVariables
    });
  };

  // Handle alert toggle - properly type the alertNotification
  const alertNotification = node.data?.alertNotification as { enabled?: boolean } | undefined;
  const handleAlertToggle = (enabled: boolean) => {
    updateNodeData(node.id, {
      ...node.data,
      alertNotification: { enabled }
    });
  };

  return (
    <div className="space-y-4">
      {/* Alert Toggle */}
      <AlertToggle
        enabled={alertNotification?.enabled || false}
        onToggle={handleAlertToggle}
        description="Send alert notification when this exit action is executed"
      />

      {/* Variables Section */}
      <div className="space-y-4 bg-accent/5 rounded-md p-3">
        <VariableManager
          nodeId={node.id}
          variables={variables}
          onVariablesChange={handleVariablesChange}
        />
      </div>
    </div>
  );
};

export default PostExecutionTab;
