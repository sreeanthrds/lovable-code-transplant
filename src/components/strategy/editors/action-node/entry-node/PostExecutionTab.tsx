
import React from 'react';
import { Node } from '@xyflow/react';
import VariableManager from '../../shared/VariableManager';
import PositionVariableManager from '../../shared/PositionVariableManager';
import TrailingVariableManager from '../../shared/TrailingVariableManager';
import AlertToggle from '../../shared/AlertToggle';
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
    <div className="space-y-4">
      {/* Alert Toggle */}
      <AlertToggle
        enabled={alertNotification?.enabled || false}
        onToggle={handleAlertToggle}
        description="Send alert notification when this entry action is executed"
      />

      {/* Variables Section */}
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

      {/* Trailing Variables Section - Only for Entry Nodes */}
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
  );
};

export default PostExecutionTab;
