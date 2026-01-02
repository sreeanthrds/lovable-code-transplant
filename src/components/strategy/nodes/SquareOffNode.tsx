import React, { useMemo, memo } from 'react';
import { NodeProps } from '@xyflow/react';
import ActionNodeTemplate from './templates/ActionNodeTemplate';
import { getNodeIcon } from '../utils/nodes/nodeIcons';

const SquareOffNode: React.FC<NodeProps> = ({ id, data, selected, isConnectable, type, zIndex, dragging, draggable, selectable, deletable, positionAbsoluteX, positionAbsoluteY }) => {
  // Create a safe version of nodeData with default values for square-off node
  const nodeData = useMemo(() => {
    const rawData = data as Record<string, unknown>;
    
    return {
      label: (rawData.label as string) || 'Square off',
      actionType: 'exit' as const, // Use existing action type for compatibility
      icon: getNodeIcon('squareOff'),
      description: 'Close all positions and stop strategy',
      message: (rawData.message as string) || 'Strategy forcibly stopped - all positions closed'
    };
  }, [data]);

  return (
    <ActionNodeTemplate
      id={id}
      data={nodeData}
      selected={selected}
      isConnectable={isConnectable}
      type={type || 'squareOffNode'}
      zIndex={zIndex || 0}
      dragging={dragging || false}
    />
  );
};

export default memo(SquareOffNode);