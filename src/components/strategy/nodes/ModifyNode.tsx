
import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import ActionNodeTemplate from './templates/ActionNodeTemplate';
import { Pencil } from 'lucide-react';
import { Position } from '@/components/strategy/types/position-types';

interface ModifyNodeData {
  label?: string;
  positions?: Position[];
  targetPositionId?: string;
  targetNodeId?: string;
  modifications?: Record<string, any>;
  [key: string]: any;
}

const ModifyNode: React.FC<NodeProps> = ({ id, data, selected, isConnectable, type, zIndex, dragging, draggable, selectable, deletable, positionAbsoluteX, positionAbsoluteY }) => {
  // Ensure data is properly structured with defaults
  const nodeData: ModifyNodeData = data || {};
  
  // Extract and transform the data safely
  const positions = Array.isArray(nodeData.positions) ? nodeData.positions : [];
  const targetPositionId = nodeData.targetPositionId ? String(nodeData.targetPositionId) : undefined;
  const targetNodeId = nodeData.targetNodeId ? String(nodeData.targetNodeId) : undefined;
  
  // If we have a target position ID but no positions array with that position,
  // create a positions array with a placeholder for the targeted position
  const targetPosition = targetPositionId ? 
    { vpi: targetPositionId, sourceNodeId: targetNodeId } as Position : 
    undefined;
  
  const nodePositions = targetPosition ? [targetPosition] : positions;
  
  // Explicitly provide typed data for the ActionNodeTemplate
  const templateData = {
    label: nodeData.label ? String(nodeData.label) : 'Modify Position',
    actionType: 'modify' as const,
    positions: nodePositions,
    targetPositionId: targetPositionId,
    targetNodeId: targetNodeId,
    modifications: nodeData.modifications || {},
    icon: <Pencil className="h-4 w-4 text-amber-500 mr-1.5" />,
    description: 'Modify an existing position'
  };

  return (
    <ActionNodeTemplate
      id={id}
      data={templateData}
      selected={selected}
      isConnectable={isConnectable}
      type={type || 'modifyNode'}
      zIndex={zIndex || 0}
      dragging={dragging || false}
    />
  );
};

export default memo(ModifyNode);
